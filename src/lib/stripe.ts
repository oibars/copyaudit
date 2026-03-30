import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '3 audits per month',
      'Basic copy analysis',
      '5 dimensions scored',
      'Top 3 recommendations',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Unlimited audits',
      'Advanced copy analysis',
      '5 dimensions scored',
      'Top 3 recommendations',
      'Priority processing',
      'Access to frontier models',
    ],
  },
} as const

export type PlanType = keyof typeof STRIPE_PLANS
