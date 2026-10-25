import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Camera,
  ImagePlus,
  Loader2,
  RefreshCw,
  Save,
  ScanLine,
  X,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field } from '../components/ui/Field'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { useData } from '../context/DataContext'
import { scanProductImage } from '../lib/api'
import { parseIngredients } from '../lib/ingredients'
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from '../lib/labels'
import type { ProductCategory, ScanResult } from '../types'

type Status = 'idle' | 'loading' | 'review' | 'error'

export function Scan() {
  const navigate = useNavigate()
  const { addProduct } = useData()
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)

  const [brand, setBrand] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ProductCategory>('other')
  const [ingredientsText, setIngredientsText] = useState('')

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
    setStatus('idle')
    setError(null)
    setResult(null)
    setBrand('')
    setName('')
    setCategory('other')
    setIngredientsText('')
  }

  const handleFile = (f: File | undefined) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('Please choose an image file.')
      setStatus('error')
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setError(null)
    setResult(null)
    setStatus('idle')
  }

  const analyze = async () => {
    if (!file) return
    setStatus('loading')
    setError(null)
    try {
      const res = await scanProductImage(file)
      setResult(res)
      setBrand(res.brand)
      setName(res.product_name)
      setCategory(res.product_category)
      setIngredientsText(res.visible_ingredients.join('\n'))
      setStatus('review')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  const save = () => {
    if (!name.trim() && !brand.trim()) {
      setError('Add at least a product name or brand before saving.')
      return
    }
    const created = addProduct({
      name: name.trim() || 'Unnamed product',
      brand: brand.trim() || 'Unknown brand',
      category,
      ingredients: parseIngredients(ingredientsText),
      verificationStatus: 'ai_extracted',
    })
    navigate(`/products/${created.id}`)
  }

  const analyzeCandidate = () => {
    navigate('/analysis', {
      state: {
        candidate: {
          id: 'candidate',
          name: name.trim() || 'Unnamed product',
          brand: brand.trim() || 'Unknown brand',
          category,
          ingredients: parseIngredients(ingredientsText),
        },
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Scan a Product"
        description="Photograph a product's packaging. Gemma 4 reads the label, then you review and correct the result before anything is saved."
      />

      {/* DROPZONE */}
      {status === 'idle' && !file && (
        <div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line-strong bg-surface/60 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-wash text-sage-deep">
              <ScanLine className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <h2 className="mt-4 font-display text-xl text-ink">
              Photograph or upload a product
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              A clear photo of the front of the packaging works best. Include the
              ingredient list if you can.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Button onClick={() => cameraRef.current?.click()}>
                <Camera className="h-4 w-4" /> Take photo
              </Button>
              <Button variant="secondary" onClick={() => uploadRef.current?.click()}>
                <ImagePlus className="h-4 w-4" /> Upload image
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW (ready to analyze) */}
      {status === 'idle' && file && previewUrl && (
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
            <img
              src={previewUrl}
              alt="Product preview"
              className="max-h-72 w-full rounded-xl border border-line object-contain sm:w-64"
            />
            <div className="flex-1">
              <p className="text-sm text-ink-soft">
                Your image is ready. SkinSync will send it to Gemma 4 to read the
                label.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={analyze}>
                  <ScanLine className="h-4 w-4" /> Analyze with Gemma 4
                </Button>
                <Button variant="ghost" onClick={reset}>
                  <X className="h-4 w-4" /> Choose a different image
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* LOADING */}
      {status === 'loading' && (
        <Card className="flex flex-col items-center gap-4 p-12 text-center">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Product"
              className="h-32 w-32 rounded-xl border border-line object-contain"
            />
          )}
          <Loader2 className="h-6 w-6 animate-spin text-sage-deep" />
          <div>
            <h2 className="font-display text-lg text-ink">Reading your product…</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Gemma 4 is interpreting the packaging. This usually takes a few seconds.
            </p>
          </div>
        </Card>
      )}

      {/* ERROR */}
      {status === 'error' && (
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-xl text-ink">Couldn&apos;t analyze that image</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{error}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {file && (
              <Button onClick={analyze}>
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
            )}
            <Button variant="ghost" onClick={reset}>
              Choose a different image
            </Button>
          </div>
        </Card>
      )}

      {/* REVIEW */}
      {status === 'review' && result && (
        <div className="space-y-4">
          {result.needs_manual_review && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                The model couldn&apos;t read everything confidently. Please review and
                fill in the details below before saving.
              </span>
            </div>
          )}

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row">
              <img
                src={previewUrl ?? undefined}
                alt="Product"
                className="max-h-64 w-full rounded-xl border border-line object-contain md:w-56"
              />
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Brand">
                    <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
                  </Field>
                  <Field label="Product name">
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </Field>
                </div>
                <Field label="Category">
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Ingredients" hint="One per line. Correct anything the model misread.">
                  <Textarea
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    rows={4}
                  />
                </Field>
              </div>
            </div>
          </Card>

          {(result.packaging_text || result.uncertainties.length > 0) && (
            <Card className="p-5">
              <h2 className="font-display text-lg text-ink">What the model read</h2>
              {result.packaging_text && (
                <p className="mt-2 rounded-xl border border-line bg-cream/60 p-3 text-xs leading-relaxed text-ink-soft">
                  {result.packaging_text}
                </p>
              )}
              {result.uncertainties.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {result.uncertainties.map((u, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-ink-soft">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                      {u}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={save}>
              <Save className="h-4 w-4" /> Save to inventory
            </Button>
            <Button variant="secondary" onClick={analyzeCandidate}>
              <ScanLine className="h-4 w-4" /> Analyze against my routine
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RefreshCw className="h-4 w-4" /> Start over
            </Button>
          </div>
          <p className="text-xs text-ink-faint">
            Saving stores the ingredients as AI-extracted. You can change the
            source later from the product page.
          </p>
        </div>
      )}

      {/* How it works */}
      {status === 'idle' && !file && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { step: '1', title: 'Capture', body: 'Photograph the product packaging or upload an image.' },
            { step: '2', title: 'Review', body: 'Gemma 4 reads the label. You correct and confirm the details.' },
            { step: '3', title: 'Understand', body: 'SkinSync compares it to your routine and explains how it fits.' },
          ].map((s) => (
            <Card key={s.step} className="p-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-soft text-xs font-semibold text-sage-deep">
                {s.step}
              </span>
              <h3 className="mt-3 font-display text-base text-ink">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
