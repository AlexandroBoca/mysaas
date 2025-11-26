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
    const { priceId, customerEmail } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
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
    const plan = PRICING_PLANS[priceId as keyof typeof PRICING_PLANS]

    if (!plan || !plan.paddlePriceId) {
      return NextResponse.json(
        { error: 'Invalid price plan' },
        { status: 400 }
      )
    }

    // Create Paddle checkout session
    const paddleResponse = await fetch('https://api.paddle.com/checkout/sessions', {
      method: 'POST',
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
        customer_email: customerEmail || user.email,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
        custom_data: {
          user_id: user.id,
          price_id: priceId,
        },
      }),
    })

    if (!paddleResponse.ok) {
      const error = await paddleResponse.text()
      console.error('Paddle API error:', error)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    const paddleData = await paddleResponse.json()

    return NextResponse.json({
      checkoutUrl: paddleData.data?.checkout_url,
      sessionId: paddleData.data?.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
