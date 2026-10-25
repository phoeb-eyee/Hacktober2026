import { IngredientLink } from './IngredientLink'

/** Renders ingredient names as selectable chips linking to their detail page. */
export function IngredientChips({ ingredients }: { ingredients: string[] }) {
  if (ingredients.length === 0) {
    return <p className="text-sm text-ink-faint">No ingredients recorded.</p>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {ingredients.map((name) => (
        <IngredientLink key={name} name={name} />
      ))}
    </div>
  )
}
