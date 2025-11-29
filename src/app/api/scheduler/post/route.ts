import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PlatformResult {
  success: boolean
  postId?: string
  error?: string
  response: any
}

// Post content to social media platforms
export async function POST(request: NextRequest) {
  try {
    const { postId, platforms, content, scheduledDate, scheduledTime } = await request.json()

    if (!postId || !platforms || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the scheduled post
    const { data: post, error: postError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const results = []

    // Post to each platform
    for (const platform of platforms) {
      try {
        // Get the user's social account for this platform
        const { data: account, error: accountError } = await supabase
          .from('social_accounts')
          .select('*')
          .eq('user_id', post.user_id)
          .eq('platform', platform)
          .eq('is_active', true)
          .single()

        if (accountError || !account) {
          results.push({
            platform,
            status: 'failed',
            error: 'No connected account found'
          })
          continue
        }

        // Check if token needs refresh
        let accessToken = account.access_token
        if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
          accessToken = await refreshAccessToken(platform, account.refresh_token)
        }

        // Post to platform
        const platformResult = await postToPlatform(platform, content, accessToken)
        
        // Record execution
        await supabase
          .from('post_executions')
          .insert({
            scheduled_post_id: postId,
            platform: platform,
            platform_post_id: platformResult.postId || null,
            status: platformResult.success ? 'posted' : 'failed',
            response_data: platformResult.response,
            error_message: platformResult.error,
          })

        results.push({
          platform,
          status: platformResult.success ? 'posted' : 'failed',
          postId: platformResult.postId || null,
          error: platformResult.error
        })

      } catch (error) {
        console.error(`Error posting to ${platform}:`, error)
        
        await supabase
          .from('post_executions')
          .insert({
            scheduled_post_id: postId,
            platform: platform,
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })

        results.push({
          platform,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Update post status
    const allSuccessful = results.every(r => r.status === 'posted')
    const someSuccessful = results.some(r => r.status === 'posted')

    await supabase
      .from('scheduled_posts')
      .update({
        status: allSuccessful ? 'posted' : (someSuccessful ? 'posted' : 'failed'),
        posted_at: allSuccessful ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Post scheduling error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function refreshAccessToken(platform: string, refreshToken: string): Promise<string> {
  // Implementation for refreshing access tokens
  // This varies by platform and would need specific implementation
  throw new Error('Token refresh not implemented')
}

async function postToPlatform(platform: string, content: string, accessToken: string) {
  switch (platform) {
    case 'linkedin':
      return await postToLinkedIn(content, accessToken)
    case 'twitter':
      return await postToTwitter(content, accessToken)
    case 'instagram':
      return await postToInstagram(content, accessToken)
    case 'facebook':
      return await postToFacebook(content, accessToken)
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

async function postToLinkedIn(content: string, accessToken: string): Promise<PlatformResult> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author: `urn:li:person:YOUR_LINKEDIN_ID`, // This should come from the connected account
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'LinkedIn API error',
        response: data
      }
    }

    return {
      success: true,
      postId: data.id,
      response: data
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      response: null
    }
  }
}

async function postToTwitter(content: string, accessToken: string): Promise<PlatformResult> {
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || 'Twitter API error',
        response: data
      }
    }

    return {
      success: true,
      postId: data.data.id,
      response: data
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      response: null
    }
  }
}

async function postToInstagram(content: string, accessToken: string): Promise<PlatformResult> {
  // Instagram requires media upload first, then caption
  // This is a simplified version
  try {
    // For text-only posts, Instagram requires media
    // This would need to be implemented with media upload
    return {
      success: false,
      error: 'Instagram posts require media content',
      response: null
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      response: null
    }
  }
}

async function postToFacebook(content: string, accessToken: string): Promise<PlatformResult> {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        access_token: accessToken
      }),
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Facebook API error',
        response: data
      }
    }

    return {
      success: true,
      postId: data.id,
      response: data
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      response: null
    }
  }
}
