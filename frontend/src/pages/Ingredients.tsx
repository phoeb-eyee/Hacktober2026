import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Search } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/EmptyState'
import { useIngredients } from '../context/IngredientContext'

export function Ingredients() {
  const { ingredients, loading, error } = useIngredients()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ingredients
    return ingredients.filter(
      (i) =>
        i.canonical_name.toLowerCase().includes(q) ||
        i.ingredient_category.toLowerCase().includes(q) ||
        i.aliases.some((a) => a.toLowerCase().includes(q)),
    )
  }, [ingredients, query])

  return (
    <div>
      <PageHeader
        title="Ingredient Explorer"
        description="Learn what individual ingredients actually do — their purpose, how they work, and what to know before using them."
      />

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ingredients…"
          className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-sage-deep" />
          <p className="text-sm text-ink-soft">Loading ingredients…</p>
        </div>
      ) : error ? (
        <EmptyState
          title="Couldn't load the ingredient database"
          description={error}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching ingredients" description="Try a different search term." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ing) => (
            <Link key={ing.ingredient_id} to={`/ingredients/${ing.ingredient_id}`}>
              <Card className="h-full p-5 transition-shadow hover:shadow-lift">
                <h3 className="font-display text-lg leading-snug text-ink">
                  {ing.canonical_name}
                </h3>
                {ing.ingredient_category && (
                  <div className="mt-2">
                    <Chip disabled tabIndex={-1}>
                      {ing.ingredient_category}
                    </Chip>
                  </div>
                )}
                {ing.short_description && (
                  <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                    {ing.short_description}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
