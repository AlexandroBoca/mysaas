// Pricing plans configuration
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: 'free',
    paddlePriceId: null,
    features: [
      '1,000 AI tokens per month',
      '10 content generations',
      'Basic templates',
      'Community support',
      'Single project',
    ],
    limits: {
      tokens: 1000,
      generations: 10,
      projects: 1,
    },
  },
  starter: {
    name: 'Starter',
    price: 9.99,
    priceId: 'starter',
    paddlePriceId: 'pri_01kb7je247rmae29jj49yxzk4z',
    features: [
      '10,000 AI tokens per month',
      '100 content generations',
      'Premium templates',
      'Email support',
      'Up to 5 projects',
      'Basic analytics',
    ],
    limits: {
      tokens: 10000,
      generations: 100,
      projects: 5,
    },
  },
  'starter-business': {
    name: 'Starter Business',
    price: 99.99,
    priceId: 'starter-business',
    paddlePriceId: null, // Add your Paddle price ID here if needed
    features: [
      '10,000 AI credits per month',
      'Team management (5 users)',
      'Business templates',
      'Email support',
      'Basic analytics',
      'SSO authentication'
    ],
    limits: {
      tokens: 10000,
      generations: 1000,
      projects: -1,
    },
  },
  pro: {
    name: 'Pro',
    price: 29.99,
    priceId: 'pro',
    paddlePriceId: 'pri_01kb7qt9an30wrwg5z9ac78sy6',
    features: [
      '50,000 AI tokens per month',
      '500 content generations',
      'All templates',
      'Priority support',
      'Unlimited projects',
      'Advanced analytics',
      'Custom branding',
    ],
    limits: {
      tokens: 50000,
      generations: 500,
      projects: -1, // unlimited
    },
  },
  'enterprise-plan': {
    name: 'Enterprise',
    price: 299.99,
    priceId: 'enterprise-plan',
    paddlePriceId: 'pri_01kb7qy4eqzkqga3x5rj5nkb2w',
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
    limits: {
      tokens: -1, // unlimited
      generations: -1, // unlimited
      projects: -1, // unlimited
    },
  },
}

// Plan helpers
export function getPlanByPriceId(priceId: string) {
  return Object.values(PRICING_PLANS).find(plan => plan.priceId === priceId)
}

export function getPlanByPaddlePriceId(paddlePriceId: string) {
  return Object.values(PRICING_PLANS).find(plan => plan.paddlePriceId === paddlePriceId)
}

export function formatPrice(amount: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function getPlanLimits(priceId: string) {
  const plan = getPlanByPriceId(priceId)
  return plan?.limits || { tokens: 0, generations: 0 }
}
