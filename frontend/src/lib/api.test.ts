import { describe, expect, it } from 'vitest'
import { buildAnalyzeRequest } from './api'
import type { AnalysisCandidate, Product, Routine } from '../types'

describe('buildAnalyzeRequest', () => {
  it('excludes the candidate and maps routine steps to snake_case', () => {
    const candidate: AnalysisCandidate = {
      id: 'p1',
      name: 'A',
      brand: 'B',
      category: 'serum',
      ingredients: ['X'],
    }
    const products: Product[] = [
      {
        id: 'p1',
        name: 'A',
        brand: 'B',
        category: 'serum',
        ingredients: ['X'],
        verificationStatus: 'verified',
        createdAt: '2026-01-01',
      },
      {
        id: 'p2',
        name: 'C',
        brand: 'D',
        category: 'moisturizer',
        ingredients: ['Y'],
        verificationStatus: 'user_provided',
        createdAt: '2026-01-02',
      },
    ]
    const routine: Routine = {
      morning: [{ id: 's1', productId: 'p2', timeOfDay: 'morning', order: 1, days: [] }],
      evening: [],
    }

    const req = buildAnalyzeRequest(candidate, products, routine)

    expect(req.candidate.id).toBe('p1')
    expect(req.existing_products.map((p) => p.id)).toEqual(['p2'])
    expect(req.morning).toEqual([
      { product_id: 'p2', time_of_day: 'morning', order: 1, days: [] },
    ])
    expect(req.evening).toEqual([])
  })
})
