'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, ArrowLeft, Sparkles, ExternalLink, Copy, Check } from 'lucide-react'
import { cn, getScoreColor, getScoreBgColor, getScoreLabel, truncateUrl } from '@/lib/utils'
import type { CopyAnalysis } from '@/lib/copy-analyzer'

interface AuditResult {
  id: string
  url: string
  title: string
  overallScore: number
  contrastScore: number
  specificityScore: number
  anxietyDefusalScore: number
  jtbdScore: number
  ctaScore: number
  analysis: CopyAnalysis
  recommendations: { priority: number; issue: string; suggestion: string }[]
  createdAt: string
}

const dimensionLabels = {
  contrast: { name: 'Contrast', description: 'Makes you remembered, not just understood' },
  specificity: { name: 'Specificity', description: 'Specific numbers and details over vague abstractions' },
  anxietyDefusal: { name: 'Anxiety Defusal', description: 'Addresses objections before they stop conversion' },
  jtbd: { name: 'JTBD Alignment', description: 'Speaks to struggling moment and progress' },
  cta: { name: 'CTA Clarity', description: 'Clear next steps with benefit-driven copy' },
}

export default function AuditResultPage() {
  const params = useParams()
  const router = useRouter()
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchAudit() {
      try {
        const response = await fetch(`/api/audit/${params.id}`)
        if (!response.ok) {
          throw new Error('Audit not found')
        }
        const data = await response.json()
        setAudit(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchAudit()
    }
  }, [params.id])

  const handleCopyLink = () => {
    if (audit) {
      navigator.clipboard.writeText(`${window.location.origin}/audit/${audit.id}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-violet-600" />
          <p className="text-muted-foreground">Loading your audit...</p>
        </div>
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Audit Not Found</CardTitle>
            <CardDescription>{error || 'The audit you are looking for does not exist.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Go Back Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold truncate max-w-md">{audit.title || truncateUrl(audit.url)}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{truncateUrl(audit.url)}</span>
                <a
                  href={audit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied!' : 'Share'}
            </Button>
            <Button size="sm" asChild>
              <Link href="/">New Audit</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Overall Score</CardTitle>
                    <CardDescription>
                      Based on 5 key copywriting dimensions
                    </CardDescription>
                  </div>
                  <div className={cn('text-6xl font-bold', getScoreColor(audit.overallScore))}>
                    {audit.overallScore}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge className={cn('text-lg px-3 py-1', getScoreBgColor(audit.overallScore), getScoreColor(audit.overallScore))}>
                  {getScoreLabel(audit.overallScore)}
                </Badge>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'contrast', score: audit.contrastScore },
                { key: 'specificity', score: audit.specificityScore },
                { key: 'anxietyDefusal', score: audit.anxietyDefusalScore },
                { key: 'jtbd', score: audit.jtbdScore },
                { key: 'cta', score: audit.ctaScore },
              ].map(({ key, score }) => (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {dimensionLabels[key as keyof typeof dimensionLabels].name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {dimensionLabels[key as keyof typeof dimensionLabels].description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className={cn('text-3xl font-bold', getScoreColor(score))}>
                        {score}
                      </div>
                      <Progress
                        value={score}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {audit.analysis.dimensions[key as keyof typeof audit.analysis.dimensions]?.reasoning}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Dimension Breakdown</CardTitle>
                <CardDescription>Detailed analysis from each framework</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(audit.analysis.dimensions).map(([key, dim]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium capitalize">
                        {dimensionLabels[key as keyof typeof dimensionLabels]?.name || key}
                      </h4>
                      <Badge variant="outline">{dim.score}/100</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{dim.reasoning}</p>
                    {dim.examples.length > 0 && (
                      <div className="bg-slate-100 rounded p-3 mt-2">
                        <p className="text-xs font-medium mb-1">Examples found:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {dim.examples.slice(0, 2).map((ex, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-violet-600">•</span>
                              <span>&quot;{ex}&quot;</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                  Top 3 Fixes
                </CardTitle>
                <CardDescription>
                  Priority improvements ranked by impact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {audit.recommendations.map((rec) => (
                  <div
                    key={rec.priority}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-sm font-medium flex items-center justify-center">
                        {rec.priority}
                      </span>
                      <span className="text-sm font-medium">Priority</span>
                    </div>
                    <p className="text-sm font-medium">{rec.issue}</p>
                    <p className="text-sm text-muted-foreground">{rec.suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {audit.analysis.copyGold && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Copy Gold</CardTitle>
                  <CardDescription>
                    Your best performing section
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">
                    {audit.analysis.copyGold.section}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {audit.analysis.copyGold.why}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Want unlimited audits and history?
                </p>
                <Button className="w-full" asChild>
                  <Link href="/pricing">Upgrade to Pro</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
