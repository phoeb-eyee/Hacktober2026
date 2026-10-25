import type { Product, Routine, RoutineStep } from '../types'

// Data-access interface. The rest of the app talks to localStorage only through
// these functions, so this can be swapped for a backend/SQLite later without
// touching UI or business logic.

const PRODUCTS_KEY = 'skinsync:products:v1'
const ROUTINE_KEY = 'skinsync:routine:v1'

function isProductLike(x: unknown): x is Product {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.brand === 'string' &&
    typeof o.category === 'string' &&
    Array.isArray(o.ingredients)
  )
}

function isStepLike(x: unknown): x is RoutineStep {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.productId === 'string' &&
    typeof o.timeOfDay === 'string' &&
    typeof o.order === 'number' &&
    Array.isArray(o.days)
  )
}

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isProductLike)
  } catch {
    return []
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  } catch {
    // Quota exceeded or storage unavailable — fail silently rather than crash.
  }
}

export function loadRoutine(): Routine {
  try {
    const raw = localStorage.getItem(ROUTINE_KEY)
    if (!raw) return { morning: [], evening: [] }
    const parsed = JSON.parse(raw)
    return {
      morning: Array.isArray(parsed?.morning) ? parsed.morning.filter(isStepLike) : [],
      evening: Array.isArray(parsed?.evening) ? parsed.evening.filter(isStepLike) : [],
    }
  } catch {
    return { morning: [], evening: [] }
  }
}

export function saveRoutine(routine: Routine): void {
  try {
    localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine))
  } catch {
    // Ignore persistence failures.
  }
}
