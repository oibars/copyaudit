import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { test } from 'node:test'
import { analyzeCopy } from '../src/lib/copy-analyzer'

test('one model request preserves scores and safely includes or omits optional diagnosis', async () => {
  const score = { score: 70, reasoning: 'Fixture reasoning.', examples: ['Saved filters'] }
  const baseline = {
    overallScore: 70,
    dimensions: { contrast: score, specificity: score, anxietyDefusal: score, jtbd: score, cta: score },
    top3Fixes: [{ priority: 1, issue: 'Fixture issue', suggestion: 'Fixture suggestion' }],
    copyGold: { section: 'features', why: 'Fixture explanation' },
  }
  const diagnosis = {
    framework: 'FAB', reasoning: 'A feature is stated.', evidence: ['Saved filters'],
    nextStep: 'Verify the benefit with product evidence.',
    fab: { feature: 'Saved filters', advantage: null, benefit: null, assessment: 'No outcome is established.' },
  }
  const payloads = [baseline, { ...baseline, persuasion: diagnosis }, { ...baseline, persuasion: { broken: true } }]
  const requests: { model: string; messages: { role: string; content: string }[] }[] = []
  const server = createServer(async (req, res) => {
    let body = ''
    for await (const chunk of req) body += chunk
    requests.push(JSON.parse(body))
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(payloads[requests.length - 1]) } }] }))
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const oldKey = process.env.OPENAI_API_KEY
  const oldBase = process.env.OPENAI_BASE_URL
  process.env.OPENAI_API_KEY = 'local-test-only'
  process.env.OPENAI_BASE_URL = `http://127.0.0.1:${address.port}`
  const content = {
    title: 'Fixture', description: '', h1: 'Saved filters', text: 'Saved filters',
    sections: { hero: 'Saved filters', features: '', pricing: '', testimonials: '', cta: '' },
  }
  try {
    for (let i = 0; i < payloads.length; i++) {
      const result = await analyzeCopy(content, i === 1 ? 'pro' : 'free')
      assert.deepEqual(result.dimensions, baseline.dimensions)
      assert.equal(result.overallScore, baseline.overallScore)
      assert.deepEqual(result.top3Fixes, baseline.top3Fixes)
      assert.deepEqual(result.copyGold, baseline.copyGold)
      assert.equal(Boolean(result.persuasion), i === 1)
      assert.equal(result.modelUsed, i === 1 ? 'anthropic/claude-3.5-sonnet' : 'google/gemini-3.1-flash-lite-preview')
    }
    assert.equal(requests.length, 3)
    assert.match(requests[0].messages[0].content, /OPTIONAL QUALITATIVE PERSUASION/)
    assert.match(requests[0].messages[1].content, /EXTRACTION LIMITATIONS/)
  } finally {
    if (oldKey === undefined) delete process.env.OPENAI_API_KEY
    else process.env.OPENAI_API_KEY = oldKey
    if (oldBase === undefined) delete process.env.OPENAI_BASE_URL
    else process.env.OPENAI_BASE_URL = oldBase
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
})
