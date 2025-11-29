'use client'

import React, { useEffect, useState } from 'react'
import { initializePaddleCheckout } from '@/lib/paddle'

interface PaddleCheckoutProps {
  priceId: string
  onSuccess?: () => void
  onError?: (error: Error) => void
  children: React.ReactNode
}

export default function PaddleCheckout({ 
  priceId, 
  onSuccess, 
  onError, 
  children 
}: PaddleCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    initializePaddleCheckout()
      .then(() => setIsInitialized(true))
      .catch((error) => {
        console.error('Failed to initialize Paddle:', error)
        if (onError) onError(error)
      })
  }, [onError])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!isInitialized) {
      const error = new Error('Paddle not initialized')
      if (onError) onError(error)
      return
    }

    setIsLoading(true)

    try {
      // This will be handled by the server-side checkout flow
      // The button click will trigger the BillingContext upgradePlan function
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Checkout error:', error)
      if (onError) onError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !isInitialized}
      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
        isLoading || !isInitialized
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
      }`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </div>
      ) : (
        children
      )}
    </button>
  )
}
