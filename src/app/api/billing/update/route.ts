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
    supabaseServiceKey
  )
}

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, newPriceId } = await request.json()

    if (!subscriptionId || !newPriceId) {
      return NextResponse.json(
        { error: 'Subscription ID and new price ID are required' },
        { status: 400 }
      )
    }

    // Get the user from the session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get pricing plan
    const { PRICING_PLANS } = await import('@/lib/pricing')
    const plan = PRICING_PLANS[newPriceId as keyof typeof PRICING_PLANS]

    if (!plan || !plan.paddlePriceId) {
      return NextResponse.json(
        { error: 'Invalid price plan' },
        { status: 400 }
      )
    }

    // Update Paddle subscription
    const paddleResponse = await fetch(`https://api.paddle.com/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            price_id: plan.paddlePriceId,
            quantity: 1,
          },
        ],
      }),
    })

    if (!paddleResponse.ok) {
      const error = await paddleResponse.text()
      console.error('Paddle API error:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    const paddleData = await paddleResponse.json()

    return NextResponse.json({
      success: true,
      subscriptionId: paddleData.data?.id,
      status: paddleData.data?.status,
      newPriceId: plan.paddlePriceId,
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
