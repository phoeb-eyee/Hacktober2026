import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product, Routine, RoutineStep, TimeOfDay } from '../types'
import { loadProducts, loadRoutine, saveProducts, saveRoutine } from '../lib/storage'
import { genId } from '../lib/id'
import { sampleProducts, sampleRoutine } from '../mock/sampleData'

// The user's real data (products + routine), persisted to localStorage behind
// the storage interface. Distinct from the still-placeholder ingredient and
// analysis sample data.

export type ProductInput = Omit<Product, 'id' | 'createdAt'>

interface DataContextValue {
  products: Product[]
  routine: Routine
  addProduct: (input: ProductInput) => Product
  updateProduct: (id: string, input: ProductInput) => void
  deleteProduct: (id: string) => void
  addToRoutine: (productId: string, timeOfDay: TimeOfDay) => void
  removeFromRoutine: (stepId: string) => void
  moveStep: (stepId: string, dir: -1 | 1) => void
  setStepDays: (stepId: string, days: number[]) => void
  seedSampleData: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

function renumber(col: RoutineStep[]): RoutineStep[] {
  return col.map((s, i) => ({ ...s, order: i + 1 }))
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => loadProducts())
  const [routine, setRoutine] = useState<Routine>(() => loadRoutine())

  useEffect(() => {
    saveProducts(products)
  }, [products])

  useEffect(() => {
    saveRoutine(routine)
  }, [routine])

  const value = useMemo<DataContextValue>(
    () => ({
      products,
      routine,

      addProduct(input) {
        const product: Product = {
          ...input,
          id: genId(),
          createdAt: new Date().toISOString(),
        }
        setProducts((prev) => [...prev, product])
        return product
      },

      updateProduct(id, input) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...input } : p)))
      },

      deleteProduct(id) {
        // Also drop any routine steps referencing the product, so no broken refs remain.
        setProducts((prev) => prev.filter((p) => p.id !== id))
        setRoutine((prev) => ({
          morning: prev.morning.filter((s) => s.productId !== id),
          evening: prev.evening.filter((s) => s.productId !== id),
        }))
      },

      addToRoutine(productId, timeOfDay) {
        setRoutine((prev) => {
          const col = prev[timeOfDay]
          if (col.some((s) => s.productId === productId)) return prev // no duplicate in same column
          const step: RoutineStep = {
            id: genId(),
            productId,
            timeOfDay,
            order: col.length + 1,
            days: [],
          }
          return { ...prev, [timeOfDay]: [...col, step] }
        })
      },

      removeFromRoutine(stepId) {
        setRoutine((prev) => ({
          morning: renumber(prev.morning.filter((s) => s.id !== stepId)),
          evening: renumber(prev.evening.filter((s) => s.id !== stepId)),
        }))
      },

      moveStep(stepId, dir) {
        setRoutine((prev) => {
          const key: TimeOfDay = prev.morning.some((s) => s.id === stepId)
            ? 'morning'
            : 'evening'
          const col = prev[key]
          const idx = col.findIndex((s) => s.id === stepId)
          const target = idx + dir
          if (idx < 0 || target < 0 || target >= col.length) return prev
          const next = [...col]
          ;[next[idx], next[target]] = [next[target], next[idx]]
          return { ...prev, [key]: renumber(next) }
        })
      },

      setStepDays(stepId, days) {
        setRoutine((prev) => ({
          morning: prev.morning.map((s) => (s.id === stepId ? { ...s, days } : s)),
          evening: prev.evening.map((s) => (s.id === stepId ? { ...s, days } : s)),
        }))
      },

      seedSampleData() {
        setProducts(sampleProducts)
        setRoutine(sampleRoutine)
      },
    }),
    [products, routine],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
