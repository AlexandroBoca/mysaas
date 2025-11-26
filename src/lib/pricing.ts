// Pricing plans configuration - Paddle integration
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
    paddlePriceId: 'pri_01hjxxxxxxx', // Replace with actual Paddle price ID
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
  pro: {
    name: 'Pro',
    price: 29.99,
    priceId: 'pro',
    paddlePriceId: 'pri_01hjyyyyyyy', // Replace with actual Paddle price ID
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
  enterprise: {
    name: 'Enterprise',
    price: 99.99,
    priceId: 'enterprise',
    paddlePriceId: 'pri_01hjzzzzzzz', // Replace with actual Paddle price ID
    features: [
      'Unlimited AI tokens',
      'Unlimited content generations',
      'All templates + custom',
      '24/7 phone support',
      'Unlimited projects',
      'White-label options',
      'API access',
      'Custom integrations',
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
