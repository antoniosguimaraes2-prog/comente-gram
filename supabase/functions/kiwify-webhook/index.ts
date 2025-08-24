import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kiwify-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface KiwifyWebhookPayload {
  event: string;
  data: {
    id: string;
    status: 'approved' | 'refused' | 'chargeback' | 'refunded' | 'pending';
    payment_method: string;
    amount: number;
    customer: {
      email: string;
      name: string;
    };
    product: {
      id: string;
      name: string;
    };
    metadata: {
      internal_payment_id: string;
      user_id: string;
      plan_name: string;
      billing_cycle: string;
    };
    created_at: string;
    approved_at?: string;
  };
}

async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === expectedHex;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

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
    const body = await req.text();
    const signature = req.headers.get('x-kiwify-signature');
    const webhookSecret = Deno.env.get('KIWIFY_WEBHOOK_SECRET');

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = await verifyWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response('Invalid signature', { 
          status: 401, 
          headers: corsHeaders 
        });
      }
    }

    const payload: KiwifyWebhookPayload = JSON.parse(body);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Received webhook:', payload.event, payload.data.status);

    // Process different webhook events
    switch (payload.event) {
      case 'payment.approved':
      case 'payment.created':
        await handlePaymentUpdate(supabase, payload);
        break;
      case 'payment.refused':
      case 'payment.chargeback':
      case 'payment.refunded':
        await handlePaymentFailure(supabase, payload);
        break;
      default:
        console.log('Unhandled webhook event:', payload.event);
    }

    return new Response('OK', { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Webhook error:', error);
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

async function handlePaymentUpdate(supabase: any, payload: KiwifyWebhookPayload) {
  const { data, metadata } = payload.data;
  
  try {
    // Update payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: data.status,
        kiwify_payment_id: data.id,
        payment_method: data.payment_method,
        approved_at: data.approved_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', metadata.internal_payment_id);

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
      return;
    }

    // If payment is approved, activate user subscription
    if (data.status === 'approved') {
      await activateUserSubscription(supabase, metadata, data);
    }

  } catch (error) {
    console.error('Error handling payment update:', error);
  }
}

async function handlePaymentFailure(supabase: any, payload: KiwifyWebhookPayload) {
  const { data, metadata } = payload.data;
  
  try {
    // Update payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: data.status,
        kiwify_payment_id: data.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', metadata.internal_payment_id);

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
      return;
    }

    // If payment failed/refunded, deactivate user subscription
    if (data.status === 'refused' || data.status === 'chargeback' || data.status === 'refunded') {
      await deactivateUserSubscription(supabase, metadata.user_id);
    }

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function activateUserSubscription(supabase: any, metadata: any, paymentData: any) {
  try {
    // Calculate subscription end date based on billing cycle
    const startDate = new Date();
    const endDate = new Date();
    
    if (metadata.billing_cycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create or update user subscription
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: metadata.user_id,
        plan_name: metadata.plan_name,
        billing_cycle: metadata.billing_cycle,
        status: 'active',
        started_at: startDate.toISOString(),
        expires_at: endDate.toISOString(),
        kiwify_payment_id: paymentData.id,
        updated_at: new Date().toISOString()
      });

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      return;
    }

    // Update user profile to mark as premium
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        plan_name: metadata.plan_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', metadata.user_id);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
    }

    console.log('User subscription activated:', metadata.user_id, metadata.plan_name);

  } catch (error) {
    console.error('Error activating subscription:', error);
  }
}

async function deactivateUserSubscription(supabase: any, userId: string) {
  try {
    // Update subscription status
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (subscriptionError) {
      console.error('Error deactivating subscription:', subscriptionError);
      return;
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
    }

    console.log('User subscription deactivated:', userId);

  } catch (error) {
    console.error('Error deactivating subscription:', error);
  }
}
