import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fetchAndExtractContent } from '@/lib/url-fetcher'
import { analyzeCopy, type ModelTier } from '@/lib/copy-analyzer'
import { z } from 'zod'

const auditSchema = z.object({
  url: z.string().url('Invalid URL'),
  tier: z.enum(['free', 'pro']).optional().default('free'),
})

const FREE_TIER_LIMIT = 3

async function getUserTier(userId: string | null): Promise<'free' | 'pro'> {
  if (!userId) return 'free'
  
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })
  
  if (subscription?.plan === 'pro') return 'pro'
  return 'free'
}

async function checkAuditLimit(userId: string | null, tier: 'free' | 'pro'): Promise<boolean> {
  if (tier === 'pro') return true
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const auditCount = await prisma.audit.count({
    where: {
      userId: userId ?? undefined,
      createdAt: { gte: thirtyDaysAgo },
    },
  })
  
  return auditCount < FREE_TIER_LIMIT
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null
    const body = await request.json()
    const { url, tier = 'free' } = auditSchema.parse(body)

    const userTier = await getUserTier(userId)
    const effectiveTier = userTier === 'pro' ? 'pro' : tier

    const withinLimit = await checkAuditLimit(userId, effectiveTier)
    if (!withinLimit && effectiveTier === 'free') {
      return NextResponse.json(
        { error: `Free tier limit reached. Upgrade to Pro for unlimited audits.` },
        { status: 429 }
      )
    }

    const extracted = await fetchAndExtractContent(url)
    const analysis = await analyzeCopy(extracted, effectiveTier as ModelTier)

    const audit = await prisma.audit.create({
      data: {
        userId,
        url,
        title: extracted.title || url,
        overallScore: analysis.overallScore,
        contrastScore: analysis.dimensions.contrast.score,
        specificityScore: analysis.dimensions.specificity.score,
        anxietyDefusalScore: analysis.dimensions.anxietyDefusal.score,
        jtbdScore: analysis.dimensions.jtbd.score,
        ctaScore: analysis.dimensions.cta.score,
        analysis: { ...analysis, modelUsed: analysis.modelUsed } as any,
        recommendations: analysis.top3Fixes as any,
      },
    })

    return NextResponse.json({
      id: audit.id,
      url: audit.url,
      title: audit.title,
      overallScore: audit.overallScore,
      contrastScore: audit.contrastScore,
      specificityScore: audit.specificityScore,
      anxietyDefusalScore: audit.anxietyDefusalScore,
      jtbdScore: audit.jtbdScore,
      ctaScore: audit.ctaScore,
      analysis,
      recommendations: analysis.top3Fixes,
      modelUsed: analysis.modelUsed,
      tier: effectiveTier,
      createdAt: audit.createdAt,
    })
  } catch (error) {
    console.error('Audit error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to audit URL' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ audits: [] })
    }

    const audits = await prisma.audit.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ audits })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 })
  }
}
