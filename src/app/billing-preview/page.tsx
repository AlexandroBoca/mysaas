'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Link from 'next/link'
import { Check, Zap, Shield, HeadphonesIcon, Users, ArrowRight, Plus } from 'lucide-react'

export default function BillingPreview() {
  const { theme } = useTheme()

  const individualPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'per month',
      description: 'Perfect for getting started',
      features: [
        '10 content generations per month',
        'Basic templates',
        'Community support',
        'Single user account'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Starter',
      price: '$19,99',
      period: 'per month',
      description: 'Great for individuals and freelancers',
      features: [
        '100 content generations per month',
        'Advanced templates',
        'Priority support',
        'Custom branding',
        'Analytics dashboard'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Pro',
      price: '$49,99',
      period: 'per month',
      description: 'For power users and professionals',
      features: [
        '500 content generations per month',
        'All templates unlocked',
        '24/7 priority support',
        'Advanced analytics',
        'Custom integrations',
        'Team collaboration (up to 3 users)'
      ],
      cta: 'Start Free Trial',
      popular: false
    }
  ]

  const enterprisePlans = [
    {
      name: 'Team',
      price: '$149,99',
      period: 'per month',
      description: 'For growing teams and agencies',
      features: [
        '2,000 content generations per month',
        'Unlimited templates',
        'Dedicated account manager',
        'Custom AI training',
        'SSO authentication',
        'Advanced integrations',
        'Team collaboration (up to 10 users)',
        'Priority API access'
      ],
      cta: 'Contact Sales',
      popular: false
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations with custom needs',
      features: [
        'Unlimited content generations',
        'Custom template development',
        'White-label solutions',
        'On-premise deployment option',
        'Advanced security features',
        'Custom integrations',
        'Unlimited team members',
        'SLA guarantee',
        'Dedicated support team'
      ],
      cta: 'Contact Sales',
      popular: true
    }
  ]

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#ffffff' }}>
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
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TechFlow
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Billing Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl font-bold mb-4 transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Simple, Transparent Pricing
          </h2>
          <p 
            className="text-xl transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            Choose the perfect plan for your content creation needs
          </p>
        </div>

        {/* Individual Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {individualPlans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.popular 
                  ? 'ring-2 shadow-xl transform scale-105' 
                  : 'border shadow-lg'
              }`}
              style={{
                borderColor: plan.popular 
                  ? (theme === 'dark' ? '#3b82f6' : '#2563eb')
                  : (theme === 'dark' ? '#374151' : '#e5e7eb'),
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
              }}
            >
              {plan.popular && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1e40af' : '#dbeafe',
                    color: theme === 'dark' ? '#93c5fd' : '#1e40af'
                  }}
                >
                  Most Popular
                </div>
              )}
              
              <h3 
                className="text-2xl font-bold mb-2 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                {plan.name}
              </h3>
              
              <div className="mb-4">
                <span 
                  className="text-4xl font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span 
                    className="text-lg transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    /{plan.period}
                  </span>
                )}
              </div>
              
              <p 
                className="mb-6 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                {plan.description}
              </p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" 
                      style={{ color: theme === 'dark' ? '#10b981' : '#059669' }} />
                    <span 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/signup"
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg' 
                    : 'border hover:bg-opacity-10 hover:bg-blue-600'
                }`}
                style={{
                  borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  color: plan.popular ? '#ffffff' : (theme === 'dark' ? '#f9fafb' : '#111827'),
                  backgroundColor: plan.popular ? 'transparent' : (theme === 'dark' ? 'transparent' : 'transparent')
                }}
              >
                {plan.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise Plans Preview */}
        <div className="text-center mb-8">
          <h3 
            className="text-2xl font-bold mb-4 transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Enterprise Solutions
          </h3>
          <p 
            className="text-lg transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            Powerful features for teams and large organizations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {enterprisePlans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.popular 
                  ? 'ring-2 shadow-xl' 
                  : 'border shadow-lg'
              }`}
              style={{
                borderColor: plan.popular 
                  ? (theme === 'dark' ? '#3b82f6' : '#2563eb')
                  : (theme === 'dark' ? '#374151' : '#e5e7eb'),
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
              }}
            >
              <h3 
                className="text-2xl font-bold mb-2 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                {plan.name}
              </h3>
              
              <div className="mb-4">
                <span 
                  className="text-4xl font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span 
                    className="text-lg transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    /{plan.period}
                  </span>
                )}
              </div>
              
              <p 
                className="mb-6 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                {plan.description}
              </p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.slice(0, 4).map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" 
                      style={{ color: theme === 'dark' ? '#10b981' : '#059669' }} />
                    <span 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
                <li className="flex items-start">
                  <div 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    more features
                  </div>
                </li>
              </ul>
              
              <Link
                href="/signup"
                className="w-full py-3 px-6 rounded-lg font-medium border transition-all duration-300 flex items-center justify-center"
                style={{
                  borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  color: theme === 'dark' ? '#f9fafb' : '#111827'
                }}
              >
                {plan.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div 
            className="rounded-2xl p-12 transition-colors duration-300"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
            }}
          >
            <h3 
              className="text-3xl font-bold mb-4 transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Ready to get started?
            </h3>
            <p 
              className="text-lg mb-8 transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              Join thousands of users creating amazing content with TechFlow
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
