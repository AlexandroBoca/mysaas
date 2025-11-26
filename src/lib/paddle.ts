// Paddle configuration and utilities
import { initializePaddle } from '@paddle/paddle-js'

export interface PaddleConfig {
  vendorId: number
  environment: 'sandbox' | 'production'
  apiKey: string
  secretKey: string
}

export const paddleConfig: PaddleConfig = {
  vendorId: parseInt(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID || '0'),
  environment: (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  apiKey: process.env.PADDLE_API_KEY || '',
  secretKey: process.env.PADDLE_SECRET_KEY || '',
}

let paddleInstance: any = null

export async function initializePaddleInstance() {
  if (paddleInstance) return paddleInstance

  try {
    paddleInstance = initializePaddle({
      token: paddleConfig.apiKey,
      environment: paddleConfig.environment,
    })
    return paddleInstance
  } catch (error) {
    console.error('Failed to initialize Paddle:', error)
    throw error
  }
}

export function getPaddleInstance() {
  return paddleInstance
}

export function resetPaddleInstance() {
  paddleInstance = null
}

// Paddle API helpers
export async function createPaddleCheckout(priceId: string, customerEmail?: string) {
  try {
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerEmail,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating Paddle checkout:', error)
    throw error
  }
}

export async function updatePaddleSubscription(subscriptionId: string, newPriceId: string) {
  try {
    const response = await fetch('/api/billing/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        newPriceId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update subscription')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating Paddle subscription:', error)
    throw error
  }
}

export async function cancelPaddleSubscription(subscriptionId: string) {
  try {
    const response = await fetch('/api/billing/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to cancel subscription')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error canceling Paddle subscription:', error)
    throw error
  }
}

export async function getPaddlePortalLink(customerId: string) {
  try {
    const response = await fetch('/api/billing/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create portal link')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating Paddle portal link:', error)
    throw error
  }
}
