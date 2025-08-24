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
    const { name, accountId, postUrl, keywords, dmTemplate, listenAllComments, messageType, linkUrl, buttons } = await req.json()

    if (!name || !postUrl || !dmTemplate) {
      throw new Error('Missing required fields')
    }

    if (!listenAllComments && (!keywords || keywords.length === 0)) {
      throw new Error('Keywords required when not listening to all comments')
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

    // Get user's account (either specified accountId or default account)
    let account;
    if (accountId) {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', accountId)
        .single()
      
      if (error || !data) {
        throw new Error('Invalid account selection')
      }
      account = data;
    } else {
      // Fallback to first account
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        throw new Error('Instagram account not connected')
      }
      account = data;
    }

    // Extract media_id from Instagram URL
    const mediaId = extractMediaIdFromUrl(postUrl)
    if (!mediaId) {
      throw new Error('Invalid Instagram post URL')
    }

    // Get access token
    const accessToken = atob(account.access_token_encrypted)

    // Fetch post data from Instagram
    const postResponse = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}?fields=id,caption,media_url,thumbnail_url,timestamp&access_token=${accessToken}`
    )

    const postData = await postResponse.json()
    
    if (!postResponse.ok) {
      throw new Error(postData.error?.message || 'Failed to fetch post data')
    }

    // Create or update post in database
    const { data: post, error: postError } = await supabase
      .from('posts')
      .upsert({
        account_id: account.id,
        media_id: mediaId,
        name: name, // Add the automation name
        caption: postData.caption || null,
        thumbnail_url: postData.thumbnail_url || postData.media_url || null,
        posted_at: postData.timestamp || null,
        active_bool: true,
        dm_template: dmTemplate,
        listen_all_comments: listenAllComments || false,
        message_type: messageType || 'simple',
      })
      .select()
      .single()

    if (postError) {
      throw new Error(`Failed to save post: ${postError.message}`)
    }

    // Delete existing keywords for this post
    await supabase
      .from('keywords')
      .delete()
      .eq('post_id', post.id)

    // Insert keywords only if not listening to all comments
    if (!listenAllComments && keywords && keywords.length > 0) {
      const keywordInserts = keywords.map((word: string) => ({
        post_id: post.id,
        word: word.toLowerCase().trim(),
        active_bool: true,
      }))

      const { error: keywordsError } = await supabase
        .from('keywords')
        .insert(keywordInserts)

      if (keywordsError) {
        throw new Error(`Failed to save keywords: ${keywordsError.message}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        mediaId: mediaId,
        postId: post.id,
        name: name,
        message: 'Campaign created successfully'
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )

  } catch (error) {
    console.error('Create campaign error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create campaign' 
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

function extractMediaIdFromUrl(url: string): string | null {
  // Instagram post URL patterns:
  // https://www.instagram.com/p/ABC123DEF/
  // https://instagram.com/p/ABC123DEF/
  const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([A-Za-z0-9_-]+)\/?/
  const match = url.match(regex)
  return match ? match[1] : null
}
