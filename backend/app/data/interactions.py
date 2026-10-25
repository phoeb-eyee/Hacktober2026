"""Curated ingredient-interaction records.

Each record describes a relationship between two ingredients with its evidence
type, rationale, and context. The `interaction_type` taxonomy deliberately
separates a proven incompatibility from irritation risk, scheduling, and
uncertainty — the system must never label two actives "incompatible" merely
because both are active or because the pairing is discussed online.
"""

INTERACTIONS: list[dict] = [
    {
        "interaction_id": "tretinoin-benzoyl-peroxide",
        "ingredient_a": "tretinoin",
        "ingredient_b": "benzoyl-peroxide",
        "interaction_type": "established_incompatibility",
        "evidence_summary": "Benzoyl peroxide can oxidize and degrade tretinoin when the two are applied at the same time, reducing tretinoin's stability and potentially its effectiveness. This is a well-documented formulation and stability concern — it does not mean the two can never be used by the same person, only that they should not be applied simultaneously.",
        "potential_effect": "Reduced effectiveness of tretinoin if applied at the same time.",
        "conditions_or_context": "Applies to simultaneous application on the same area.",
        "recommended_precautions": [
            "Avoid applying at the same time.",
            "Follow your clinician's instructions if both are prescribed.",
        ],
        "possible_scheduling_options": [
            "Use benzoyl peroxide in the morning and tretinoin in the evening.",
            "Or use on different days, as directed.",
        ],
        "evidence_quality": "Well-established",
        "source_references": [
            {"name": "American Academy of Dermatology Association", "url": "https://www.aad.org/", "kind": "clinical_guidance"},
            {"name": "MedlinePlus (NIH)", "url": "https://medlineplus.gov/", "kind": "educational"},
        ],
        "confidence": "high",
        "verification_status": "verified",
    },
    {
        "interaction_id": "tretinoin-ascorbic-acid",
        "ingredient_a": "tretinoin",
        "ingredient_b": "ascorbic-acid",
        "interaction_type": "potential_irritation",
        "evidence_summary": "Tretinoin and vitamin C are both potentially irritating actives. Using them in the same routine may increase dryness and irritation in some people, depending on formulation, concentration, and individual tolerance. This is a potential irritation concern — it is NOT evidence that the two are chemically incompatible or must never be used together.",
        "potential_effect": "Possible increased dryness, redness, or irritation when used together.",
        "conditions_or_context": "Depends on concentration, formulation, skin tolerance, and timing.",
        "recommended_precautions": [
            "Introduce one at a time and monitor tolerance.",
            "Follow the tretinoin prescribing instructions.",
        ],
        "possible_scheduling_options": [
            "Many people use vitamin C in the morning and tretinoin in the evening.",
            "Alternate days if both are irritating.",
        ],
        "evidence_quality": "Limited to moderate (well-known irritation profiles; no proven chemical incompatibility)",
        "source_references": [
            {"name": "American Academy of Dermatology Association", "url": "https://www.aad.org/", "kind": "clinical_guidance"},
        ],
        "confidence": "medium",
        "verification_status": "provisional",
    },
    {
        "interaction_id": "retinol-ascorbic-acid",
        "ingredient_a": "retinol",
        "ingredient_b": "ascorbic-acid",
        "interaction_type": "scheduling_consideration",
        "evidence_summary": "Retinol and vitamin C are both potentially irritating. The main practical consideration is timing: using vitamin C in the morning (where its antioxidant role may complement sunscreen) and retinol in the evening is a common, well-tolerated approach. This is a scheduling consideration, not a chemical incompatibility.",
        "potential_effect": "Possible irritation if used in the same session for some people.",
        "conditions_or_context": "Depends on tolerance and formulation.",
        "recommended_precautions": [
            "Introduce gradually.",
            "Use sunscreen daily when using retinol.",
        ],
        "possible_scheduling_options": [
            "Vitamin C in the morning, retinol in the evening.",
            "Alternate days if needed.",
        ],
        "evidence_quality": "Moderate",
        "source_references": [
            {"name": "American Academy of Dermatology Association", "url": "https://www.aad.org/", "kind": "clinical_guidance"},
        ],
        "confidence": "medium",
        "verification_status": "provisional",
    },
    {
        "interaction_id": "tretinoin-salicylic-acid",
        "ingredient_a": "tretinoin",
        "ingredient_b": "salicylic-acid",
        "interaction_type": "context_dependent",
        "evidence_summary": "Combining tretinoin with salicylic acid may increase irritation, and there is some evidence salicylic acid may affect tretinoin's stability or efficacy. Whether this matters depends on the specific products, concentrations, and how they are used.",
        "potential_effect": "Possible increased irritation; possible reduced efficacy of one or both.",
        "conditions_or_context": "Formulation- and timing-dependent.",
        "recommended_precautions": [
            "Separate application times or alternate days.",
            "Follow clinician guidance.",
        ],
        "possible_scheduling_options": [
            "Use at different times of day or on different days.",
        ],
        "evidence_quality": "Limited to moderate",
        "source_references": [
            {"name": "American Academy of Dermatology Association", "url": "https://www.aad.org/", "kind": "clinical_guidance"},
        ],
        "confidence": "medium",
        "verification_status": "provisional",
    },
    {
        "interaction_id": "tretinoin-glycolic-acid",
        "ingredient_a": "tretinoin",
        "ingredient_b": "glycolic-acid",
        "interaction_type": "potential_irritation",
        "evidence_summary": "Both tretinoin and glycolic acid can be irritating and increase skin sensitivity. Using them together raises the risk of dryness, redness, and peeling.",
        "potential_effect": "Increased irritation and skin sensitivity.",
        "conditions_or_context": "Concentration- and tolerance-dependent.",
        "recommended_precautions": [
            "Avoid stacking in the same routine unless directed.",
            "Prioritize one irritating or exfoliating active at a time.",
        ],
        "possible_scheduling_options": [
            "Separate by time of day or by day.",
        ],
        "evidence_quality": "Moderate (irritation profiles)",
        "source_references": [
            {"name": "American Academy of Dermatology Association", "url": "https://www.aad.org/", "kind": "clinical_guidance"},
        ],
        "confidence": "medium",
        "verification_status": "provisional",
    },
    {
        "interaction_id": "retinol-benzoyl-peroxide",
        "ingredient_a": "retinol",
        "ingredient_b": "benzoyl-peroxide",
        "interaction_type": "context_dependent",
        "evidence_summary": "Like tretinoin, retinol can be oxidized by benzoyl peroxide, which may reduce its effectiveness. This is better documented for tretinoin; evidence for retinol is more limited.",
        "potential_effect": "Possible reduced effectiveness of retinol if applied simultaneously.",
        "conditions_or_context": "Timing- and formulation-dependent.",
        "recommended_precautions": [
            "Separate application times if using both.",
        ],
        "possible_scheduling_options": [
            "Use benzoyl peroxide and retinol at different times of day.",
        ],
        "evidence_quality": "Limited",
        "source_references": [
            {"name": "American Academy of Dermatology Association", "url": "https://www.aad.org/", "kind": "clinical_guidance"},
        ],
        "confidence": "low",
        "verification_status": "provisional",
    },
    {
        "interaction_id": "retinol-glycolic-acid",
        "ingredient_a": "retinol",
        "ingredient_b": "glycolic-acid",
        "interaction_type": "potential_irritation",
        "evidence_summary": "Both retinol and glycolic acid are exfoliating and potentially irritating actives. Combining them can increase irritation.",
        "potential_effect": "Increased dryness and irritation.",
        "conditions_or_context": "Concentration- and tolerance-dependent.",
        "recommended_precautions": [
            "Introduce separately and gradually.",
        ],
        "possible_scheduling_options": [
            "Alternate nights or separate times.",
        ],
        "evidence_quality": "Moderate",
        "source_references": [
            {"name": "American Academy of Dermatology Association", "url": "https://www.aad.org/", "kind": "clinical_guidance"},
        ],
        "confidence": "medium",
        "verification_status": "provisional",
    },
    {
        "interaction_id": "niacinamide-ascorbic-acid",
        "ingredient_a": "niacinamide",
        "ingredient_b": "ascorbic-acid",
        "interaction_type": "no_established_concern",
        "evidence_summary": "Niacinamide and vitamin C are sometimes said to be incompatible, but reliable evidence of a meaningful incompatibility in finished products is lacking, and they are co-formulated in many products. This does not guarantee universal suitability, but no established concern was identified.",
        "potential_effect": "No established concern identified.",
        "conditions_or_context": "General use.",
        "recommended_precautions": [
            "No specific precaution; discontinue if irritation occurs (as with any product).",
        ],
        "possible_scheduling_options": [],
        "evidence_quality": "Limited (absence of reliable evidence of incompatibility)",
        "source_references": [
            {"name": "PubMed (NIH)", "url": "https://pubmed.ncbi.nlm.nih.gov/", "kind": "educational"},
        ],
        "confidence": "medium",
        "verification_status": "provisional",
    },
    {
        "interaction_id": "tretinoin-hyaluronic-acid",
        "ingredient_a": "tretinoin",
        "ingredient_b": "hyaluronic-acid",
        "interaction_type": "no_established_concern",
        "evidence_summary": "Hyaluronic acid is a humectant, not an active that conflicts with tretinoin. It is commonly used alongside retinoids to support hydration and is not a known interaction.",
        "potential_effect": "No established concern identified.",
        "conditions_or_context": "General use.",
        "recommended_precautions": [],
        "possible_scheduling_options": [],
        "evidence_quality": "Well-established (no interaction)",
        "source_references": [
            {"name": "American Academy of Dermatology Association", "url": "https://www.aad.org/", "kind": "clinical_guidance"},
        ],
        "confidence": "high",
        "verification_status": "provisional",
    },
    {
        "interaction_id": "ascorbic-acid-glycolic-acid",
        "ingredient_a": "ascorbic-acid",
        "ingredient_b": "glycolic-acid",
        "interaction_type": "insufficient_evidence",
        "evidence_summary": "Both are acidic and potentially irritating, but there is limited direct evidence on specific interactions between vitamin C and glycolic acid when co-applied. The main practical issue is likely irritation rather than a specific chemical interaction.",
        "potential_effect": "Uncertain; possible increased irritation.",
        "conditions_or_context": "Depends on pH, concentration, and formulation.",
        "recommended_precautions": [
            "Monitor tolerance.",
            "Introduce gradually.",
        ],
        "possible_scheduling_options": [],
        "evidence_quality": "Insufficient",
        "source_references": [
            {"name": "PubMed (NIH)", "url": "https://pubmed.ncbi.nlm.nih.gov/", "kind": "educational"},
        ],
        "confidence": "low",
        "verification_status": "provisional",
    },
]
