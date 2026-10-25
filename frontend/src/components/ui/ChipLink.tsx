import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

/** A chip-styled router link — used for selectable ingredient names. */
export function ChipLink({
  to,
  className,
  children,
}: {
  to: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium',
        'text-ink-soft transition-colors hover:border-sage hover:text-sage-deep',
        className,
      )}
    >
      {children}
    </Link>
  )
}
