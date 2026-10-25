import { Leaf } from 'lucide-react'
import { cn } from '../lib/cn'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl bg-sage text-white shadow-card',
        className,
      )}
    >
      <Leaf className="h-4.5 w-4.5" strokeWidth={1.75} />
    </span>
  )
}

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandMark />
      <span className="font-display text-xl tracking-tight text-ink">
        Skin<span className="text-sage-deep">Sync</span>
      </span>
    </div>
  )
}
