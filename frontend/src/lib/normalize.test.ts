import { describe, expect, it } from 'vitest'
import { normalizeIngredient } from './normalize'

describe('normalizeIngredient', () => {
  it('strips parentheticals', () => {
    expect(normalizeIngredient('Ascorbic Acid (Vitamin C)')).toBe('ascorbic acid')
    expect(normalizeIngredient('Tocopherol (Vitamin E)')).toBe('tocopherol')
  })

  it('normalizes case, underscores, hyphens, and extra spaces', () => {
    expect(normalizeIngredient('Ceramide-NP')).toBe('ceramide np')
    expect(normalizeIngredient('  Vitamin_C  ')).toBe('vitamin c')
    expect(normalizeIngredient('NIACINAMIDE')).toBe('niacinamide')
  })
})
