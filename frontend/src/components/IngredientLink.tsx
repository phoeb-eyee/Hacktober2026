import { ChipLink } from './ui/ChipLink'
import { slugify } from '../lib/slug'
import { useIngredients } from '../context/IngredientContext'

/** A single ingredient name rendered as a link to its detail page (if known). */
export function IngredientLink({ name }: { name: string }) {
  const { resolve } = useIngredients()
  const resolved = resolve(name)
  const to = resolved ? `/ingredients/${resolved.id}` : `/ingredients/${slugify(name)}`
  return <ChipLink to={to}>{name}</ChipLink>
}
