import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, FlaskConical, Loader2 } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { getIngredient, ApiError } from '../lib/api'
import { unslugify } from '../lib/slug'
import { INTERACTION_TYPE_LABELS, INTERACTION_TYPE_STYLES } from '../lib/interactionLabels'
import { cn } from '../lib/cn'
import type { IngredientDetail, InteractionWithPeer, SourceReference } from '../types'

const VERIFICATION_META = {
  verified: { label: 'Verified', className: 'bg-sage-soft text-sage-deep' },
  provisional: { label: 'Provisional', className: 'bg-lavender-soft text-lavender-deep' },
  incomplete: { label: 'Incomplete', className: 'bg-cream text-ink-soft' },
} as const

const SOURCE_KIND_LABELS: Record<SourceReference['kind'], string> = {
  regulatory: 'Regulatory',
  clinical_guidance: 'Clinical guidance',
  educational: 'Educational',
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm italic text-ink-faint">Not provided.</p>
  }
  return (
    <ul className="space-y-1.5">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sage" />
          {x}
        </li>
      ))}
    </ul>
  )
}

function TextBlock({ text }: { text: string }) {
  if (!text) return <p className="text-sm italic text-ink-faint">Not provided.</p>
  return <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <div className="mt-2">{children}</div>
    </Card>
  )
}

function Sources({ sources }: { sources: SourceReference[] }) {
  if (sources.length === 0) {
    return <p className="text-sm italic text-ink-faint">No source references recorded.</p>
  }
  return (
    <ul className="space-y-2">
      {sources.map((s, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint" />
          <span>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-sage-deep hover:underline"
            >
              {s.name}
            </a>
            <span className="ml-2 text-xs text-ink-faint">{SOURCE_KIND_LABELS[s.kind]}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function InteractionCard({
  interaction,
  peerId,
}: {
  interaction: InteractionWithPeer
  peerId: string
}) {
  const style = INTERACTION_TYPE_STYLES[interaction.interaction_type]
  return (
    <div className="rounded-xl border border-line bg-cream/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
            style,
          )}
        >
          {INTERACTION_TYPE_LABELS[interaction.interaction_type]}
        </span>
        <Link
          to={`/ingredients/${peerId}`}
          className="text-sm font-medium text-sage-deep hover:underline"
        >
          with {interaction.peer_name}
        </Link>
        <span className="ml-auto text-[11px] text-ink-faint">
          confidence: {interaction.confidence}
        </span>
      </div>

      <TextBlock text={interaction.evidence_summary} />

      {interaction.recommended_precautions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-ink">What to consider</p>
          <div className="mt-1">
            <BulletList items={interaction.recommended_precautions} />
          </div>
        </div>
      )}

      {interaction.possible_scheduling_options.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-ink">Scheduling options</p>
          <div className="mt-1">
            <BulletList items={interaction.possible_scheduling_options} />
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-ink-faint">
        Evidence quality: {interaction.evidence_quality}
      </p>
    </div>
  )
}

export function IngredientDetail() {
  const { id } = useParams()
  const [detail, setDetail] = useState<IngredientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)
    setError(null)
    setNotFound(false)
    setDetail(null)
    getIngredient(id)
      .then((d) => {
        if (active) setDetail(d)
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : 'Failed to load ingredient.')
          setNotFound(e instanceof ApiError && e.status === 404)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-sage-deep" />
        <p className="text-sm text-ink-soft">Loading ingredient…</p>
      </div>
    )
  }

  if (error && notFound) {
    return (
      <div>
        <Link to="/ingredients" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> All ingredients
        </Link>
        <div className="mt-4">
          <EmptyState
            icon={<FlaskConical className="h-5 w-5" />}
            title={id ? unslugify(id) : 'Unknown ingredient'}
            description="No educational record exists for this ingredient yet. Unknown ingredients are shown explicitly rather than guessed at."
            action={
              <Link to="/ingredients">
                <Button variant="secondary" size="sm">
                  Back to explorer
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <EmptyState
        icon={<FlaskConical className="h-5 w-5" />}
        title="Couldn't load this ingredient"
        description={error ?? 'Something went wrong.'}
        action={
          <Link to="/ingredients">
            <Button variant="secondary" size="sm">
              Back to explorer
            </Button>
          </Link>
        }
      />
    )
  }

  const ing = detail.ingredient
  const verification = VERIFICATION_META[ing.verification_status]

  return (
    <div>
      <Link to="/ingredients" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All ingredients
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">{ing.canonical_name}</h1>
          {ing.ingredient_category && (
            <div className="mt-2">
              <Chip disabled tabIndex={-1}>
                {ing.ingredient_category}
              </Chip>
            </div>
          )}
        </div>
        <span
          className={cn(
            'inline-flex h-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
            verification.className,
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {verification.label}
        </span>
      </div>

      {ing.short_description && (
        <Card className="mt-4 p-5">
          <p className="text-sm leading-relaxed text-ink">{ing.short_description}</p>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        <Section title="What is it?">
          <TextBlock
            text={
              ing.primary_functions.length > 0
                ? `Primary functions: ${ing.primary_functions.join(', ')}.`
                : ''
            }
          />
        </Section>

        <Section title="What does it do?">
          <BulletList items={ing.evidence_supported_benefits} />
        </Section>

        <Section title="How does it work?">
          <TextBlock text={ing.mechanism_of_action} />
        </Section>

        <Section title="What should I know before using it?">
          {ing.common_side_effects.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-ink">Possible side effects</p>
              <div className="mt-1">
                <BulletList items={ing.common_side_effects} />
              </div>
            </div>
          )}
          {ing.usage_considerations.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-ink">Usage</p>
              <div className="mt-1">
                <BulletList items={ing.usage_considerations} />
              </div>
            </div>
          )}
          {ing.relevant_populations_or_precautions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-ink">Precautions</p>
              <div className="mt-1">
                <BulletList items={ing.relevant_populations_or_precautions} />
              </div>
            </div>
          )}
          {ing.common_side_effects.length === 0 &&
            ing.usage_considerations.length === 0 &&
            ing.relevant_populations_or_precautions.length === 0 && (
              <p className="text-sm italic text-ink-faint">No specific concerns recorded.</p>
            )}
        </Section>

        <Section title="What ingredients should I understand alongside it?">
          {detail.interactions.length === 0 ? (
            <p className="text-sm italic text-ink-faint">
              No documented interactions in the database yet.
            </p>
          ) : (
            <div className="space-y-3">
              {detail.interactions.map((it) => (
                <InteractionCard
                  key={it.interaction_id}
                  interaction={it}
                  peerId={it.ingredient_a === id ? it.ingredient_b : it.ingredient_a}
                />
              ))}
            </div>
          )}
        </Section>

        <Section title="Where does this information come from?">
          <Sources sources={ing.source_references} />
          <div className="mt-4 space-y-1 border-t border-line pt-3 text-[11px] text-ink-faint">
            <p>Evidence quality: {ing.evidence_quality || 'Not stated'}</p>
            {ing.last_reviewed && <p>Last reviewed: {ing.last_reviewed}</p>}
          </div>
        </Section>
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-ink-faint">
        SkinSync provides educational summaries, not medical advice. Ingredient
        functions differ from proven clinical benefits, and a product containing
        an ingredient is not equivalent to the ingredient alone. For prescription
        ingredients, follow your prescribing clinician's instructions.
      </p>
    </div>
  )
}
