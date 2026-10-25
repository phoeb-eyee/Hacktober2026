/** Normalize an ingredient name into a URL slug, e.g. "Hyaluronic Acid" → "hyaluronic-acid". */
export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Best-effort humanize a slug back into a display name for unknown ingredients. */
export function unslugify(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
