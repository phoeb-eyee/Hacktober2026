import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Activity, ArrowLeft, CalendarClock, Package, Pencil } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { EmptyState } from '../components/ui/EmptyState'
import { IngredientChips } from '../components/IngredientChips'
import { useData } from '../context/DataContext'
import { CATEGORY_LABELS } from '../lib/labels'

export function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, deleteProduct } = useData()
  const product = products.find((p) => p.id === id)
  const [confirming, setConfirming] = useState(false)

  if (!product) {
    return (
      <EmptyState
        icon={<Package className="h-5 w-5" />}
        title="Product not found"
        description="This product may have been deleted from your inventory."
        action={
          <Link to="/products">
            <Button variant="secondary" size="sm">
              Back to My Products
            </Button>
          </Link>
        }
      />
    )
  }

  const handleDelete = () => {
    deleteProduct(product.id)
    navigate('/products')
  }

  return (
    <div>
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> My Products
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-20 w-20 rounded-2xl border border-line object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sage-wash text-sage-deep">
              <Package className="h-8 w-8" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                {CATEGORY_LABELS[product.category]}
              </span>
              <StatusBadge status={product.verificationStatus} />
            </div>
            <h1 className="mt-1 font-display text-3xl leading-tight text-ink">
              {product.name}
            </h1>
            <p className="text-sm text-ink-soft">{product.brand}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              navigate('/analysis', {
                state: {
                  candidate: {
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    category: product.category,
                    ingredients: product.ingredients,
                  },
                },
              })
            }
          >
            <Activity className="h-4 w-4" /> Analyze
          </Button>
          <Link to={`/products/${product.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </Link>
          {confirming ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg text-ink">Ingredients</h2>
          <p className="mt-0.5 text-xs text-ink-faint">
            Select an ingredient to learn about it.
          </p>
          <div className="mt-3">
            <IngredientChips ingredients={product.ingredients} />
          </div>
        </Card>

        {product.notes && (
          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg text-ink">Notes</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{product.notes}</p>
          </Card>
        )}

        <Card className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="font-display text-lg text-ink">Use this in your routine</h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Add it to a morning or evening lineup from the routine builder.
            </p>
          </div>
          <Link to="/routine">
            <Button variant="secondary" size="sm">
              <CalendarClock className="h-4 w-4" /> Open routine
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
