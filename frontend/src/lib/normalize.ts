/** Normalize an ingredient name so product-label text (e.g. "Ceramide NP",
 * "Ascorbic Acid (Vitamin C)") resolves to a canonical record. Mirrors the
 * backend's normalize() in app/services/ingredients.py. */
export function normalizeIngredient(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
