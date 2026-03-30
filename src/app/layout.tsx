import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CopyAudit.ai - AI Landing Page Copy Auditor for B2B SaaS',
  description: 'Paste your URL and get an AI-powered audit of your landing page copy. Score your copy on contrast, specificity, anxiety defusal, JTBD alignment, and CTA clarity.',
  keywords: ['landing page audit', 'copywriting', 'B2B SaaS', 'conversion', 'AI copywriting'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
