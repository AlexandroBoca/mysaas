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
    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mysaas-pearl.vercel.app'
    
    // Create customer portal session with new API
    const paddleResponse = await fetch(`${paddleBaseUrl}/customer-portal/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paddleApiKey}`,
      },
      body: JSON.stringify({
        customer: customerId,
        return_url: process.env.PADDLE_RETURN_URL || `${baseUrl}/billing`
      }),
    })

    if (!paddleResponse.ok) {
      const errorText = await paddleResponse.text()
      console.error('Paddle portal error:', errorText)
      
      let errorDetails
      try {
        errorDetails = JSON.parse(errorText)
      } catch {
        errorDetails = errorText
      }
      
      return NextResponse.json(
        { error: 'Failed to create portal session', details: errorDetails },
        { status: 500 }
      )
    }

    const result = await paddleResponse.json()
    console.log('Portal session created:', result)

    return NextResponse.json({
      portalUrl: result.data.url
    })
  } catch (error) {
    console.error('Customer portal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
