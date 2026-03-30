'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionStatus {
  tier: 'free' | 'pro'
  plan: {
    name: string
    price: number
    features: string[]
  }
  subscription: {
    plan: string
    currentPeriodEnd: string | null
  } | null
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPortalLoading, setIsPortalLoading] = useState(false)

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchSubscriptionStatus()
    }
  }, [status, router])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/stripe/status')
      const data = await response.json()
      setSubscription(data)
    } catch (error) {
      console.error('Failed to fetch subscription status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Failed to open portal:', error)
      setIsPortalLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isPro = subscription?.tier === 'pro'

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-600" />
            <span className="font-bold text-xl">CopyAudit.ai</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user?.email}</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/auth/signout">Sign Out</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {success && (
          <Card className="mb-8 border-green-500 bg-green-50">
            <CardContent className="flex items-center gap-4 py-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-700">Payment successful!</p>
                <p className="text-sm text-green-600">You now have access to Pro features.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {canceled && (
          <Card className="mb-8 border-amber-500 bg-amber-50">
            <CardContent className="flex items-center gap-4 py-4">
              <AlertCircle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="font-semibold text-amber-700">Checkout canceled</p>
                <p className="text-sm text-amber-600">No worries, you can upgrade anytime.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Your current plan and usage</CardDescription>
                  </div>
                  <Badge variant={isPro ? 'default' : 'secondary'} className={isPro ? 'bg-violet-600' : ''}>
                    {isPro ? 'Pro' : 'Free'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium">
                      {subscription?.plan.name} - ${subscription?.plan.price}/mo
                    </span>
                  </div>
                  
                  {subscription?.subscription?.currentPeriodEnd && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Renews</span>
                      <span className="font-medium">
                        {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="pt-4">
                    {isPro ? (
                      <Button 
                        variant="outline" 
                        onClick={handleManageSubscription}
                        disabled={isPortalLoading}
                      >
                        {isPortalLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="mr-2 h-4 w-4" />
                        )}
                        Manage Subscription
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href="/#pricing">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Upgrade to Pro
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>Audit your first landing page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter any B2B SaaS landing page URL to get an AI-powered audit 
                    analyzing 5 key copywriting dimensions.
                  </p>
                  <Button asChild>
                    <Link href="/">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start New Audit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Pro Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {subscription?.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
