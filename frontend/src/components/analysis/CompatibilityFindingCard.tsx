import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { cn } from '../../lib/cn'
import { IngredientLink } from '../IngredientLink'
import { INTERACTION_TYPE_LABELS, INTERACTION_TYPE_STYLES } from '../../lib/interactionLabels'
import type { CompatibilityFinding } from '../../types'

export function CompatibilityFindingCard({ finding }: { finding: CompatibilityFinding }) {
  const style = INTERACTION_TYPE_STYLES[finding.interaction_type]

  return (
    <div className="rounded-xl border border-line bg-cream/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
            style,
          )}
        >
          {INTERACTION_TYPE_LABELS[finding.interaction_type]}
        </span>
        <Link
          to={`/products/${finding.existing_product_id}`}
          className="text-xs font-medium text-sage-deep hover:underline"
        >
          with {finding.existing_product_name}
        </Link>
        <span className="ml-auto text-[11px] text-ink-faint">
          confidence: {finding.confidence}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <IngredientLink name={finding.candidate_ingredient} />
        <span className="text-xs text-ink-faint">×</span>
        <IngredientLink name={finding.existing_ingredient} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{finding.rationale}</p>

      {finding.potential_effect && (
        <p className="mt-2 text-sm text-ink">
          <span className="font-medium">What this means:</span> {finding.potential_effect}
        </p>
      )}

      <p className="mt-2 text-xs leading-relaxed text-ink-faint">{finding.routine_context}</p>

      {finding.recommended_precautions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-ink">What to consider</p>
          <ul className="mt-1 space-y-1">
            {finding.recommended_precautions.map((p, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-ink-soft">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sage" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {finding.possible_scheduling_options.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-ink">Scheduling options</p>
          <ul className="mt-1 space-y-1">
            {finding.possible_scheduling_options.map((p, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-ink-soft">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-lavender" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2 text-[11px] text-ink-faint">
        <span>Evidence quality: {finding.evidence_quality || 'Not stated'}</span>
        {finding.source_references.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sage-deep hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> {s.name}
          </a>
        ))}
      </div>
    </div>
  )
}
