'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createSupabaseClient } from '@/utils/supabase/client'
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
  const supabase = createSupabaseClient()

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
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (subscriptionData) {
        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshBilling = async () => {
    setIsLoading(true)
    await fetchBillingData()
  }

  const upgradePlan = async (priceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          priceId,
          customerEmail: user.email,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
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
    if (!subscription?.paddle_subscription_id) {
      throw new Error('No active subscription found')
    }

    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscription.paddle_subscription_id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      await refreshBilling()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  const openCustomerPortal = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          customerId: profile?.paddle_customer_id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal link')
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
