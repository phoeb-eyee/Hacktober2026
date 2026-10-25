import type { ProductCategory, VerificationStatus } from '../types'

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  cleanser: 'Cleanser',
  moisturizer: 'Moisturizer',
  sunscreen: 'Sunscreen',
  serum: 'Serum',
  exfoliant: 'Exfoliant',
  treatment: 'Treatment',
  other: 'Other',
}

export const CATEGORY_OPTIONS: ProductCategory[] = [
  'cleanser',
  'moisturizer',
  'sunscreen',
  'serum',
  'exfoliant',
  'treatment',
  'other',
]

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  verified: 'Verified (source-backed)',
  user_provided: 'Entered by you',
  ai_extracted: 'AI-extracted (unconfirmed)',
  unverified: 'Unverified',
}
