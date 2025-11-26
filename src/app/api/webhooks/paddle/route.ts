import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify Paddle webhook signature
function verifyPaddleWebhook(payload: string, signature: string): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) return false

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

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionChange(eventData)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(eventData)
        break

      case 'payment.succeeded':
        await handlePaymentSucceeded(eventData)
        break

      case 'payment.failed':
        await handlePaymentFailed(eventData)
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

async function handleSubscriptionChange(subscriptionData: any) {
  try {
    const userId = subscriptionData.custom_data?.user_id
    const priceId = subscriptionData.custom_data?.price_id
    const paddleSubscriptionId = subscriptionData.id
    const paddleCustomerId = subscriptionData.customer_id
    const status = subscriptionData.status

    if (!userId) {
      console.error('No user ID in subscription data')
      return
    }

    // Get pricing plan from price ID
    const { PRICING_PLANS } = await import('@/lib/pricing')
    const plan = PRICING_PLANS[priceId as keyof typeof PRICING_PLANS]

    if (!plan) {
      console.error('Invalid price ID:', priceId)
      return
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: plan.priceId,
        paddle_customer_id: paddleCustomerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return
    }

    // Update or create subscription record
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        paddle_subscription_id: paddleSubscriptionId,
        paddle_customer_id: paddleCustomerId,
        status: status,
        price_id: plan.priceId,
        paddle_price_id: plan.paddlePriceId,
        current_period_start: subscriptionData.current_period_start,
        current_period_end: subscriptionData.current_period_end,
        cancel_at_period_end: subscriptionData.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError)
    }

    console.log('Subscription updated successfully')
  } catch (error) {
    console.error('Error handling subscription change:', error)
  }
}

async function handleSubscriptionCancelled(subscriptionData: any) {
  try {
    const userId = subscriptionData.custom_data?.user_id
    const paddleSubscriptionId = subscriptionData.id

    if (!userId) {
      console.error('No user ID in subscription data')
      return
    }

    // Update user profile to free tier
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return
    }

    // Update subscription record
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('paddle_subscription_id', paddleSubscriptionId)

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError)
    }

    console.log('Subscription cancelled successfully')
  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
  }
}

async function handlePaymentSucceeded(paymentData: any) {
  try {
    console.log('Payment succeeded:', paymentData)
    // You can add additional logic here for payment success handling
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(paymentData: any) {
  try {
    console.log('Payment failed:', paymentData)
    // You can add additional logic here for payment failure handling
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}
