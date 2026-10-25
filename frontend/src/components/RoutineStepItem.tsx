import { useState } from 'react'
import { CalendarDays, ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react'
import { cn } from '../lib/cn'
import type { Product, RoutineStep } from '../types'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function DayPicker({
  days,
  onChange,
}: {
  days: number[]
  onChange: (days: number[]) => void
}) {
  const toggle = (i: number) => {
    onChange(
      days.includes(i) ? days.filter((d) => d !== i) : [...days, i].sort((a, b) => a - b),
    )
  }
  return (
    <div className="flex flex-wrap gap-1">
      {DAYS.map((label, i) => {
        const active = days.includes(i)
        return (
          <button
            key={label}
            type="button"
            onClick={() => toggle(i)}
            aria-pressed={active}
            title={label}
            className={cn(
              'h-6 w-6 rounded-full text-[10px] font-medium transition-colors',
              active
                ? 'bg-sage text-white'
                : 'border border-line bg-cream text-ink-faint hover:text-ink',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function RoutineStepItem({
  step,
  product,
  index,
  total,
  onMove,
  onRemove,
  onSetDays,
}: {
  step: RoutineStep
  product?: Product
  index: number
  total: number
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  onSetDays: (days: number[]) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const scheduled = step.days.length > 0

  return (
    <div className="rounded-xl border border-line bg-cream/60">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <GripVertical className="h-4 w-4 shrink-0 text-ink-faint" />
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-medium text-sage-deep shadow-card">
          {step.order}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {product ? product.name : 'Unknown product'}
          </p>
          <p className="truncate text-xs text-ink-faint">
            {product ? product.brand : 'no longer in inventory'}
            {scheduled && ' · selected days'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="rounded-lg p-1.5 text-ink-faint hover:bg-sage-wash hover:text-ink"
          title={expanded ? 'Hide schedule' : 'Set days'}
        >
          <CalendarDays className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="rounded-lg p-1.5 text-ink-faint hover:bg-sage-wash hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          title="Move up"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          className="rounded-lg p-1.5 text-ink-faint hover:bg-sage-wash hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          title="Move down"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-1.5 text-ink-faint hover:bg-red-50 hover:text-red-600"
          title="Remove from routine"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-line px-3 py-2.5">
          <p className="mb-1.5 text-[11px] font-medium text-ink-soft">
            {scheduled ? 'Apply on selected days only' : 'Applied every day'}
          </p>
          <DayPicker days={step.days} onChange={onSetDays} />
        </div>
      )}
    </div>
  )
}
