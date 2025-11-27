'use client'

import React, { useState, useEffect } from 'react'
import { useBilling } from '@/contexts/BillingContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Loader2, CreditCard, Settings, Users, Building, Zap, Shield, Crown, Star, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Sidebar from '@/components/layout/Sidebar'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BillingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const { 
    profile, 
    subscription, 
    isLoading, 
    currentPlan,
    upgradePlan,
    cancelSubscription,
    openCustomerPortal,
  } = useBilling()

  const [selectedTab, setSelectedTab] = useState<'individual' | 'enterprise'>('individual')
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const { theme } = useTheme()

  // Check authentication using Supabase
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (!user) {
          router.replace('/billing-preview')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.replace('/billing-preview')
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.replace('/billing-preview')
        } else if (session?.user) {
          setUser(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: theme === 'dark' ? '#111827' : '#ffffff' }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto transition-colors duration-300"
            style={{ borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6' }}
          ></div>
          <p 
            className="mt-4 transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            Loading billing information...
          </p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null // Will redirect via useEffect
  }

  const handleUpgradePlan = async (priceId: string) => {
    setUpgradingPlan(priceId)
    try {
      await upgradePlan(priceId)
    } catch (error) {
      console.error('Upgrade failed:', error)
    } finally {
      setUpgradingPlan(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? This will take effect at the end of your billing period.')) {
      return
    }

    setCancelling(true)
    try {
      await cancelSubscription()
    } catch (error) {
      console.error('Cancellation failed:', error)
    } finally {
      setCancelling(false)
    }
  }

  // Individual Plans
  const individualPlans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      icon: Star,
      color: theme === 'dark' ? 'bg-gray-600' : 'bg-gray-500',
      features: [
        '100 AI credits per month',
        'Basic templates',
        'Community support',
        '1 project'
      ],
      limits: { tokens: 100, generations: 10, projects: 1 },
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      description: 'For professionals and creators',
      icon: Zap,
      color: theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500',
      features: [
        '1,000 AI credits per month',
        'Advanced templates',
        'Priority support',
        '10 projects',
        'Custom branding',
        'API access'
      ],
      limits: { tokens: 1000, generations: 100, projects: 10 },
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$49',
      description: 'For power users and teams',
      icon: Crown,
      color: theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500',
      features: [
        '5,000 AI credits per month',
        'All templates unlocked',
        'Dedicated support',
        'Unlimited projects',
        'Advanced analytics',
        'Team collaboration',
        'Custom integrations'
      ],
      limits: { tokens: 5000, generations: 500, projects: -1 },
      popular: false
    }
  ]

  // Enterprise Plans
  const enterprisePlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$99',
      description: 'For small businesses',
      icon: Building,
      color: theme === 'dark' ? 'bg-green-600' : 'bg-green-500',
      features: [
        '10,000 AI credits per month',
        'Team management (5 users)',
        'Business templates',
        'Email support',
        'Basic analytics',
        'SSO authentication'
      ],
      limits: { tokens: 10000, generations: 1000, projects: -1 },
      popular: false
    },
    {
      id: 'business',
      name: 'Business',
      price: '$299',
      description: 'For growing companies',
      icon: Shield,
      color: theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-500',
      features: [
        '25,000 AI credits per month',
        'Team management (20 users)',
        'Custom workflows',
        'Priority support',
        'Advanced analytics',
        'Custom integrations',
        'SLA guarantee'
      ],
      limits: { tokens: 25000, generations: 2500, projects: -1 },
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      icon: Users,
      color: theme === 'dark' ? 'bg-red-600' : 'bg-red-500',
      features: [
        'Unlimited AI credits',
        'Unlimited users',
        'Custom solutions',
        '24/7 phone support',
        'White-label options',
        'On-premise deployment',
        'Dedicated account manager',
        'Custom contracts'
      ],
      limits: { tokens: -1, generations: -1, projects: -1 },
      popular: false
    }
  ]

  const currentPlans = selectedTab === 'individual' ? individualPlans : enterprisePlans

  return (
    <div className="min-h-screen flex transition-colors duration-300" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#ffffff' }}>
      <Sidebar user={profile} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <div 
          className="shadow-sm border-b transition-colors duration-300"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h1 
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Billing & Plans
                </h1>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Billing Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold mb-4 transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Choose Your Perfect Plan
            </h2>
            <p 
              className="text-xl mb-8 transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              Unlock powerful features and scale your content generation
            </p>

            {/* Tab Switcher */}
            <div className="inline-flex rounded-lg border p-1 transition-colors duration-300" 
                 style={{ borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb' }}>
              <button
                onClick={() => setSelectedTab('individual')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  selectedTab === 'individual'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="h-4 w-4 mr-2 inline" />
                Individual
              </button>
              <button
                onClick={() => setSelectedTab('enterprise')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  selectedTab === 'enterprise'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building className="h-4 w-4 mr-2 inline" />
                Enterprise
              </button>
            </div>
          </div>

          {/* Current Subscription Alert */}
          {subscription && (
            <Alert className="mb-8">
              <AlertDescription>
                You are currently on the <strong>{currentPlan?.name}</strong> plan. 
                {subscription.status !== 'active' && (
                  <span className="ml-2 text-yellow-600">
                    (Status: {subscription.status})
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {currentPlans.map((plan) => {
              const Icon = plan.icon
              const isCurrent = currentPlan?.priceId === plan.id
              
              return (
                <Card 
                  key={plan.id}
                  className={`relative transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                    plan.popular 
                      ? 'border-2 shadow-xl' 
                      : 'border'
                  }`}
                  style={{
                    borderColor: plan.popular 
                      ? theme === 'dark' ? '#60a5fa' : '#3b82f6'
                      : theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    background: plan.popular && theme === 'dark' 
                      ? 'linear-gradient(135deg, #1e293b 0%, #1f2937 100%)'
                      : plan.popular && theme === 'light'
                      ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                      : theme === 'dark' ? '#1f2937' : '#ffffff'
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 shadow-lg animate-pulse">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-4 right-4 z-10">
                      <Badge 
                        variant="default" 
                        className="shadow-md"
                        style={{
                          backgroundColor: theme === 'dark' ? '#10b981' : '#059669',
                          color: '#ffffff'
                        }}
                      >
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  {/* Gradient overlay for popular plans */}
                  {plan.popular && (
                    <div 
                      className="absolute inset-0 rounded-lg opacity-5 pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                      }}
                    />
                  )}

                  <CardHeader className="text-center pb-8 relative z-10">
                    <div className={`w-16 h-16 ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform transition-transform duration-300 hover:scale-110`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>{plan.name}</CardTitle>
                    <div className="text-4xl font-bold mb-2" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      {plan.price}
                      {plan.price !== 'Custom' && (
                        <span 
                          className="text-lg font-normal"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                        >
                          /month
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-base" style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6 relative z-10">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start group">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-green-500'}`}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span 
                            className="text-sm transition-colors duration-300 group-hover:text-blue-500"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-6 relative z-10">
                    {isCurrent ? (
                      <div className="w-full space-y-3">
                        <Button 
                          disabled 
                          className="w-full" 
                          size="lg"
                          style={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            border: theme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb'
                          }}
                        >
                          Current Plan
                        </Button>
                        {plan.id !== 'free' && (
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={openCustomerPortal}
                            className="w-full"
                            style={{
                              borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                              color: theme === 'dark' ? '#d1d5db' : '#374151'
                            }}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Subscription
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={() => plan.price !== 'Custom' ? handleUpgradePlan(plan.id) : openCustomerPortal()}
                        disabled={upgradingPlan === plan.id}
                        className="w-full transform transition-all duration-300 hover:scale-105"
                        size="lg"
                        style={{
                          background: plan.popular 
                            ? 'linear-gradient(to right, #3b82f6, #8b5cf6)'
                            : theme === 'dark' ? '#1f2937' : '#ffffff',
                          border: plan.popular 
                            ? 'none' 
                            : theme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
                          color: plan.popular 
                            ? '#ffffff'
                            : theme === 'dark' ? '#f9fafb' : '#111827'
                        }}
                      >
                        {upgradingPlan === plan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : plan.price === 'Custom' ? (
                          <>
                            Contact Sales
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Get Started
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {/* Cancel Subscription Section */}
          {subscription && subscription.status === 'active' && currentPlan?.priceId !== 'free' && (
            <Card className="border-red-200 dark:border-red-800 mb-16" 
                  style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}>
              <CardHeader>
                <CardTitle className="text-red-600">Cancel Subscription</CardTitle>
                <CardDescription>
                  If you need to cancel your subscription, you can do so here. Your access will continue until the end of your billing period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Usage Stats */}
          {profile && (
            <Card style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}>
              <CardHeader>
                <CardTitle>Current Usage</CardTitle>
                <CardDescription>
                  Your current usage this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-lg border transition-colors duration-300"
                       style={{ borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb' }}>
                    <div className="text-3xl font-bold mb-2" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      {profile.credits_remaining}
                    </div>
                    <div className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      Credits Remaining
                    </div>
                  </div>
                  <div className="text-center p-6 rounded-lg border transition-colors duration-300"
                       style={{ borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb' }}>
                    <div className="text-3xl font-bold mb-2" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      {currentPlan?.name || 'Free'}
                    </div>
                    <div className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      Current Plan
                    </div>
                  </div>
                  <div className="text-center p-6 rounded-lg border transition-colors duration-300"
                       style={{ borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb' }}>
                    <div className="text-3xl font-bold mb-2" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                    <div className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      Subscription Status
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
