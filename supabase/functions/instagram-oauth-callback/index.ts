
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    
    if (!code) {
      throw new Error('Authorization code not received')
    }

    const META_APP_ID = Deno.env.get('META_APP_ID')
    const META_APP_SECRET = Deno.env.get('META_APP_SECRET')
    
    if (!META_APP_ID || !META_APP_SECRET) {
      throw new Error('Meta app credentials not configured')
    }

    // Get auth header to identify user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header  
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid auth token')
    }

    // Exchange code for access token
    const redirectUri = `${req.headers.get('origin')}/api/auth/instagram/callback`
    
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: redirectUri,
        code: code,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      throw new Error(tokenData.error?.message || 'Failed to exchange token')
    }

    // Get long-lived token
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${META_APP_ID}&` +
      `client_secret=${META_APP_SECRET}&` +
      `fb_exchange_token=${tokenData.access_token}`
    )

    const longLivedData = await longLivedResponse.json()
    
    if (!longLivedResponse.ok) {
      throw new Error('Failed to get long-lived token')
    }

    // Get user's pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedData.access_token}`
    )
    
    const pagesData = await pagesResponse.json()
    
    if (!pagesResponse.ok) {
      throw new Error('Failed to get pages')
    }

    // Find Instagram Business account for each page
    let selectedAccount = null
    
    for (const page of pagesData.data) {
      try {
        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        )
        
        const igData = await igResponse.json()
        
        if (igData.instagram_business_account) {
          selectedAccount = {
            page_id: page.id,
            page_access_token: page.access_token,
            ig_business_id: igData.instagram_business_account.id,
          }
          break
        }
      } catch (error) {
        console.log(`No Instagram account for page ${page.id}`)
      }
    }

    if (!selectedAccount) {
      throw new Error('No Instagram Business account found. Make sure your Instagram is connected to a Facebook Page.')
    }

    // Encrypt the access token (simple base64 for demo - use proper encryption in production)
    const encryptedToken = btoa(selectedAccount.page_access_token)

    // Save to database
    const { error: dbError } = await supabase
      .from('accounts')
      .upsert({
        user_id: user.id,
        page_id: selectedAccount.page_id,
        ig_business_id: selectedAccount.ig_business_id,
        access_token_encrypted: encryptedToken,
        connected_at: new Date().toISOString(),
      })

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    // Redirect back to app
    const redirectUrl = `${req.headers.get('origin')}/connect-instagram?success=true`
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    })

  } catch (error) {
    console.error('OAuth callback error:', error)
    
    const redirectUrl = `${req.headers.get('origin')}/connect-instagram?error=${encodeURIComponent(error.message)}`
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    })
  }
})
