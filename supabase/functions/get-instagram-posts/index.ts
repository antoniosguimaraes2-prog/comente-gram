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

    // Get user's Instagram account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      throw new Error('Instagram account not connected')
    }

    // Get access token
    const accessToken = atob(account.access_token_encrypted)

    // Fetch Instagram posts from Graph API
    const postsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.ig_business_id}/media?fields=id,caption,media_url,thumbnail_url,media_type,timestamp&limit=20&access_token=${accessToken}`
    )

    const postsData = await postsResponse.json()
    
    if (!postsResponse.ok) {
      throw new Error(postsData.error?.message || 'Failed to fetch Instagram posts')
    }

    // Filter and format posts
    const posts = (postsData.data || []).map((post: any) => ({
      id: post.id,
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url,
      caption: post.caption,
      media_type: post.media_type,
      timestamp: post.timestamp
    }))

    return new Response(
      JSON.stringify({ 
        success: true,
        posts: posts,
        total: posts.length
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )

  } catch (error) {
    console.error('Get Instagram posts error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch Instagram posts' 
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
