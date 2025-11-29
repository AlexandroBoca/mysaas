import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Twitter OAuth endpoints
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/scheduler?error=${encodeURIComponent(error)}`
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/scheduler?error=missing_code_or_state`
    )
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter`,
        code_verifier: 'challenge-code', // This should come from the OAuth flow
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    // Get user profile from Twitter
    const profileResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=username,name,profile_image_url', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    const profileData = await profileResponse.json()

    // Store in database
    const { error: dbError } = await supabase
      .from('social_accounts')
      .insert({
        user_id: state, // This should be the user ID from the OAuth state
        platform: 'twitter',
        platform_user_id: profileData.data.id,
        username: profileData.data.username,
        display_name: profileData.data.name,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
      })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/scheduler?platform=twitter&success=true`
    )

  } catch (error) {
    console.error('Twitter OAuth error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/scheduler?platform=twitter&error=${encodeURIComponent('Authentication failed')}`
    )
  }
}
