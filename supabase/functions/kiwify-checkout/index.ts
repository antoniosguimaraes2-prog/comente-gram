import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CheckoutRequest {
  planName: string;
  planPrice: number;
  billingCycle: 'monthly' | 'annual';
  customerEmail?: string;
  customerName?: string;
  userId?: string;
}

interface KiwifyCheckoutResponse {
  id: string;
  checkout_url: string;
  status: string;
}

const KIWIFY_PRODUCT_IDS = {
  'Starter': 'I3yr8ml',
  'Professional': 'p3DiSE2', 
  'Enterprise': 'YFtrvqI'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { planName, planPrice, billingCycle, customerEmail, customerName, userId }: CheckoutRequest = await req.json();

    // Validate required fields
    if (!planName || !planPrice || !billingCycle) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: planName, planPrice, billingCycle' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Kiwify product ID
    const productId = KIWIFY_PRODUCT_IDS[planName as keyof typeof KIWIFY_PRODUCT_IDS];
    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a pending payment record
    const { data: paymentRecord, error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        plan_name: planName,
        plan_price: planPrice,
        billing_cycle: billingCycle,
        status: 'pending',
        customer_email: customerEmail,
        customer_name: customerName,
        kiwify_product_id: productId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare Kiwify checkout data
    const kiwifyApiToken = Deno.env.get('KIWIFY_API_TOKEN');
    if (!kiwifyApiToken) {
      return new Response(
        JSON.stringify({ error: 'Kiwify API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const checkoutData = {
      product_id: productId,
      customer: {
        email: customerEmail || '',
        name: customerName || '',
      },
      billing: {
        amount: planPrice * 100, // Kiwify expects cents
        installments: 1,
      },
      metadata: {
        internal_payment_id: paymentRecord.id,
        user_id: userId,
        plan_name: planName,
        billing_cycle: billingCycle
      },
      success_url: `${req.headers.get('origin')}/checkout/success?payment_id=${paymentRecord.id}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      notification_url: `${supabaseUrl}/functions/v1/kiwify-webhook`
    };

    // Create checkout session with Kiwify
    const kiwifyResponse = await fetch('https://api.kiwify.com.br/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kiwifyApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData)
    });

    if (!kiwifyResponse.ok) {
      const errorText = await kiwifyResponse.text();
      console.error('Kiwify API error:', errorText);
      
      // Update payment record with error
      await supabase
        .from('payments')
        .update({ 
          status: 'failed',
          error_message: `Kiwify API error: ${errorText}`
        })
        .eq('id', paymentRecord.id);

      return new Response(
        JSON.stringify({ error: 'Failed to create checkout session', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const kiwifyCheckout: KiwifyCheckoutResponse = await kiwifyResponse.json();

    // Update payment record with Kiwify checkout info
    await supabase
      .from('payments')
      .update({ 
        kiwify_checkout_id: kiwifyCheckout.id,
        checkout_url: kiwifyCheckout.checkout_url
      })
      .eq('id', paymentRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: kiwifyCheckout.checkout_url,
        payment_id: paymentRecord.id,
        kiwify_checkout_id: kiwifyCheckout.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
