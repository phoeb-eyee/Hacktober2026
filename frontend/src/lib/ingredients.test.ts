import { describe, expect, it } from 'vitest'
import { parseIngredients } from './ingredients'

describe('parseIngredients', () => {
  it('splits on newlines, trims, and dedupes case-insensitively', () => {
    expect(parseIngredients('Water\nGlycerin\n  glycerin  \n\nWater')).toEqual([
      'Water',
      'Glycerin',
    ])
  })

  it('returns an empty array for empty input', () => {
    expect(parseIngredients('')).toEqual([])
    expect(parseIngredients('   \n\n ')).toEqual([])
  })
})
