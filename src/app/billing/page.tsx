'use client'

import React, { useState } from 'react'
import { useBilling } from '@/contexts/BillingContext'
import { PRICING_PLANS, formatPrice } from '@/lib/pricing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Loader2, CreditCard, Settings } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function BillingPage() {
  const { 
    profile, 
    subscription, 
    isLoading, 
    currentPlan,
    upgradePlan,
    cancelSubscription,
    openCustomerPortal,
  } = useBilling()

  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
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

  const isCurrentPlan = (priceId: string) => {
    return currentPlan?.priceId === priceId
  }

  const isUpgrade = (priceId: string) => {
    if (!currentPlan) return true
    
    const planOrder = ['free', 'starter', 'pro', 'enterprise']
    const currentIndex = planOrder.indexOf(currentPlan.priceId)
    const targetIndex = planOrder.indexOf(priceId)
    
    return targetIndex > currentIndex
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Choose the perfect plan for your content generation needs
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <Alert>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(PRICING_PLANS).map(([priceId, plan]) => (
          <Card 
            key={priceId} 
            className={`relative ${
              isCurrentPlan(priceId) 
                ? 'border-primary shadow-lg' 
                : 'border-border'
            }`}
          >
            {isCurrentPlan(priceId) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="default">Current Plan</Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {formatPrice(plan.price)}
                {plan.price > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                )}
              </div>
              <CardDescription>{plan.features[0]}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Usage Limits */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Usage Limits:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {plan.limits.tokens === -1 ? 'Unlimited' : plan.limits.tokens.toLocaleString()} tokens/month</li>
                  <li>• {plan.limits.generations === -1 ? 'Unlimited' : plan.limits.generations} generations/month</li>
                  <li>• {plan.limits.projects === -1 ? 'Unlimited' : plan.limits.projects} projects</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter>
              {isCurrentPlan(priceId) ? (
                <div className="w-full space-y-2">
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                  {priceId !== 'free' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openCustomerPortal}
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => handleUpgradePlan(priceId)}
                  disabled={upgradingPlan === priceId}
                  className="w-full"
                  variant={isUpgrade(priceId) ? 'default' : 'outline'}
                >
                  {upgradingPlan === priceId ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isUpgrade(priceId) ? (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Downgrade
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Cancel Subscription Section */}
      {subscription && subscription.status === 'active' && currentPlan?.priceId !== 'free' && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Cancel Subscription</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>
              Your current usage this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.credits_remaining}</div>
                <div className="text-sm text-muted-foreground">Credits Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentPlan?.name}</div>
                <div className="text-sm text-muted-foreground">Current Plan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-muted-foreground">Subscription Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
