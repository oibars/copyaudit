import axios from 'axios'
import { convert } from 'html-to-text'

export interface ExtractedContent {
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
}

export async function fetchAndExtractContent(url: string): Promise<ExtractedContent> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CopyAudit/1.0; +https://copyaudit.ai)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    const html = response.data as string

    const title = extractTitle(html)
    const description = extractMetaDescription(html)
    const h1 = extractH1(html)
    const fullText = convert(html, {
      wordwrap: false,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' },
        { selector: 'script', format: 'skip' },
        { selector: 'style', format: 'skip' },
        { selector: 'nav', format: 'skip' },
        { selector: 'footer', format: 'skip' },
        { selector: 'header', format: 'skip' },
      ],
    })

    const sections = extractSections(html)

    return {
      title,
      description,
      h1,
      text: fullText.slice(0, 10000),
      sections,
    }
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match ? match[1].trim() : ''
}

function extractMetaDescription(html: string): string {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  if (match) return match[1]
  const altMatch = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)
  return altMatch ? altMatch[1] : ''
}

function extractH1(html: string): string {
  const match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  return match ? match[1].trim() : ''
}

function extractSections(html: string): ExtractedContent['sections'] {
  const heroMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i)
  const featuresMatch = html.match(/<section[^>]*id=["']features["'][^>]*>([\s\S]*?)<\/section>/i) ||
                       html.match(/<section[^>]*class=["'][^"']*features[^"']*["'][^>]*>([\s\S]*?)<\/section>/i)
  const pricingMatch = html.match(/<section[^>]*id=["']pricing["'][^>]*>([\s\S]*?)<\/section>/i) ||
                      html.match(/<section[^>]*class=["'][^"']*pricing[^"']*["'][^>]*>([\s\S]*?)<\/section>/i)
  const testimonialsMatch = html.match(/<section[^>]*id=["']testimonials["'][^>]*>([\s\S]*?)<\/section>/i) ||
                           html.match(/<section[^>]*class=["'][^"']*testimonial[^"']*["'][^>]*>([\s\S]*?)<\/section>/i)
  const ctaMatch = html.match(/<section[^>]*id=["']cta["'][^>]*>([\s\S]*?)<\/section>/i) ||
                  html.match(/<section[^>]*class=["'][^"']*cta[^"']*["'][^>]*>([\s\S]*?)<\/section>/i) ||
                  html.match(/(?:getstarted|signup|register|start)[^>]*>([\s\S]*?)<\/section>/i)

  return {
    hero: heroMatch ? convert(heroMatch[1], { wordwrap: false }).slice(0, 2000) : '',
    features: featuresMatch ? convert(featuresMatch[1], { wordwrap: false }).slice(0, 2000) : '',
    pricing: pricingMatch ? convert(pricingMatch[1], { wordwrap: false }).slice(0, 2000) : '',
    testimonials: testimonialsMatch ? convert(testimonialsMatch[1], { wordwrap: false }).slice(0, 2000) : '',
    cta: ctaMatch ? convert(ctaMatch[1], { wordwrap: false }).slice(0, 1000) : '',
  }
}
