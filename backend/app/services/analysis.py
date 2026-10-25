"""Deterministic compatibility & redundancy engine (Phase 5).

Compares a candidate product against the user's existing inventory and routine
using the curated ingredient and interaction records.

Rules enforced here (per the product's skincare standards):
- A compatibility finding is produced ONLY when a curated interaction record
  exists for the pair. The engine never infers a conflict from two "active"
  ingredients or from shared ingredients.
- Shared ingredients alone never create a compatibility finding.
- Absence of a record is surfaced as uncertainty, never treated as proof of safety.
- Findings carry each ingredient's function and the interaction's evidence, and
  are evaluated against the user's actual morning/evening schedule.
"""

from app.schemas import (
    AnalysisResult,
    AnalyzeRequest,
    CompatibilityFinding,
    Ingredient,
    IngredientFunctionSummary,
    Recommendation,
    RedundancyFinding,
    SourceReference,
    SuggestedPlacement,
)
from app.services.ingredients import all_interactions, get_ingredient, resolve_name

# Near-universal moisturizing base ingredients — their shared presence is not a
# meaningful "active" overlap for redundancy purposes.
_NEUTRAL_INGREDIENTS = {"glycerin", "squalane", "tocopherol", "panthenol"}

_RETINOIDS = {"tretinoin", "retinol"}
_EVENING_ACTIVES = {"benzoyl-peroxide", "glycolic-acid", "salicylic-acid"}
_MORNING_ACTIVES = {"ascorbic-acid", "zinc-oxide"}

_RECOMMENDATION_LABELS: dict[Recommendation, str] = {
    "potentially_useful_addition": "Potentially useful addition",
    "possible_functional_overlap": "Possible functional overlap",
    "potential_irritation_concern": "Potential irritation concern",
    "consider_application_schedule": "Consider a different application schedule",
    "more_information_needed": "More information needed",
}


def _interaction_index():
    return {frozenset((it.ingredient_a, it.ingredient_b)): it for it in all_interactions()}


def _resolve_all(names: list[str]) -> tuple[dict[str, Ingredient], list[str]]:
    known: dict[str, Ingredient] = {}
    unknown: list[str] = []
    for name in names:
        cid = resolve_name(name)
        ing = get_ingredient(cid) if cid else None
        if cid and ing is not None:
            known.setdefault(cid, ing)
        else:
            unknown.append(name)
    return known, unknown


def _suggest_placement(category: str, known_ids: set[str]) -> SuggestedPlacement:
    if _RETINOIDS & known_ids:
        return SuggestedPlacement(
            time_of_day="evening",
            rationale="Contains a retinoid, which is typically used at night. General guidance, not product-specific instructions.",
        )
    if _EVENING_ACTIVES & known_ids:
        return SuggestedPlacement(
            time_of_day="evening",
            rationale="Contains an exfoliating or acne active that is commonly used in the evening.",
        )
    if _MORNING_ACTIVES & known_ids:
        return SuggestedPlacement(
            time_of_day="morning",
            rationale="Contains an antioxidant or UV filter commonly used in the morning.",
        )
    if category == "sunscreen":
        return SuggestedPlacement(
            time_of_day="morning", rationale="Sunscreen is typically the final morning step."
        )
    if category == "cleanser":
        return SuggestedPlacement(
            time_of_day="both",
            rationale="Cleansers are commonly used in both morning and evening routines.",
        )
    if category == "moisturizer":
        return SuggestedPlacement(
            time_of_day="both",
            rationale="Moisturizers are commonly used in both morning and evening routines.",
        )
    if category == "exfoliant":
        return SuggestedPlacement(
            time_of_day="evening", rationale="Exfoliants are commonly used in the evening."
        )
    return SuggestedPlacement(
        time_of_day="unspecified",
        rationale="Not enough information to suggest a time of day; check the product's own instructions.",
    )


def _routine_times(request: AnalyzeRequest) -> dict[str, set[str]]:
    times: dict[str, set[str]] = {}
    for step in request.morning:
        times.setdefault(step.product_id, set()).add("morning")
    for step in request.evening:
        times.setdefault(step.product_id, set()).add("evening")
    return times


