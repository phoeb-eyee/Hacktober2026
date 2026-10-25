import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-line bg-surface shadow-card',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'
