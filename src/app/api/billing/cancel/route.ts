import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are missing')
  }

  return createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    const paddleApiKey = process.env.PADDLE_API_KEY
    const paddleEnvironment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox'
    
    if (!paddleApiKey) {
      throw new Error('Paddle API key is missing')
    }

    const paddleBaseUrl = paddleEnvironment === 'sandbox' 
      ? 'https://sandbox-api.paddle.com' 
      : 'https://api.paddle.com'

    // Cancel the subscription in Paddle
    const paddleResponse = await fetch(`${paddleBaseUrl}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paddleApiKey}`,
        'Paddle-Version': '1',
      },
      body: JSON.stringify({
        effective_from: 'immediately' // or 'next_billing_period'
      }),
    })

    if (!paddleResponse.ok) {
      const errorText = await paddleResponse.text()
      console.error('Paddle cancel error:', errorText)
      
      let errorDetails
      try {
        errorDetails = JSON.parse(errorText)
      } catch {
        errorDetails = errorText
      }
      
      return NextResponse.json(
        { error: 'Failed to cancel subscription', details: errorDetails },
        { status: 500 }
      )
    }

    const result = await paddleResponse.json()
    console.log('Subscription cancelled:', result)

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully'
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
