import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

/** A small, selectable pill — used for ingredient names and category tags. */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, active, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40',
        active
          ? 'border-sage-deep bg-sage-soft text-sage-deep'
          : 'border-line bg-surface text-ink-soft hover:border-sage hover:text-sage-deep',
        className,
      )}
      {...props}
    />
  ),
)
Chip.displayName = 'Chip'
