import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fetchAndExtractContent } from '@/lib/url-fetcher'
import { analyzeCopy } from '@/lib/copy-analyzer'
import { z } from 'zod'

const auditSchema = z.object({
  url: z.string().url('Invalid URL'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { url } = auditSchema.parse(body)

    const extracted = await fetchAndExtractContent(url)
    const analysis = await analyzeCopy(extracted)

    const audit = await prisma.audit.create({
      data: {
        userId: session?.user?.id ?? null,
        url,
        title: extracted.title || url,
        overallScore: analysis.overallScore,
        contrastScore: analysis.dimensions.contrast.score,
        specificityScore: analysis.dimensions.specificity.score,
        anxietyDefusalScore: analysis.dimensions.anxietyDefusal.score,
        jtbdScore: analysis.dimensions.jtbd.score,
        ctaScore: analysis.dimensions.cta.score,
        analysis: analysis as any,
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
