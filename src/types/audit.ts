import { type CopyAnalysis } from './copy-analyzer'

export interface Audit {
  id: string
  userId: string | null
  url: string
  title: string
  overallScore: number
  contrastScore: number
  specificityScore: number
  anxietyDefusalScore: number
  jtbdScore: number
  ctaScore: number
  analysis: CopyAnalysis
  recommendations: CopyAnalysis['top3Fixes']
  createdAt: Date
}

export interface AuditSubmission {
  url: string
}
