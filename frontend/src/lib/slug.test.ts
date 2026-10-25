import { describe, expect, it } from 'vitest'
import { slugify, unslugify } from './slug'

describe('slugify', () => {
  it('turns names into URL slugs', () => {
    expect(slugify('Hyaluronic Acid')).toBe('hyaluronic-acid')
    expect(slugify('Ceramide NP')).toBe('ceramide-np')
    expect(slugify('  Glycerin  ')).toBe('glycerin')
  })
})

describe('unslugify', () => {
  it('humanizes slugs for display', () => {
    expect(unslugify('hyaluronic-acid')).toBe('Hyaluronic Acid')
  })
})
