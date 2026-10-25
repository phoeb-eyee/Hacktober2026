import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Plus, Sun } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { RoutineStepItem } from '../components/RoutineStepItem'
import { useData } from '../context/DataContext'
import type { Product, RoutineStep, TimeOfDay } from '../types'

function RoutineColumn({
  timeOfDay,
  steps,
  products,
  onAdd,
  onRemove,
  onMove,
  onSetDays,
}: {
  timeOfDay: TimeOfDay
  steps: RoutineStep[]
  products: Product[]
  onAdd: (productId: string) => void
  onRemove: (stepId: string) => void
  onMove: (stepId: string, dir: -1 | 1) => void
  onSetDays: (stepId: string, days: number[]) => void
}) {
  const [addOpen, setAddOpen] = useState(false)
  const isMorning = timeOfDay === 'morning'
  const inColumn = new Set(steps.map((s) => s.productId))

  const sorted = [...steps].sort((a, b) => a.order - b.order)

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        {isMorning ? (
          <Sun className="h-4 w-4 text-sage-deep" />
        ) : (
          <Moon className="h-4 w-4 text-lavender-deep" />
        )}
        <span className="font-display text-lg">{isMorning ? 'Morning' : 'Evening'}</span>
        <span className="ml-auto text-xs text-ink-faint">{sorted.length} steps</span>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line bg-surface/60 p-4 text-sm text-ink-soft">
          Nothing scheduled yet.
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {sorted.map((step, i) => (
            <RoutineStepItem
              key={step.id}
              step={step}
              product={products.find((p) => p.id === step.productId)}
              index={i}
              total={sorted.length}
              onMove={(dir) => onMove(step.id, dir)}
              onRemove={() => onRemove(step.id)}
              onSetDays={(days) => onSetDays(step.id, days)}
            />
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={() => setAddOpen((o) => !o)}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sage-deep hover:text-ink"
      >
        <Plus className="h-4 w-4" /> Add product
      </button>

      {addOpen && (
        <div className="mt-3 space-y-1.5 rounded-xl border border-line bg-surface/70 p-2">
          {products.length === 0 && (
            <p className="px-2 py-1 text-sm text-ink-soft">
              No products in your inventory yet.
            </p>
          )}
          {products.map((p) => {
            const added = inColumn.has(p.id)
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-sage-wash/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{p.name}</p>
                  <p className="truncate text-xs text-ink-faint">{p.brand}</p>
                </div>
                {added ? (
                  <span className="shrink-0 text-xs font-medium text-sage-deep">Added</span>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAdd(p.id)}
                  >
                    Add
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export function Routine() {
  const { products, routine, addToRoutine, removeFromRoutine, moveStep, setStepDays, seedSampleData } =
    useData()

  if (products.length === 0) {
    return (
      <div>
        <PageHeader
          title="My Routine"
          description="Build a morning and evening lineup from your inventory, in application order."
        />
        <EmptyState
          icon={<Sun className="h-5 w-5" />}
          title="No products to schedule yet"
          description="Add products to your inventory first, then organize them into a routine here."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link to="/products/new">
                <Button size="sm">Add a product</Button>
              </Link>
              <Button size="sm" variant="secondary" onClick={seedSampleData}>
                Load sample data
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="My Routine"
        description="Your morning and evening lineup, in application order. Removing a product here never deletes it from your inventory."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RoutineColumn
          timeOfDay="morning"
          steps={routine.morning}
          products={products}
          onAdd={(productId) => addToRoutine(productId, 'morning')}
          onRemove={removeFromRoutine}
          onMove={moveStep}
          onSetDays={setStepDays}
        />
        <RoutineColumn
          timeOfDay="evening"
          steps={routine.evening}
          products={products}
          onAdd={(productId) => addToRoutine(productId, 'evening')}
          onRemove={removeFromRoutine}
          onMove={moveStep}
          onSetDays={setStepDays}
        />
      </div>
    </div>
  )
}
