// Paddle integration utilities

export interface PaddleConfig {
  environment: 'sandbox' | 'production'
  vendorId: string
  apiKey?: string
}

export function getPaddleConfig(): PaddleConfig {
  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox'
  const vendorId = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID || ''
  
  return {
    environment,
    vendorId
  }
}

export function initializePaddle() {
  const config = getPaddleConfig()
  
  if (typeof window !== 'undefined') {
    // Initialize Paddle.js
    window.Paddle.Environment.set(config.environment)
    window.Paddle.Setup({
      vendor: parseInt(config.vendorId),
      eventCallback: function(data: any) {
        console.log('Paddle event:', data)
        // Handle Paddle events here
      }
    })
  }
}

// Type declarations for Paddle.js
declare global {
  interface Window {
    Paddle: {
      Environment: {
        set: (env: 'sandbox' | 'production') => void
      }
      Setup: (options: { vendor: number; eventCallback?: (data: any) => void }) => void
      Checkout: {
        open: (options: { product?: number; price?: number; email?: string; quantity?: number }) => void
      }
      Product: {
        getPrices: (productIds: number[], callback: (prices: any[]) => void) => void
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
    script.src = 'https://cdn.paddle.com/paddle/paddle.js'
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
