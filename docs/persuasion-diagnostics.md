# Optional persuasion diagnostics

## Source evidence

Reference: [Chase Dimond's Instagram post](https://www.instagram.com/p/DeagMH4omc5/),
public account `@chasehunterdimond`, dated October 12, 2026. The single infographic
was visually reviewed at full resolution on October 20, 2026. No audio or carousel
is claimed.

The source presents five landing-page structures: PAS, AIDA, BAB, 4 Ps, and FAB.
It associates problem recognition with PAS, unfamiliar visitors with AIDA,
readily understood change with BAB, returning/email visitors with 4 Ps, and
product-detail explanations with FAB. These are the creator's recommendations,
not experimental findings or universal rules. The source does not establish
conversion lift.

## CopyAudit's original adaptation

The implementation uses the structures as optional diagnostic lenses, not
mandatory templates, five new scores, or a replacement for the existing rubric.
It asks for one grounded observation and one useful next step. The FAB check
distinguishes a feature, a functional advantage, and a relevant benefit. It uses
exact excerpts where available and marks unstated links instead of inventing them.

The URL-only input does not establish audience awareness or traffic source.
The server therefore fixes awareness to `unknown`. Any recommendation depending
on reader readiness must be conditional. Supporting explicit visitor context
would require a separate, intentionally designed input; it is not inferred here.

HTML extraction is partial: section buckets are heuristics and their prompt
order is not page order. Full-page text is limited to 5,000 characters in the
model request. Visual/dynamic content may be absent. Missing extracted sections
must be checked on the rendered page before calling them missing from the page.
The server attaches these limitations rather than relying on model guesses.

The prompt forbids invented proof, reviews, metrics, capabilities, urgency,
guarantees, and causal outcomes. Runtime validation additionally requires the
evidence and non-null FAB excerpts to occur in the text sent to the model.
This checks provenance, not the truth of a website's claims. Model-written
reasoning and recommendations still need human review.

## Compatibility and scope

- One existing model request; no new request or paid tier.
- The output budget rises from 2,000 to 3,000 tokens to accommodate the optional
  diagnosis. This is a cap, not a guarantee of token usage.
- Existing five score fields, model selection, top fixes, API inputs, database
  schema, and business logic remain unchanged.
- The optional `analysis.persuasion` field is persisted in the existing analysis
  JSON and displayed on the audit result page. Older audits render without it.
- Missing, malformed, or ungrounded diagnostic output is omitted rather than
  failing an otherwise valid audit. The original scoring parser is unchanged.
- No screenshot/layout reconstruction, extraction overhaul, live conversion
  experiment, or additional audience-input UI is included.

## Verification

`npm test` compiles and runs Node tests, including a local mock-model integration
test and server-rendered component checks. It makes no external model calls.
Also run `npm run lint`, `npx tsc --noEmit`, and `npm run build`. A full build
requires the project's existing Prisma and provider environment setup.
