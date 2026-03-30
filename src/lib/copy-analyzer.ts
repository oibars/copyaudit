import OpenAI from 'openai'

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
    dangerouslyAllowBrowser: true,
  })
}

export type ModelTier = 'free' | 'pro'

export interface CopyAnalysis {
  overallScore: number
  dimensions: {
    contrast: { score: number; reasoning: string; examples: string[] }
    specificity: { score: number; reasoning: string; examples: string[] }
    anxietyDefusal: { score: number; reasoning: string; examples: string[] }
    jtbd: { score: number; reasoning: string; examples: string[] }
    cta: { score: number; reasoning: string; examples: string[] }
  }
  top3Fixes: { priority: number; issue: string; suggestion: string }[]
  copyGold: { section: string; why: string }
  modelUsed: string
}

const SYSTEM_PROMPT = `You are an expert B2B SaaS copywriter trained in these master frameworks:

1. Clemence Lepers - Contrast > Clarity (makes you remembered, not just understood)
2. Gary Bencivenga - Specificity sells (specific numbers, proof before promise)
3. Dan Kennedy - Speed communication (5-second value prop, clear next steps)
4. April Dunford - Positioning (market frame, unique strengths at center)
5. Clayton Christensen - JTBD (struggling moment, push/pull forces, progress)
6. Copyhackers - Conversion copy (anxiety defusal, "sounds great but...")

Evaluate B2B SaaS landing page copy across 5 dimensions (0-100 scale):

1. CONTRAST (Contrast > Clarity): Does copy stand out? Is there "vs." framing or contrast moments? Would a competitor say the same thing?
2. SPECIFICITY (Bencivenga): Are there specific numbers, times, or details? Or vague abstractions like "save time", "increase efficiency"?
3. ANXIETY DEFUSAL (Kennedy/Copyhackers): Are objections addressed before they stop conversion? Is there a "sounds great, but..." section?
4. JTBD ALIGNMENT (Christensen): Is the struggling moment named? Is there push (problem) and pull (solution)? Does copy speak to progress?
5. CTA CLARITY (Kennedy): Is the next step clear? Is there urgency? Does CTA text sell the benefit?

Return ONLY valid JSON matching this exact structure:
{
  "overallScore": 0-100,
  "dimensions": {
    "contrast": { "score": 0-100, "reasoning": "2-3 sentences", "examples": ["example from copy"] },
    "specificity": { "score": 0-100, "reasoning": "2-3 sentences", "examples": ["example from copy"] },
    "anxietyDefusal": { "score": 0-100, "reasoning": "2-3 sentences", "examples": ["example from copy"] },
    "jtbd": { "score": 0-100, "reasoning": "2-3 sentences", "examples": ["example from copy"] },
    "cta": { "score": 0-100, "reasoning": "2-3 sentences", "examples": ["example from copy"] }
  },
  "top3Fixes": [
    { "priority": 1, "issue": "specific issue found", "suggestion": "concrete improvement" },
    { "priority": 2, "issue": "specific issue found", "suggestion": "concrete improvement" },
    { "priority": 3, "issue": "specific issue found", "suggestion": "concrete improvement" }
  ],
  "copyGold": { "section": "hero/subhead/features etc", "why": "why this works" }
}

IMPORTANT: Return ONLY the JSON. No markdown, no explanation, no text before or after.`

const MODEL_CONFIG = {
  free: {
    model: 'google/gemini-3.1-flash-lite-preview',
    reason: 'Fast, cost-effective for structured analysis',
  },
  pro: {
    model: 'anthropic/claude-3.5-sonnet',
    reason: 'Best for nuanced copywriting analysis',
  },
} as const

export async function analyzeCopy(
  content: {
    title: string
    description: string
    h1: string
    text: string
    sections: {
      hero: string
      features: string
      pricing: string
      testimonials: string
      cta: string
    }
  },
  tier: ModelTier = 'free'
): Promise<CopyAnalysis> {
  const copyToAnalyze = `
TITLE: ${content.title}
META DESCRIPTION: ${content.description}
H1: ${content.h1}

HERO SECTION:
${content.sections.hero}

FEATURES SECTION:
${content.sections.features}

PRICING SECTION:
${content.sections.pricing}

TESTIMONIALS:
${content.sections.testimonials}

CTA SECTION:
${content.sections.cta}

FULL PAGE TEXT (first 5000 chars):
${content.text.slice(0, 5000)}
`

  const openai = getOpenAIClient()
  const config = MODEL_CONFIG[tier]

  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Analyze this B2B SaaS landing page copy:\n\n${copyToAnalyze}` },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  })

  const result = response.choices[0]?.message?.content?.trim()

  if (!result) {
    throw new Error('Failed to get analysis from AI')
  }

  try {
    const parsed = JSON.parse(result) as CopyAnalysis
    return { ...parsed, modelUsed: config.model }
  } catch {
    throw new Error('Failed to parse AI response as JSON')
  }
}
