import { cn } from '../../lib/cn'
import type { VerificationStatus } from '../../types'

const config: Record<VerificationStatus, { label: string; className: string; dot: string }> = {
  verified: {
    label: 'Verified',
    className: 'bg-sage-soft text-sage-deep',
    dot: 'bg-sage-deep',
  },
  user_provided: {
    label: 'You added',
    className: 'bg-cream text-ink-soft',
    dot: 'bg-ink-soft',
  },
  ai_extracted: {
    label: 'AI-extracted',
    className: 'bg-lavender-soft text-lavender-deep',
    dot: 'bg-lavender-deep',
  },
  unverified: {
    label: 'Unverified',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-600',
  },
}

/** Shows where a product's ingredient list came from. */
export function StatusBadge({ status }: { status: VerificationStatus }) {
  const c = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
        c.className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  )
}
