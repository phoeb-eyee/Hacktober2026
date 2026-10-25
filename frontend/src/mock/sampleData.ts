// SAMPLE DATA — for UI demonstration only.
//
// Everything in this file is clearly-labeled demo content. Product names and
// brands are fictional. Ingredient names are real, but the "products" that
// contain them are not real formulations. This file is isolated from all
// application logic and is removed / replaced as real data arrives in later
// phases.

import type { Product, Routine } from '../types'

export const sampleProducts: Product[] = [
  {
    id: 'p1',
    name: 'Gentle Hydrating Cleanser',
    brand: 'Velvet Lab',
    category: 'cleanser',
    ingredients: ['Water', 'Glycerin', 'Cocamidopropyl Betaine', 'Hyaluronic Acid', 'Ceramide NP'],
    verificationStatus: 'user_provided',
    createdAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'p2',
    name: 'Brightening Vitamin C Serum',
    brand: 'Ardent Skin',
    category: 'serum',
    ingredients: ['Water', 'Ascorbic Acid', 'Ferulic Acid', 'Glycerin', 'Tocopherol'],
    verificationStatus: 'ai_extracted',
    createdAt: '2026-10-03T11:00:00.000Z',
  },
  {
    id: 'p3',
    name: 'Barrier Repair Moisturizer',
    brand: 'Ardent Skin',
    category: 'moisturizer',
    ingredients: ['Water', 'Glycerin', 'Ceramide NP', 'Squalane', 'Shea Butter'],
    verificationStatus: 'verified',
    createdAt: '2026-10-05T14:30:00.000Z',
  },
  {
    id: 'p4',
    name: 'Tretinoin 0.05% Cream',
    brand: 'Derm Rx',
    category: 'treatment',
    ingredients: ['Tretinoin'],
    verificationStatus: 'verified',
    createdAt: '2026-10-08T20:00:00.000Z',
  },
  {
    id: 'p5',
    name: 'Mineral SPF 50',
    brand: 'Velvet Lab',
    category: 'sunscreen',
    ingredients: ['Zinc Oxide', 'Water', 'Caprylic/Capric Triglyceride', 'Glycerin'],
    verificationStatus: 'user_provided',
    createdAt: '2026-10-10T08:00:00.000Z',
  },
]

export const sampleRoutine: Routine = {
  morning: [
    { id: 's1', productId: 'p1', timeOfDay: 'morning', order: 1, days: [] },
    { id: 's2', productId: 'p2', timeOfDay: 'morning', order: 2, days: [] },
    { id: 's3', productId: 'p3', timeOfDay: 'morning', order: 3, days: [] },
    { id: 's4', productId: 'p5', timeOfDay: 'morning', order: 4, days: [] },
  ],
  evening: [
    { id: 's5', productId: 'p1', timeOfDay: 'evening', order: 1, days: [] },
    { id: 's6', productId: 'p4', timeOfDay: 'evening', order: 2, days: [] },
    { id: 's7', productId: 'p3', timeOfDay: 'evening', order: 3, days: [] },
  ],
}
