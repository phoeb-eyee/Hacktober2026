// Shared domain types. These intentionally stay small in Phase 1 and grow as
// the inventory (Phase 2), ingredient knowledge base (Phase 4), and analysis
// engine (Phase 5) are introduced.

export type ProductCategory =
  | 'cleanser'
  | 'moisturizer'
  | 'sunscreen'
  | 'serum'
  | 'exfoliant'
  | 'treatment'
  | 'other';

export type VerificationStatus =
  | 'verified' // backed by a trusted, source-attributed record
  | 'user_provided' // entered by the user
  | 'ai_extracted' // extracted by the model, not yet confirmed
  | 'unverified';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  ingredients: string[]; // display names; linked to records in Phase 4
  verificationStatus: VerificationStatus;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
}

export type TimeOfDay = 'morning' | 'evening';

export interface RoutineStep {
  id: string;
  productId: string;
  timeOfDay: TimeOfDay;
  order: number;
  days: number[]; // 0-6 (Sun-Sat); empty array = every day
}

export interface Routine {
  morning: RoutineStep[];
  evening: RoutineStep[];
}

// --- Ingredient knowledge base (Phase 4). Mirrors backend schemas. ---

export type SourceKind = 'regulatory' | 'clinical_guidance' | 'educational'

export interface SourceReference {
  name: string
  url: string
  kind: SourceKind
}

export type IngredientVerification = 'verified' | 'provisional' | 'incomplete'

export interface Ingredient {
  ingredient_id: string
  canonical_name: string
  aliases: string[]
  ingredient_category: string
  primary_functions: string[]
  short_description: string
  mechanism_of_action: string
  evidence_supported_benefits: string[]
  common_side_effects: string[]
  usage_considerations: string[]
  relevant_populations_or_precautions: string[]
  source_references: SourceReference[]
  evidence_quality: string
  last_reviewed: string
  verification_status: IngredientVerification
}

export interface IngredientSummary {
  ingredient_id: string
  canonical_name: string
  aliases: string[]
  ingredient_category: string
  primary_functions: string[]
  short_description: string
}

export type InteractionType =
  | 'established_incompatibility'
  | 'potential_irritation'
  | 'context_dependent'
  | 'scheduling_consideration'
  | 'insufficient_evidence'
  | 'no_established_concern'

export interface Interaction {
  interaction_id: string
  ingredient_a: string
  ingredient_b: string
  interaction_type: InteractionType
  evidence_summary: string
  potential_effect: string
  conditions_or_context: string
  recommended_precautions: string[]
  possible_scheduling_options: string[]
  evidence_quality: string
  source_references: SourceReference[]
  confidence: 'high' | 'medium' | 'low'
  verification_status: IngredientVerification
}

export interface InteractionWithPeer extends Interaction {
  peer_name: string
}

export interface IngredientDetail {
  ingredient: Ingredient
  interactions: InteractionWithPeer[]
}

// --- Analysis engine (Phase 5/6). Mirrors backend schemas (snake_case). ---

export interface AnalysisCandidate {
  id: string
  name: string
  brand: string
  category: ProductCategory
  ingredients: string[]
}

export interface AnalyzeRoutineStep {
  product_id: string
  time_of_day: TimeOfDay
  order: number
  days: number[]
}

export interface AnalyzeRequest {
  candidate: AnalysisCandidate
  existing_products: AnalysisCandidate[]
  morning: AnalyzeRoutineStep[]
  evening: AnalyzeRoutineStep[]
}

export type Recommendation =
  | 'potentially_useful_addition'
  | 'possible_functional_overlap'
  | 'potential_irritation_concern'
  | 'consider_application_schedule'
  | 'more_information_needed'

export interface IngredientFunctionSummary {
  name: string
  ingredient_id: string | null
  category: string
  primary_functions: string[]
}

export interface CompatibilityFinding {
  finding_id: string
  candidate_ingredient: string
  existing_ingredient: string
  existing_product_id: string
  existing_product_name: string
  interaction_type: InteractionType
  rationale: string
  potential_effect: string
  routine_context: string
  recommended_precautions: string[]
  possible_scheduling_options: string[]
  evidence_quality: string
  confidence: string
  source_references: SourceReference[]
}

export interface RedundancyFinding {
  finding_id: string
  existing_product_id: string
  existing_product_name: string
  shared_ingredients: string[]
  overlapping_functions: string[]
  rationale: string
}

export interface SuggestedPlacement {
  time_of_day: 'morning' | 'evening' | 'both' | 'unspecified'
  rationale: string
}

export interface AnalysisResult {
  candidate_name: string
  candidate_category: ProductCategory
  known_ingredients: IngredientFunctionSummary[]
  unknown_ingredients: string[]
  compatibility_findings: CompatibilityFinding[]
  redundancy_findings: RedundancyFinding[]
  potential_benefits: string[]
  suggested_routine_placement: SuggestedPlacement
  uncertainties: string[]
  missing_information: string[]
  evidence: SourceReference[]
  recommendation: Recommendation
  overall_assessment: string
}

// The validated result of a Gemma 4 image scan (Phase 3). Mirrors the backend
// `ScanResult` schema. `needs_manual_review` is true when the image is unclear
// or fields are missing, so the UI can prompt the user before saving.
export interface ScanResult {
  brand: string
  product_name: string
  product_category: ProductCategory
  visible_ingredients: string[]
  packaging_text: string
  uncertainties: string[]
  needs_manual_review: boolean
}
