import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Layers,
  Lightbulb,
  Loader2,
  Pencil,
  RefreshCw,
  Save,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Field } from '../components/ui/Field'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { IngredientLink } from '../components/IngredientLink'
import { CompatibilityFindingCard } from '../components/analysis/CompatibilityFindingCard'
import { RedundancyFindingCard } from '../components/analysis/RedundancyFindingCard'
import { useData } from '../context/DataContext'
import { analyzeProduct, buildAnalyzeRequest } from '../lib/api'
import { parseIngredients } from '../lib/ingredients'
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from '../lib/labels'
import { RECOMMENDATION_LABELS, RECOMMENDATION_STYLES } from '../lib/recommendation'
import { cn } from '../lib/cn'
import type { AnalysisCandidate, AnalysisResult, ProductCategory } from '../types'

type Status = 'idle' | 'loading' | 'ready' | 'error'

const PLACEMENT_LABELS = {
  morning: 'Morning',
  evening: 'Evening',
  both: 'Morning and evening',
  unspecified: 'Not determined',
} as const

export function Analysis() {
  const location = useLocation()
  const navigate = useNavigate()
  const { products, routine, addProduct } = useData()

  const [candidate, setCandidate] = useState<AnalysisCandidate | null>(
    () => (location.state as { candidate?: AnalysisCandidate } | null)?.candidate ?? null,
  )
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState<ProductCategory>('other')
  const [ingredientsText, setIngredientsText] = useState('')

  useEffect(() => {
    if (!candidate) return
    let active = true
    setStatus('loading')
    setError(null)
    setResult(null)
    analyzeProduct(buildAnalyzeRequest(candidate, products, routine))
      .then((r) => {
        if (active) {
          setResult(r)
          setStatus('ready')
        }
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : 'Analysis failed.')
          setStatus('error')
        }
      })
    return () => {
      active = false
    }
    // products/routine are read at analysis time; they are stable while viewing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate])

  const startEditing = () => {
    if (!candidate) return
    setName(candidate.name)
    setBrand(candidate.brand)
    setCategory(candidate.category)
    setIngredientsText(candidate.ingredients.join('\n'))
    setEditing(true)
  }

  const submitEdit = () => {
    if (!candidate) return
    const next: AnalysisCandidate = {
      id: candidate.id,
      name: name.trim() || candidate.name || 'Unnamed product',
      brand: brand.trim() || candidate.brand,
      category,
      ingredients: parseIngredients(ingredientsText),
    }
    setEditing(false)
    setStatus('loading')
    setCandidate(next)
  }

  const reset = () => {
    setCandidate(null)
    setResult(null)
    setStatus('idle')
    setError(null)
    setEditing(false)
  }

  const isSaved = candidate ? products.some((p) => p.id === candidate.id) : false

  const save = () => {
    if (!candidate) return
    const created = addProduct({
      name: candidate.name,
      brand: candidate.brand,
      category: candidate.category,
      ingredients: candidate.ingredients,
      verificationStatus: 'ai_extracted',
    })
    navigate(`/products/${created.id}`)
  }

  // --- Chooser (no candidate) ---
  if (!candidate) {
    return (
      <div>
        <PageHeader
          title="Analysis Results"
          description="See how a product you're considering fits into your saved routine — grounded in structured, source-backed data."
        />
        <Card className="p-6">
          <h2 className="font-display text-xl text-ink">Choose a product to analyze</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Pick a saved product, or scan a new one to evaluate before you buy.
          </p>

          <div className="mt-5">
            <Link to="/scan">
              <Button>
                <ScanLine className="h-4 w-4" /> Scan a new product
              </Button>
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="mt-5 text-sm text-ink-soft">
              You don't have any saved products yet. Scan one or add it from My
              Products first.
            </p>
          ) : (
            <div className="mt-5 space-y-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream/50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="truncate text-xs text-ink-faint">
                      {p.brand} · {CATEGORY_LABELS[p.category]}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setStatus('loading')
                      setCandidate({
                        id: p.id,
                        name: p.name,
                        brand: p.brand,
                        category: p.category,
                        ingredients: p.ingredients,
                      })
                    }}
                  >
                    Analyze
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    )
  }

  // --- Loading ---
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-sage-deep" />
        <p className="text-sm text-ink-soft">
          Analyzing "{candidate.name}" against your routine…
        </p>
      </div>
    )
  }

  // --- Error ---
  if (status === 'error' || !result) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Couldn't run the analysis"
        description={error ?? 'Something went wrong.'}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={reset}>
              Back
            </Button>
            <Button size="sm" onClick={() => { setStatus('loading'); setCandidate({ ...candidate }) }}>
              Try again
            </Button>
          </div>
        }
      />
    )
  }

  // --- Edit form ---
  if (editing) {
    return (
      <div>
        <PageHeader title="Correct the product" description="Fix any details, then re-run the analysis." />
        <Card className="space-y-4 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Product name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Brand">
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </Field>
          </div>
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Ingredients" hint="One per line.">
            <Textarea value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} rows={5} />
          </Field>
          <div className="flex gap-2">
            <Button onClick={submitEdit}>Re-run analysis</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // --- Report ---
  const concerns = result.compatibility_findings.filter(
    (f) => f.interaction_type !== 'no_established_concern',
  )
  const noConcern = result.compatibility_findings.filter(
    (f) => f.interaction_type === 'no_established_concern',
  )

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            Analysis
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink">{result.candidate_name}</h1>
          <p className="text-sm text-ink-soft">{CATEGORY_LABELS[result.candidate_category]}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={startEditing}>
            <Pencil className="h-4 w-4" /> Correct
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RefreshCw className="h-4 w-4" /> New
          </Button>
        </div>
      </div>

      {/* Recommendation */}
      <div
        className={cn(
          'mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3',
          RECOMMENDATION_STYLES[result.recommendation],
        )}
      >
        <span className="text-sm font-medium">
          {RECOMMENDATION_LABELS[result.recommendation]}
        </span>
      </div>

      {/* Overall assessment */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-sage-deep">
          <Lightbulb className="h-4 w-4" /> Overall assessment
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink">{result.overall_assessment}</p>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Suggested placement */}
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <CalendarClock className="h-4 w-4 text-sage-deep" /> Suggested routine placement
          </div>
          <p className="mt-2 font-display text-lg text-ink">
            {PLACEMENT_LABELS[result.suggested_routine_placement.time_of_day]}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {result.suggested_routine_placement.rationale}
          </p>
        </Card>

        {/* What it adds */}
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <Sparkles className="h-4 w-4 text-lavender-deep" /> What this could add
          </div>
          {result.potential_benefits.length === 0 ? (
            <p className="mt-2 text-xs text-ink-soft">No clearly new functions identified.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {result.potential_benefits.map((b, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lavender" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Concerns */}
      <div className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-xl text-ink">
          <AlertTriangle className="h-5 w-5 text-amber-600" /> Potential concerns
        </h2>
        {concerns.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">No ingredient interaction concerns were identified.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {concerns.map((f) => (
              <CompatibilityFindingCard key={f.finding_id} finding={f} />
            ))}
          </div>
        )}
      </div>

      {/* No concern identified */}
      {noConcern.length > 0 && (
        <div className="mt-6">
          <h2 className="flex items-center gap-2 font-display text-xl text-ink">
            <CheckCircle2 className="h-5 w-5 text-sage-deep" /> Checked — no concern identified
          </h2>
          <div className="mt-3 space-y-3">
            {noConcern.map((f) => (
              <CompatibilityFindingCard key={f.finding_id} finding={f} />
            ))}
          </div>
        </div>
      )}

      {/* Redundancy */}
      <div className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-xl text-ink">
          <Layers className="h-5 w-5 text-sage-deep" /> Overlap with your routine
        </h2>
        {result.redundancy_findings.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">No significant overlap with existing products.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {result.redundancy_findings.map((r) => (
              <RedundancyFindingCard key={r.finding_id} finding={r} />
            ))}
          </div>
        )}
      </div>

      {/* Ingredients in this product */}
      <Card className="mt-6 p-5">
        <h2 className="font-display text-lg text-ink">Ingredients in this product</h2>
        {result.known_ingredients.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {result.known_ingredients.map((ing) => (
              <IngredientLink key={ing.name} name={ing.name} />
            ))}
          </div>
        )}
        {result.unknown_ingredients.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-ink-soft">Not recognized</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {result.unknown_ingredients.map((n) => (
                <span key={n} className="rounded-full border border-dashed border-line-strong px-3 py-1 text-xs text-ink-faint">
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* What we couldn't assess */}
      {(result.uncertainties.length > 0 || result.missing_information.length > 0) && (
        <Card className="mt-4 p-5">
          <h2 className="font-display text-lg text-ink">What we couldn't assess</h2>
          <ul className="mt-2 space-y-1.5">
            {[...result.uncertainties, ...result.missing_information].map((u, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                {u}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Sources */}
      {result.evidence.length > 0 && (
        <Card className="mt-4 p-5">
          <h2 className="font-display text-lg text-ink">Sources</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {result.evidence.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-sage-deep hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> {s.name}
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {!isSaved && (
          <Button onClick={save}>
            <Save className="h-4 w-4" /> Save to inventory
          </Button>
        )}
        <Link to="/products">
          <Button variant="secondary">Back to My Products</Button>
        </Link>
        <Button variant="ghost" onClick={reset}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
