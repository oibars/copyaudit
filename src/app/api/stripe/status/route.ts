import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { STRIPE_PLANS } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ 
        tier: 'free',
        plan: STRIPE_PLANS.free,
        subscription: null,
      })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    const tier = subscription?.plan === 'pro' ? 'pro' : 'free'
    const plan = STRIPE_PLANS[tier]

    return NextResponse.json({
      tier,
      plan,
      subscription: subscription ? {
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd,
      } : null,
    })
  } catch (error) {
    console.error('Status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
