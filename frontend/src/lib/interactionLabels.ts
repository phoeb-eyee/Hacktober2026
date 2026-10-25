import type { InteractionType } from '../types'

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  established_incompatibility: 'Established incompatibility',
  potential_irritation: 'Potential irritation',
  context_dependent: 'Context-dependent',
  scheduling_consideration: 'Scheduling consideration',
  insufficient_evidence: 'Insufficient evidence',
  no_established_concern: 'No established concern',
}

// Tailwind classes so the UI visually separates established vs potential vs
// uncertain concerns (a core requirement).
export const INTERACTION_TYPE_STYLES: Record<InteractionType, string> = {
  established_incompatibility: 'bg-red-50 text-red-700 border-red-200',
  potential_irritation: 'bg-amber-50 text-amber-700 border-amber-200',
  context_dependent: 'bg-lavender-soft text-lavender-deep border-lavender-soft',
  scheduling_consideration: 'bg-sage-soft text-sage-deep border-sage-soft',
  insufficient_evidence: 'bg-cream text-ink-soft border-line',
  no_established_concern: 'bg-sage-wash text-sage-deep border-sage-soft',
}
