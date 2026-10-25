import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus, X } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field } from '../components/ui/Field'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { EmptyState } from '../components/ui/EmptyState'
import { useData } from '../context/DataContext'
import { CATEGORY_LABELS, CATEGORY_OPTIONS, VERIFICATION_LABELS } from '../lib/labels'
import { fileToResizedDataUrl } from '../lib/image'
import { parseIngredients } from '../lib/ingredients'
import type { ProductCategory, VerificationStatus } from '../types'

export function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, addProduct, updateProduct } = useData()
  const editing = id ? products.find((p) => p.id === id) : undefined
  const isEdit = Boolean(id)

  const [name, setName] = useState(editing?.name ?? '')
  const [brand, setBrand] = useState(editing?.brand ?? '')
  const [category, setCategory] = useState<ProductCategory>(editing?.category ?? 'other')
  const [ingredientsText, setIngredientsText] = useState(
    editing?.ingredients.join('\n') ?? '',
  )
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    editing?.verificationStatus ?? 'user_provided',
  )
  const [imageUrl, setImageUrl] = useState<string | undefined>(editing?.imageUrl)
  const [notes, setNotes] = useState(editing?.notes ?? '')
  const [errors, setErrors] = useState<{ name?: string; brand?: string }>({})
  const [imageError, setImageError] = useState<string | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)

  if (isEdit && !editing) {
    return (
      <EmptyState
        title="Product not found"
        description="This product may have been deleted."
        action={
          <Link to="/products">
            <Button variant="secondary" size="sm">
              Back to My Products
            </Button>
          </Link>
        }
      />
    )
  }

  const handleImage = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.')
      return
    }
    setImageError(undefined)
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      setImageUrl(dataUrl)
    } catch {
      setImageError('Could not read that image. Try another file.')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: { name?: string; brand?: string } = {}
    if (!name.trim()) nextErrors.name = 'Product name is required.'
    if (!brand.trim()) nextErrors.brand = 'Brand is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const input = {
      name: name.trim(),
      brand: brand.trim(),
      category,
      ingredients: parseIngredients(ingredientsText),
      verificationStatus,
      imageUrl: imageUrl || undefined,
      notes: notes.trim() || undefined,
    }

    if (isEdit && editing) {
      updateProduct(editing.id, input)
      navigate(`/products/${editing.id}`)
    } else {
      const created = addProduct(input)
      navigate(`/products/${created.id}`)
    }
  }

  return (
    <div>
      <Link
        to={isEdit && editing ? `/products/${editing.id}` : '/products'}
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <PageHeader
        className="mt-4 mb-6"
        title={isEdit ? 'Edit product' : 'Add a product'}
        description="Enter what you know. The ingredient list can be added as plain text — one ingredient per line."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Product name" required error={errors.name}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gentle Hydrating Cleanser"
                autoFocus
              />
            </Field>
            <Field label="Brand" required error={errors.brand}>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Velvet Lab"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
            <Field
              label="Ingredient source"
              hint="Where did this ingredient list come from?"
            >
              <Select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
              >
                {(Object.keys(VERIFICATION_LABELS) as VerificationStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {VERIFICATION_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label="Ingredients"
            hint="One ingredient per line. These become selectable so you can explore each one."
          >
            <Textarea
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder={'Water\nGlycerin\nNiacinamide'}
              rows={5}
            />
          </Field>

          <Field label="Notes" hint="Optional — e.g. how often you use it, or a reaction to note.">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
              rows={2}
            />
          </Field>
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="text-sm font-medium text-ink">Product photo</p>
          <p className="mt-0.5 text-xs text-ink-faint">
            Optional. Stored locally as a small thumbnail — full photo scanning arrives in Phase 3.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImage(e.target.files?.[0])}
          />

          {imageUrl ? (
            <div className="mt-3 flex items-start gap-4">
              <img
                src={imageUrl}
                alt="Product preview"
                className="h-24 w-24 rounded-xl border border-line object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setImageUrl(undefined)}
              >
                <X className="h-4 w-4" /> Remove
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" /> Choose image
            </Button>
          )}
          {imageError && <p className="mt-2 text-xs text-red-600">{imageError}</p>}
        </Card>

        <div className="flex items-center gap-2">
          <Button type="submit">{isEdit ? 'Save changes' : 'Add product'}</Button>
          <Link to={isEdit && editing ? `/products/${editing.id}` : '/products'}>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
