'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile, Subscription } from '@/types/database'
import { PRICING_PLANS } from '@/lib/pricing'

interface BillingContextType {
  profile: Profile | null
  subscription: Subscription | null
  isLoading: boolean
  currentPlan: typeof PRICING_PLANS[keyof typeof PRICING_PLANS] | null
  upgradePlan: (priceId: string) => Promise<void>
  cancelSubscription: () => Promise<void>
  openCustomerPortal: () => Promise<void>
  refreshBilling: () => Promise<void>
}

const BillingContext = createContext<BillingContextType | undefined>(undefined)

export function BillingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const currentPlan = profile?.subscription_tier 
    ? PRICING_PLANS[profile.subscription_tier as keyof typeof PRICING_PLANS] || null
    : PRICING_PLANS.free

  const fetchBillingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Fetch subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle() // Use maybeSingle() instead of single() to handle no results

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError)
      } else if (subscriptionData) {
        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const upgradePlan = async (priceId: string) => {
    try {
      // Get user authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('Making checkout request with session:', { 
        userId: user.id, 
        email: user.email
      })

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerEmail: user.email || 'test@example.com',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', JSON.stringify(errorData, null, 2))
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      
      // Redirect to Paddle checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error upgrading plan:', error)
      throw error
    }
  }

  const cancelSubscription = async () => {
    if (!subscription?.subscription_id) {
      throw new Error('No active subscription found')
    }

    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.subscription_id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Cancel API Error:', errorData)
        throw new Error(errorData.error || 'Failed to cancel subscription')
      }

      await refreshBilling()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  const openCustomerPortal = async () => {
    if (!profile?.customer_id) {
      throw new Error('No customer ID found')
    }

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: profile.customer_id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Portal API Error:', errorData)
        throw new Error(errorData.error || 'Failed to create portal link')
      }

      const data = await response.json()
      
      // Redirect to Paddle customer portal
      if (data.portalUrl) {
        window.location.href = data.portalUrl
      } else {
        throw new Error('No portal URL received')
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
      throw error
    }
  }

  const refreshBilling = async () => {
    setIsLoading(true)
    await fetchBillingData()
  }

  useEffect(() => {
    fetchBillingData()
  }, [])

  const value: BillingContextType = {
    profile,
    subscription,
    isLoading,
    currentPlan,
    upgradePlan,
    cancelSubscription,
    openCustomerPortal,
    refreshBilling,
  }

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  )
}

export function useBilling() {
  const context = useContext(BillingContext)
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider')
  }
  return context
}