def _routine_context(candidate_tod: str, existing_times: set[str]) -> str:
    if not existing_times:
        return "This existing product is not currently in your routine."
    joined = " and ".join(sorted(existing_times))
    if candidate_tod in ("morning", "evening") and candidate_tod not in existing_times:
        return (
            f"Your existing product is in your {joined} routine, while this candidate is "
            f"suggested for {candidate_tod}. Using them at different times may reduce the concern."
        )
    if candidate_tod in existing_times:
        return f"Both may be applied around the same time ({candidate_tod}), so the concern is more relevant."
    return f"Your existing product is in your {joined} routine."


def _compatibility(
    request: AnalyzeRequest,
    cand_known: dict[str, Ingredient],
    existing: list,
    times: dict[str, set[str]],
    placement: SuggestedPlacement,
) -> list[CompatibilityFinding]:
    index = _interaction_index()
    findings: list[CompatibilityFinding] = []
    for cand_id, cand_ing in cand_known.items():
        for product, ex_known, _ in existing:
            for ex_id, ex_ing in ex_known.items():
                if ex_id == cand_id:
                    continue
                interaction = index.get(frozenset((cand_id, ex_id)))
                if interaction is None:
                    continue  # no curated record → no finding (never invent)

                cand_funcs = ", ".join(cand_ing.primary_functions) or "no functions listed"
                ex_funcs = ", ".join(ex_ing.primary_functions) or "no functions listed"
                findings.append(
                    CompatibilityFinding(
                        finding_id=f"compat-{cand_id}-{ex_id}-{product.id}",
                        candidate_ingredient=cand_ing.canonical_name,
                        existing_ingredient=ex_ing.canonical_name,
                        existing_product_id=product.id,
                        existing_product_name=product.name,
                        interaction_type=interaction.interaction_type,
                        rationale=(
                            f"{cand_ing.canonical_name} is a {cand_ing.ingredient_category} "
                            f"({cand_funcs}); {ex_ing.canonical_name} is a {ex_ing.ingredient_category} "
                            f"({ex_funcs}). {interaction.evidence_summary}"
                        ),
                        potential_effect=interaction.potential_effect,
                        routine_context=_routine_context(placement.time_of_day, times.get(product.id, set())),
                        recommended_precautions=interaction.recommended_precautions,
                        possible_scheduling_options=interaction.possible_scheduling_options,
                        evidence_quality=interaction.evidence_quality,
                        confidence=interaction.confidence,
                        source_references=interaction.source_references,
                    )
                )
    return findings


def _redundancy(
    request: AnalyzeRequest, cand_known: dict[str, Ingredient], existing: list
) -> list[RedundancyFinding]:
    findings: list[RedundancyFinding] = []
    cand_ids = set(cand_known.keys())
    for product, ex_known, _ in existing:
        if product.category != request.candidate.category:
            continue
        shared_ids = (cand_ids & set(ex_known.keys())) - _NEUTRAL_INGREDIENTS
        if not shared_ids:
            continue
        shared_names = [cand_known[i].canonical_name for i in sorted(shared_ids)]
        funcs: set[str] = set()
        for i in shared_ids:
            funcs.update(cand_known[i].primary_functions)
        findings.append(
            RedundancyFinding(
                finding_id=f"redund-{product.id}",
                existing_product_id=product.id,
                existing_product_name=product.name,
                shared_ingredients=shared_names,
                overlapping_functions=sorted(funcs),
                rationale=(
                    f"'{request.candidate.name}' and '{product.name}' are both "
                    f"{product.category}s and share {', '.join(shared_names)}. A shared "
                    "ingredient does not make two products interchangeable — concentration, "
                    "formulation, and your own response matter. Consider whether the new "
                    "product adds something the existing one does not."
                ),
            )
        )
    return findings


def _potential_benefits(cand_known: dict[str, Ingredient], existing: list) -> list[str]:
    existing_funcs: set[str] = set()
    for _, ex_known, _ in existing:
        for ing in ex_known.values():
            existing_funcs.update(f.lower() for f in ing.primary_functions)
    benefits: list[str] = []
    seen: set[str] = set()
    for ing in cand_known.values():
        for fn in ing.primary_functions:
            key = fn.lower()
            if key not in existing_funcs and key not in seen:
                benefits.append(
                    f"Adds {fn} (via {ing.canonical_name}), which is not currently in your routine."
                )
                seen.add(key)
    return benefits[:4]


