import { Link } from 'react-router-dom'
import { Camera, Moon, Package, Plus, Sparkles, Sun } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useData } from '../context/DataContext'

export function Dashboard() {
  const { products, routine, seedSampleData } = useData()
  const productById = new Map(products.map((p) => [p.id, p]))
  const totalSteps = routine.morning.length + routine.evening.length

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm font-medium text-sage-deep">
          <Sparkles className="h-4 w-4" />
          Your skincare routine, understood
        </div>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Welcome back</h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
          Understand your products at the ingredient level, and see how a new
          product fits before you buy it.
        </p>
      </header>

      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-wash text-sage-deep">
              <Package className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="font-display text-2xl text-ink">{products.length}</p>
              <p className="text-xs text-ink-soft">Products saved</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-lavender-soft text-lavender-deep">
              <Sun className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="font-display text-2xl text-ink">{routine.morning.length}</p>
              <p className="text-xs text-ink-soft">Morning steps</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-ink-soft">
              <Moon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="font-display text-2xl text-ink">{routine.evening.length}</p>
              <p className="text-xs text-ink-soft">Evening steps</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Primary actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex flex-col justify-between border-sage/40 bg-sage-wash p-5 sm:col-span-2">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage text-white">
              <Camera className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h2 className="mt-3 font-display text-xl text-ink">Scan a new product</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Photograph a product and see how it fits into your routine before
              you buy it.
            </p>
          </div>
          <div className="mt-4">
            <Link to="/scan">
              <Button>Start a scan</Button>
            </Link>
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="flex-1 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lavender-soft text-lavender-deep">
              <Plus className="h-4.5 w-4.5" />
            </div>
            <h2 className="mt-3 font-display text-lg text-ink">Add manually</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Enter a product you already own.
            </p>
            <Link to="/products/new" className="mt-3 inline-block">
              <Button variant="secondary" size="sm">
                Add a product
              </Button>
            </Link>
          </Card>
          <Card className="flex-1 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-ink-soft">
              <Sun className="h-4.5 w-4.5" />
            </div>
            <h2 className="mt-3 font-display text-lg text-ink">Your routine</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              {totalSteps > 0
                ? `${totalSteps} scheduled steps`
                : 'Build your morning & evening routine'}
            </p>
            <Link to="/routine" className="mt-3 inline-block">
              <Button variant="secondary" size="sm">
                View routine
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Today's routine preview */}
      <div className="mt-8">
        <h2 className="font-display text-xl text-ink">Today&apos;s routine</h2>
        {products.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={<Sun className="h-5 w-5" />}
            title="Get started"
            description="Add a product to your inventory, then build a morning and evening routine to see it here."
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
        ) : totalSteps === 0 ? (
          <EmptyState
            className="mt-4"
            icon={<Sun className="h-5 w-5" />}
            title="No routine yet"
            description="You have products saved, but none are scheduled. Add them to a morning or evening routine."
            action={
              <Link to="/routine">
                <Button variant="secondary" size="sm">
                  Build your routine
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(['morning', 'evening'] as const).map((tod) => (
              <Card key={tod} className="p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  {tod === 'morning' ? (
                    <Sun className="h-4 w-4 text-sage-deep" />
                  ) : (
                    <Moon className="h-4 w-4 text-lavender-deep" />
                  )}
                  {tod === 'morning' ? 'Morning' : 'Evening'}
                </div>
                <ol className="mt-3 space-y-2">
                  {routine[tod].map((step) => (
                    <li key={step.id} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-wash text-xs font-medium text-sage-deep">
                        {step.order}
                      </span>
                      <span className="text-sm text-ink">
                        {productById.get(step.productId)?.name ?? 'Unknown product'}
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
