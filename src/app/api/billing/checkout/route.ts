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
  console.log('=== CHECKOUT API ROUTE CALLED ===')
  try {
    const { priceId, customerEmail } = await request.json()

    console.log('Checkout request:', { priceId, customerEmail })

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Get pricing plan
    const { PRICING_PLANS } = await import('@/lib/pricing')
    
    console.log('Available plans:', Object.keys(PRICING_PLANS))
    
    const plan = PRICING_PLANS[priceId as keyof typeof PRICING_PLANS]

    console.log('Plan found:', { plan: plan?.name, paddlePriceId: plan?.paddlePriceId, requestedPriceId: priceId })

    if (!plan || !plan.paddlePriceId) {
      console.error('Plan not found or missing paddlePriceId:', { priceId, plan })
      return NextResponse.json(
        { 
          error: 'Invalid price plan', 
          details: `Plan not found or paddlePriceId not configured for priceId: ${priceId}. Please configure Paddle price IDs in your pricing configuration.` 
        },
        { status: 400 }
      )
    }

    // Create Paddle checkout session with new API
    const paddleApiKey = process.env.PADDLE_API_KEY
    const paddleEnvironment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox'
    
    console.log('Paddle config:', { 
      hasApiKey: !!paddleApiKey, 
      apiKeyPrefix: paddleApiKey?.substring(0, 20),
      environment: paddleEnvironment 
    })
    
    if (!paddleApiKey) {
      throw new Error('Paddle API key is missing')
    }

    // Use Paddle API v2 (new version)
    const paddleBaseUrl = paddleEnvironment === 'sandbox' 
      ? 'https://sandbox-api.paddle.com' 
      : 'https://api.paddle.com'

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mysaas-pearl.vercel.app'
    
    const checkoutData = {
      items: [
        {
          price_id: plan.paddlePriceId,
          quantity: 1
        }
      ],
      customer_email: customerEmail,
      business: {
        name: 'MySaaS Business'
      },
      custom_data: {
        userId: 'user-id-placeholder', // You'll need to get this from auth
        priceId: priceId
      },
      checkout: {
        return_url: process.env.PADDLE_RETURN_URL || `${baseUrl}/billing?success=true`,
        success_url: process.env.PADDLE_RETURN_URL || `${baseUrl}/billing?success=true`,
        cancel_url: process.env.PADDLE_CANCEL_URL || `${baseUrl}/billing?canceled=true`
      }
    }

    console.log('Creating Paddle checkout with data:', checkoutData)
    console.log('Paddle API URL:', `${paddleBaseUrl}/checkout/sessions`)
    console.log('Paddle API Key (first 10 chars):', paddleApiKey.substring(0, 10))

    const paddleResponse = await fetch(`${paddleBaseUrl}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paddleApiKey}`,
      },
      body: JSON.stringify(checkoutData),
    })

    console.log('Paddle API response status:', paddleResponse.status)

    if (!paddleResponse.ok) {
      const errorText = await paddleResponse.text()
      console.error('Paddle API error response:', errorText)
      console.error('Request data sent:', checkoutData)
      
      // Try to parse as JSON for better error handling
      let errorDetails
      try {
        errorDetails = JSON.parse(errorText)
      } catch {
        errorDetails = errorText
      }
      
      return NextResponse.json(
        { error: 'Failed to create Paddle checkout', details: errorDetails },
        { status: 500 }
      )
    }

    const paddleResult = await paddleResponse.json()
    console.log('Paddle checkout created:', paddleResult)

    return NextResponse.json({
      checkoutUrl: paddleResult.data.url,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
