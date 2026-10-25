import type { Recommendation } from '../types'

export const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  potentially_useful_addition: 'Potentially useful addition',
  possible_functional_overlap: 'Possible functional overlap',
  potential_irritation_concern: 'Potential irritation concern',
  consider_application_schedule: 'Consider a different schedule',
  more_information_needed: 'More information needed',
}

// Ordered by severity: schedule (may include established incompatibility) is the
// strongest, then irritation, then overlap, then a neutral/positive result.
export const RECOMMENDATION_STYLES: Record<Recommendation, string> = {
  consider_application_schedule: 'bg-red-50 text-red-700 border-red-200',
  potential_irritation_concern: 'bg-amber-50 text-amber-700 border-amber-200',
  possible_functional_overlap: 'bg-lavender-soft text-lavender-deep border-lavender-soft',
  potentially_useful_addition: 'bg-sage-soft text-sage-deep border-sage-soft',
  more_information_needed: 'bg-cream text-ink-soft border-line',
}
