import { Link } from 'react-router-dom'
import { IngredientLink } from '../IngredientLink'
import type { RedundancyFinding } from '../../types'

export function RedundancyFindingCard({ finding }: { finding: RedundancyFinding }) {
  return (
    <div className="rounded-xl border border-line bg-cream/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-lavender-soft bg-lavender-soft px-2.5 py-0.5 text-[11px] font-medium text-lavender-deep">
          Possible overlap
        </span>
        <Link
          to={`/products/${finding.existing_product_id}`}
          className="text-xs font-medium text-sage-deep hover:underline"
        >
          {finding.existing_product_name}
        </Link>
      </div>

      {finding.shared_ingredients.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-ink">Shared ingredients</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {finding.shared_ingredients.map((name) => (
              <IngredientLink key={name} name={name} />
            ))}
          </div>
        </div>
      )}

      {finding.overlapping_functions.length > 0 && (
        <p className="mt-2 text-xs text-ink-soft">
          Overlapping functions:{' '}
          <span className="text-ink">{finding.overlapping_functions.join(', ')}</span>
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{finding.rationale}</p>
    </div>
  )
}
