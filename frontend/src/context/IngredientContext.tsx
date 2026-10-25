import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { IngredientSummary } from '../types'
import { listIngredients } from '../lib/api'
import { normalizeIngredient } from '../lib/normalize'

interface ResolvedIngredient {
  id: string
  name: string
}

interface IngredientContextValue {
  ingredients: IngredientSummary[]
  loading: boolean
  error: string | null
  resolve: (name: string) => ResolvedIngredient | null
}

const IngredientContext = createContext<IngredientContextValue | null>(null)

export function IngredientProvider({ children }: { children: ReactNode }) {
  const [ingredients, setIngredients] = useState<IngredientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    listIngredients()
      .then((data) => {
        if (active) setIngredients(data)
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load ingredients.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const index = useMemo(() => {
    const map = new Map<string, ResolvedIngredient>()
    for (const ing of ingredients) {
      for (const alias of [ing.canonical_name, ...ing.aliases]) {
        const key = normalizeIngredient(alias)
        if (key && !map.has(key)) {
          map.set(key, { id: ing.ingredient_id, name: ing.canonical_name })
        }
      }
    }
    return map
  }, [ingredients])

  const resolve = useMemo(
    () => (name: string) => index.get(normalizeIngredient(name)) ?? null,
    [index],
  )

  const value = useMemo(
    () => ({ ingredients, loading, error, resolve }),
    [ingredients, loading, error, resolve],
  )

  return <IngredientContext.Provider value={value}>{children}</IngredientContext.Provider>
}

export function useIngredients() {
  const ctx = useContext(IngredientContext)
  if (!ctx) throw new Error('useIngredients must be used within an IngredientProvider')
  return ctx
}
