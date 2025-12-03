// Paddle integration utilities with new API

export interface PaddleConfig {
  environment: 'sandbox' | 'production'
  clientToken: string
  apiKey?: string
}

export function getPaddleConfig(): PaddleConfig {
  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox'
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || ''
  
  return {
    environment,
    clientToken
  }
}

export function initializePaddle() {
  const config = getPaddleConfig()
  
  if (typeof window !== 'undefined') {
    // Initialize Paddle.js with new API
    window.Paddle.Initialize({
      environment: config.environment,
      token: config.clientToken,
      eventCallback: function(data: any) {
        console.log('Paddle event:', data)
        // Handle Paddle events here
      }
    })
  }
}

// Type declarations for Paddle.js (new API)
declare global {
  interface Window {
    Paddle: {
      Initialize: (options: { environment: 'sandbox' | 'production'; token: string; eventCallback?: (data: any) => void }) => void
      Checkout: {
        open: (options: { items: Array<{ priceId: string; quantity?: number }>; customer?: { email?: string } }) => void
      }
      Price: {
        getPrices: (priceIds: string[], callback: (prices: any[]) => void) => void
      }
    }
  }
}

export function loadPaddleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Paddle) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.async = true
    script.onload = () => {
      resolve()
    }
    script.onerror = () => {
      reject(new Error('Failed to load Paddle script'))
    }
    document.head.appendChild(script)
  })
}

export async function initializePaddleCheckout() {
  try {
    await loadPaddleScript()
    initializePaddle()
  } catch (error) {
    console.error('Failed to initialize Paddle:', error)
    throw error
  }
}