def _recommendation(
    candidate: AnalyzeRequest,
    cand_known: dict[str, Ingredient],
    compatibility: list[CompatibilityFinding],
    redundancy: list[RedundancyFinding],
) -> Recommendation:
    if not candidate.candidate.ingredients or not cand_known:
        return "more_information_needed"
    types = {f.interaction_type for f in compatibility}
    if "established_incompatibility" in types or "scheduling_consideration" in types:
        return "consider_application_schedule"
    if "potential_irritation" in types or "context_dependent" in types:
        return "potential_irritation_concern"
    if redundancy:
        return "possible_functional_overlap"
    return "potentially_useful_addition"


def _overall_assessment(
    request: AnalyzeRequest,
    compatibility: list[CompatibilityFinding],
    redundancy: list[RedundancyFinding],
    recommendation: Recommendation,
) -> str:
    n = len(request.existing_products)
    parts: list[str] = []
    parts.append(
        f"Compared '{request.candidate.name}' against {n} saved product{'s' if n != 1 else ''}."
    )
    concerns = [f for f in compatibility if f.interaction_type != "no_established_concern"]
    if concerns:
        parts.append(
            f"Found {len(concerns)} ingredient interaction concern{'s' if len(concerns) != 1 else ''}."
        )
    if redundancy:
        parts.append(
            f"Found {len(redundancy)} possible overlap{'s' if len(redundancy) != 1 else ''}."
        )
    if not concerns and not redundancy:
        if compatibility:
            parts.append("Checked ingredient interactions; no established concerns were identified.")
        else:
            parts.append("No curated ingredient interactions or overlaps were identified.")
    parts.append(f"Overall: {_RECOMMENDATION_LABELS[recommendation]}.")
    return " ".join(parts)


def analyze(request: AnalyzeRequest) -> AnalysisResult:
    cand_known, cand_unknown = _resolve_all(request.candidate.ingredients)
    placement = _suggest_placement(request.candidate.category, set(cand_known.keys()))
    times = _routine_times(request)

    existing = [(p, *_resolve_all(p.ingredients)) for p in request.existing_products]

    compatibility = _compatibility(request, cand_known, existing, times, placement)
    redundancy = _redundancy(request, cand_known, existing)
    recommendation = _recommendation(request, cand_known, compatibility, redundancy)

    known_summaries = [
        IngredientFunctionSummary(
            name=ing.canonical_name,
            ingredient_id=cid,
            category=ing.ingredient_category,
            primary_functions=ing.primary_functions,
        )
        for cid, ing in cand_known.items()
    ]

    uncertainties: list[str] = []
    if cand_unknown:
        uncertainties.append(
            "These candidate ingredients could not be matched to the reference database: "
            + ", ".join(cand_unknown)
            + "."
        )

    missing: list[str] = []
    if not request.candidate.ingredients:
        missing.append("An ingredient list is needed to assess compatibility.")
    elif not cand_known:
        missing.append("None of the candidate's ingredients were recognized.")
    missing.append("Ingredient concentrations are not known; presence on a label does not imply concentration.")
    missing.append("Product-specific application instructions are unavailable; routine placement is general guidance.")

    evidence: list[SourceReference] = []
    seen_sources: set[tuple[str, str]] = set()
    for f in compatibility:
        for s in f.source_references:
            key = (s.name, s.url)
            if key not in seen_sources:
                seen_sources.add(key)
                evidence.append(s)

    return AnalysisResult(
        candidate_name=request.candidate.name,
        candidate_category=request.candidate.category,
        known_ingredients=known_summaries,
        unknown_ingredients=cand_unknown,
        compatibility_findings=compatibility,
        redundancy_findings=redundancy,
        potential_benefits=_potential_benefits(cand_known, existing),
        suggested_routine_placement=placement,
        uncertainties=uncertainties,
        missing_information=missing,
        evidence=evidence,
        recommendation=recommendation,
        overall_assessment=_overall_assessment(request, compatibility, redundancy, recommendation),
    )
