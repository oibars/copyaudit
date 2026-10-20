import type { PersuasionDiagnosis } from '../lib/persuasion'

/** Optional so saved audits created before this feature remain unchanged. */
export function PersuasionDiagnosisCard({ diagnosis }: { diagnosis?: PersuasionDiagnosis }) {
  if (!diagnosis) return null

  return (
    <section className="min-w-0 break-words rounded-lg border bg-white p-6 space-y-4" aria-labelledby="persuasion-title">
      <div>
        <h2 id="persuasion-title" className="text-xl font-semibold">Persuasion structure</h2>
        <p className="text-sm text-muted-foreground">
          Qualitative guidance, not an additional score or a required template.
        </p>
      </div>
      <p className="text-sm"><strong>Diagnostic lens:</strong> {diagnosis.framework}</p>
      <p className="text-sm text-muted-foreground">{diagnosis.reasoning}</p>
      <div className="rounded bg-slate-100 p-3">
        <h3 className="text-sm font-medium mb-2">Evidence from the extracted copy</h3>
        <ul className="list-disc pl-5 text-sm space-y-1">
          {diagnosis.evidence.map((quote, index) => <li key={index}>{quote}</li>)}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Feature to benefit check</h3>
        <dl className="grid gap-3 sm:grid-cols-3 text-sm">
          {(['feature', 'advantage', 'benefit'] as const).map(key => (
            <div key={key} className="min-w-0">
              <dt className="font-medium capitalize">{key}</dt>
              <dd className="text-muted-foreground">{diagnosis.fab[key] ?? 'Not stated in the extracted copy'}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground mt-3">{diagnosis.fab.assessment}</p>
      </div>
      <p className="text-sm"><strong>Suggested next step:</strong> {diagnosis.nextStep}</p>
      <div className="border-t pt-4 text-xs text-muted-foreground space-y-2">
        <p>Audience awareness: unknown. This URL-only audit does not establish visitor familiarity or traffic source.</p>
        <ul className="list-disc pl-4 space-y-1">
          {diagnosis.extractionLimitations.map((limit, index) => <li key={index}>{limit}</li>)}
        </ul>
      </div>
    </section>
  )
}
