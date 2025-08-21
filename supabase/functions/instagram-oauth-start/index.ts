
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const META_APP_ID = Deno.env.get('META_APP_ID')
    if (!META_APP_ID) {
      throw new Error('META_APP_ID not configured')
    }

    // Generate secure state parameter
    const state = crypto.randomUUID()
    
    // Instagram OAuth URL with required permissions
    const permissions = [
      'instagram_manage_messages',
      'instagram_manage_comments', 
      'pages_show_list',
      'pages_manage_metadata'
    ].join(',')

    const redirectUri = `${req.headers.get('origin')}/api/auth/instagram/callback`
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${META_APP_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(permissions)}&` +
      `response_type=code&` +
      `state=${state}`

    return new Response(
      JSON.stringify({ 
        authUrl,
        state 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  } catch (error) {
    console.error('OAuth start error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to start OAuth flow' 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})
