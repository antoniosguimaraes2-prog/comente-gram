
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // GET request for webhook verification
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    const VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN')
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified')
      return new Response(challenge, { 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    } else {
      console.log('Webhook verification failed')
      return new Response('Forbidden', { 
        status: 403,
        headers: corsHeaders 
      })
    }
  }

  // POST request for webhook events
  if (req.method === 'POST') {
    try {
      const signature = req.headers.get('X-Hub-Signature-256')
      if (!signature) {
        throw new Error('Missing signature')
      }

      const body = await req.text()
      
      // Verify signature
      const META_APP_SECRET = Deno.env.get('META_APP_SECRET')
      if (!META_APP_SECRET) {
        throw new Error('META_APP_SECRET not configured')
      }

      const expectedSignature = await generateSignature(body, META_APP_SECRET)
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature')
      }

      const data = JSON.parse(body)
      
      // Process webhook data
      for (const entry of data.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'comments') {
            await processComment(change.value)
          }
        }
      }

      return new Response('OK', { 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })

    } catch (error) {
      console.error('Webhook processing error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
        },
      )
    }
  }

  return new Response('Method not allowed', { 
    status: 405,
    headers: corsHeaders 
  })
})

async function generateSignature(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  )
  
  const hashArray = Array.from(new Uint8Array(signature))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return `sha256=${hashHex}`
}

async function processComment(commentData: any) {
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const mediaId = commentData.media?.id
    const commentId = commentData.id
    const commentText = commentData.text
    const fromUserId = commentData.from?.id
    const fromUsername = commentData.from?.username

    if (!mediaId || !commentText || !fromUserId) {
      console.log('Incomplete comment data')
      return
    }

    // Find active post/campaign for this media_id
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        keywords!inner(*),
        accounts!inner(*)
      `)
      .eq('media_id', mediaId)
      .eq('active_bool', true)
      .single()

    if (postError || !post) {
      console.log(`No active campaign found for media_id: ${mediaId}`)
      return
    }

    // Normalize comment text
    const normalizedText = normalizeText(commentText)
    
    // Find matching keywords
    const matchedKeywords = post.keywords.filter((keyword: any) => 
      keyword.active_bool && normalizedText.includes(keyword.word.toLowerCase())
    )

    if (matchedKeywords.length === 0) {
      console.log('No keywords matched')
      return
    }

    // Use first matched keyword
    const matchedKeyword = matchedKeywords[0]

    // Check if we already sent a DM to this user in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: recentMessage } = await supabase
      .from('messages')
      .select('id')
      .eq('post_id', post.id)
      .eq('ig_user_id', fromUserId)
      .gte('created_at', oneDayAgo)
      .single()

    if (recentMessage) {
      console.log(`Already sent DM to user ${fromUserId} in last 24h`)
      return
    }

    // Save comment
    const { error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        ig_user_id: fromUserId,
        ig_username: fromUsername,
        text: commentText,
        commented_at: new Date().toISOString(),
        matched_keyword_id: matchedKeyword.id,
      })

    if (commentError) {
      console.error('Error saving comment:', commentError)
    }

    // Queue DM sending
    await sendDM(post, matchedKeyword, fromUserId, fromUsername, supabase)

  } catch (error) {
    console.error('Error processing comment:', error)
  }
}

async function sendDM(post: any, keyword: any, userId: string, username: string, supabase: any) {
  try {
    // Get decrypted access token
    const accessToken = atob(post.accounts.access_token_encrypted)
    
    // Parse DM template
    let message = post.dm_template || 'Obrigado pelo seu comentário!'
    message = message.replace('{first_name}', username || 'amigo')
    message = message.replace('{link}', `https://www.instagram.com/p/${post.media_id}/`)

    // Send DM via Instagram API
    const dmResponse = await fetch(
      `https://graph.facebook.com/v18.0/${post.accounts.ig_business_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: userId },
          message: { text: message },
          access_token: accessToken,
        }),
      }
    )

    const dmResult = await dmResponse.json()
    
    // Save message result
    const messageData = {
      post_id: post.id,
      keyword_id: keyword.id,
      ig_user_id: userId,
      ig_username: username,
      status: dmResponse.ok ? 'SENT' : 'ERROR',
      error_text: dmResponse.ok ? null : (dmResult.error?.message || 'Unknown error'),
      sent_at: dmResponse.ok ? new Date().toISOString() : null,
    }

    const { error: messageError } = await supabase
      .from('messages')
      .insert(messageData)

    if (messageError) {
      console.error('Error saving message:', messageError)
    }

    console.log(`DM ${dmResponse.ok ? 'sent' : 'failed'} to ${username}`)

  } catch (error) {
    console.error('Error sending DM:', error)
    
    // Save error message
    await supabase
      .from('messages')
      .insert({
        post_id: post.id,
        keyword_id: keyword.id,
        ig_user_id: userId,
        ig_username: username,
        status: 'ERROR',
        error_text: error.message,
      })
  }
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, ' ') // Replace non-word chars with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
}
