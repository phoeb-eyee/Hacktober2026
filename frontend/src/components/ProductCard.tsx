import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Card } from './ui/Card'
import { StatusBadge } from './ui/StatusBadge'
import { CATEGORY_LABELS } from '../lib/labels'
import type { Product } from '../types'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className="block h-full">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lift">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-36 w-full object-cover"
          />
        ) : (
          <div className="flex h-36 w-full items-center justify-center bg-sage-wash text-sage-deep">
            <Package className="h-8 w-8" strokeWidth={1.5} />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
              {CATEGORY_LABELS[product.category]}
            </span>
            <StatusBadge status={product.verificationStatus} />
          </div>
          <h3 className="mt-2 font-display text-lg leading-snug text-ink">{product.name}</h3>
          <p className="text-sm text-ink-soft">{product.brand}</p>
          <p className="mt-3 text-xs text-ink-faint">
            {product.ingredients.length} ingredient{product.ingredients.length === 1 ? '' : 's'} on file
          </p>
        </div>
      </Card>
    </Link>
  )
}
