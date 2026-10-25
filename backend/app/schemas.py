"""Pydantic schemas for the scan contract.

`ScanResult` is what the backend returns after validating and normalizing the
model's structured output. Model output is treated as untrusted data: it is
parsed, cleaned, and validated here before it ever reaches the frontend.
"""

from typing import Literal

from pydantic import BaseModel

ProductCategory = Literal[
    "cleanser", "moisturizer", "sunscreen", "serum", "exfoliant", "treatment", "other"
]


class ScanResult(BaseModel):
    brand: str = ""
    product_name: str = ""
    product_category: ProductCategory = "other"
    visible_ingredients: list[str] = []
    packaging_text: str = ""
    uncertainties: list[str] = []
    needs_manual_review: bool = False


# --- Ingredient knowledge base (Phase 4) ---

SourceKind = Literal["regulatory", "clinical_guidance", "educational"]


class SourceReference(BaseModel):
    name: str
    url: str
    kind: SourceKind = "educational"


IngredientVerification = Literal["verified", "provisional", "incomplete"]


class Ingredient(BaseModel):
    ingredient_id: str
    canonical_name: str
    aliases: list[str] = []
    ingredient_category: str = ""
    primary_functions: list[str] = []
    short_description: str = ""
    mechanism_of_action: str = ""
    evidence_supported_benefits: list[str] = []
    common_side_effects: list[str] = []
    usage_considerations: list[str] = []
    relevant_populations_or_precautions: list[str] = []
    source_references: list[SourceReference] = []
    evidence_quality: str = ""
    last_reviewed: str = ""
    verification_status: IngredientVerification = "provisional"


class IngredientSummary(BaseModel):
    ingredient_id: str
    canonical_name: str
    aliases: list[str] = []
    ingredient_category: str = ""
    primary_functions: list[str] = []
    short_description: str = ""


InteractionType = Literal[
    "established_incompatibility",
    "potential_irritation",
    "context_dependent",
    "scheduling_consideration",
    "insufficient_evidence",
    "no_established_concern",
]


class Interaction(BaseModel):
    interaction_id: str
    ingredient_a: str
    ingredient_b: str
    interaction_type: InteractionType
    evidence_summary: str = ""
    potential_effect: str = ""
    conditions_or_context: str = ""
    recommended_precautions: list[str] = []
    possible_scheduling_options: list[str] = []
    evidence_quality: str = ""
    source_references: list[SourceReference] = []
    confidence: Literal["high", "medium", "low"] = "medium"
    verification_status: IngredientVerification = "provisional"


class InteractionWithPeer(Interaction):
    peer_name: str = ""  # canonical name of the OTHER ingredient


class IngredientDetailResponse(BaseModel):
    ingredient: Ingredient
    interactions: list[InteractionWithPeer] = []


# --- Analysis engine (Phase 5) ---

TimeOfDay = Literal["morning", "evening"]


class ProductPayload(BaseModel):
    id: str
    name: str
    brand: str = ""
    category: ProductCategory = "other"
    ingredients: list[str] = []


class RoutineStepPayload(BaseModel):
    product_id: str
    time_of_day: TimeOfDay
    order: int = 0
    days: list[int] = []


class AnalyzeRequest(BaseModel):
    candidate: ProductPayload
    existing_products: list[ProductPayload] = []
    morning: list[RoutineStepPayload] = []
    evening: list[RoutineStepPayload] = []


class IngredientFunctionSummary(BaseModel):
    name: str
    ingredient_id: str | None = None
    category: str = ""
    primary_functions: list[str] = []


class CompatibilityFinding(BaseModel):
    finding_id: str
    candidate_ingredient: str
    existing_ingredient: str
    existing_product_id: str
    existing_product_name: str
    interaction_type: InteractionType
    rationale: str
    potential_effect: str
    routine_context: str
    recommended_precautions: list[str] = []
    possible_scheduling_options: list[str] = []
    evidence_quality: str = ""
    confidence: str = ""
    source_references: list[SourceReference] = []


class RedundancyFinding(BaseModel):
    finding_id: str
    existing_product_id: str
    existing_product_name: str
    shared_ingredients: list[str] = []
    overlapping_functions: list[str] = []
    rationale: str = ""


class SuggestedPlacement(BaseModel):
    time_of_day: Literal["morning", "evening", "both", "unspecified"]
    rationale: str = ""


Recommendation = Literal[
    "potentially_useful_addition",
    "possible_functional_overlap",
    "potential_irritation_concern",
    "consider_application_schedule",
    "more_information_needed",
]


class AnalysisResult(BaseModel):
    candidate_name: str
    candidate_category: ProductCategory
    known_ingredients: list[IngredientFunctionSummary] = []
    unknown_ingredients: list[str] = []
    compatibility_findings: list[CompatibilityFinding] = []
    redundancy_findings: list[RedundancyFinding] = []
    potential_benefits: list[str] = []
    suggested_routine_placement: SuggestedPlacement
    uncertainties: list[str] = []
    missing_information: list[str] = []
    evidence: list[SourceReference] = []
    recommendation: Recommendation
    overall_assessment: str
