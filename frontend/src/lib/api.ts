import type {
  AnalysisCandidate,
  AnalysisResult,
  AnalyzeRequest,
  IngredientDetail,
  IngredientSummary,
  Product,
  Routine,
  ScanResult,
} from '../types'

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Send a product image to the backend for Gemma 4 analysis. */
export async function scanProductImage(file: File): Promise<ScanResult> {
  const form = new FormData()
  form.append('file', file)

  let res: Response
  try {
    res = await fetch('/api/scan', { method: 'POST', body: form })
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?')
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body && typeof body.detail === 'string') detail = body.detail
    } catch {
      // ignore — keep the generic message
    }
    throw new ApiError(detail, res.status)
  }

  return (await res.json()) as ScanResult
}

/** Fetch the full ingredient index (summaries include aliases for normalization). */
export async function listIngredients(): Promise<IngredientSummary[]> {
  const res = await fetch('/api/ingredients')
  if (!res.ok) throw new ApiError(`Failed to load ingredients (${res.status})`, res.status)
  return (await res.json()) as IngredientSummary[]
}

/** Fetch one ingredient's full educational record plus its interactions. */
export async function getIngredient(id: string): Promise<IngredientDetail> {
  const res = await fetch(`/api/ingredients/${encodeURIComponent(id)}`)
  if (res.status === 404) throw new ApiError('Ingredient not found.', 404)
  if (!res.ok) throw new ApiError(`Failed to load ingredient (${res.status})`, res.status)
  return (await res.json()) as IngredientDetail
}

/** Run the compatibility & redundancy analysis against the user's routine. */
export async function analyzeProduct(request: AnalyzeRequest): Promise<AnalysisResult> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    let detail = `Analysis failed (${res.status})`
    try {
      const body = await res.json()
      if (body && typeof body.detail === 'string') detail = body.detail
    } catch {
      // keep generic message
    }
    throw new ApiError(detail, res.status)
  }
  return (await res.json()) as AnalysisResult
}

/** Build an AnalyzeRequest from the candidate + the user's inventory and routine. */
export function buildAnalyzeRequest(
  candidate: AnalysisCandidate,
  products: Product[],
  routine: Routine,
): AnalyzeRequest {
  const existing_products = products
    .filter((p) => p.id !== candidate.id)
    .map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      ingredients: p.ingredients,
    }))
  const toSteps = (steps: Routine['morning']) =>
    steps.map((s) => ({
      product_id: s.productId,
      time_of_day: s.timeOfDay,
      order: s.order,
      days: s.days,
    }))
  return {
    candidate,
    existing_products,
    morning: toSteps(routine.morning),
    evening: toSteps(routine.evening),
  }
}
