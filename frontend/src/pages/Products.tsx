import { Link } from 'react-router-dom'
import { Camera, Package, Plus, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ProductCard } from '../components/ProductCard'
import { useData } from '../context/DataContext'

export function Products() {
  const { products, seedSampleData } = useData()

  return (
    <div>
      <PageHeader
        title="My Products"
        description="Your personal shelf. Every product you save lives here, whether or not it's in an active routine."
        actions={
          <>
            <Link to="/scan">
              <Button variant="secondary" size="sm">
                <Camera className="h-4 w-4" /> Scan
              </Button>
            </Link>
            <Link to="/products/new">
              <Button size="sm">
                <Plus className="h-4 w-4" /> Add product
              </Button>
            </Link>
          </>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="Your shelf is empty"
          description="Photograph a product to identify it, or add one manually. Saved products appear here and can be added to your routine."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link to="/scan">
                <Button>Scan a product</Button>
              </Link>
              <Link to="/products/new">
                <Button variant="secondary">Add manually</Button>
              </Link>
              <Button variant="ghost" onClick={seedSampleData}>
                <Sparkles className="h-4 w-4" /> Load sample data
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
