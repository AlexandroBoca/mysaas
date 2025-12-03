import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

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

// Verify Paddle webhook signature with new API
function verifyPaddleWebhook(payload: string, signature: string): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) {
    console.error('PADDLE_WEBHOOK_SECRET is not configured')
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('paddle-signature')

    if (!signature) {
      console.error('Missing Paddle signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Verify webhook signature
    if (!verifyPaddleWebhook(body, signature)) {
      console.error('Invalid Paddle signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    console.log('Paddle webhook event:', event)

    const eventType = event.event_type
    const eventData = event.data

    const supabase = createSupabaseServerClient()

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.activated':
        await handleSubscriptionCreated(supabase, eventData)
        break

      case 'subscription.updated':
        await handleSubscriptionUpdated(supabase, eventData)
        break

      case 'subscription.canceled':
        await handleSubscriptionCanceled(supabase, eventData)
        break

      case 'payment.succeeded':
        await handlePaymentSucceeded(supabase, eventData)
        break

      case 'transaction.completed':
        await handleTransactionCompleted(supabase, eventData)
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(supabase: any, subscription: any) {
  console.log('Creating subscription:', subscription.id)

  // Update or create user profile with subscription info
  const planTier = await getPlanFromPriceId(subscription.items[0]?.price?.id)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: subscription.customer_id,
      customer_id: subscription.customer_id,
      subscription_tier: planTier,
      updated_at: new Date().toISOString()
    })

  if (profileError) {
    console.error('Error updating profile:', profileError)
  }

  // Create subscription record
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .upsert({
      subscription_id: subscription.id,
      user_id: subscription.customer_id,
      customer_id: subscription.customer_id,
      status: subscription.status,
      price_id: subscription.items[0]?.price?.id,
      provider_price_id: subscription.items[0]?.price?.id,
      quantity: subscription.items[0]?.quantity || 1,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      trial_end: subscription.trial_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at,
      ended_at: subscription.ended_at,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at
    })

  if (subscriptionError) {
    console.error('Error creating subscription:', subscriptionError)
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  console.log('Updating subscription:', subscription.id)

  // Update subscription record
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      trial_end: subscription.trial_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at,
      ended_at: subscription.ended_at,
      updated_at: subscription.updated_at
    })
    .eq('subscription_id', subscription.id)

  if (subscriptionError) {
    console.error('Error updating subscription:', subscriptionError)
  }

  // Update profile subscription tier if changed
  if (subscription.items && subscription.items[0]) {
    const planTier = await getPlanFromPriceId(subscription.items[0].price.id)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: planTier,
        updated_at: new Date().toISOString()
      })
      .eq('customer_id', subscription.customer_id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
    }
  }
}

async function handleSubscriptionCanceled(supabase: any, subscription: any) {
  console.log('Canceling subscription:', subscription.id)

  // Update subscription record
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: subscription.canceled_at,
      updated_at: subscription.updated_at
    })
    .eq('subscription_id', subscription.id)

  if (subscriptionError) {
    console.error('Error canceling subscription:', subscriptionError)
  }

  // Update profile to free tier
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', subscription.customer_id)

  if (profileError) {
    console.error('Error updating profile:', profileError)
  }
}

async function handlePaymentSucceeded(supabase: any, payment: any) {
  console.log('Payment succeeded:', payment.id)

  // You can add payment success handling here
  // For example, sending confirmation emails, updating usage metrics, etc.
}

async function handleTransactionCompleted(supabase: any, transaction: any) {
  console.log('Transaction completed:', transaction.id)

  // Handle one-time payments if needed
  // For subscriptions, the main handling is done in subscription events
}

async function getPlanFromPriceId(priceId: string): Promise<string> {
  // Map Paddle price IDs to your internal plan names
  const { PRICING_PLANS } = await import('@/lib/pricing')
  
  for (const [planKey, plan] of Object.entries(PRICING_PLANS)) {
    if (plan.paddlePriceId === priceId) {
      return planKey
    }
  }
  
  return 'free' // Default fallback
}
