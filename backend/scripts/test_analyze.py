"""Manual verification of the analysis engine across key scenarios."""

import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from app.schemas import AnalyzeRequest, ProductPayload, RoutineStepPayload  # noqa: E402
from app.services.analysis import analyze  # noqa: E402


def show(res):
    print(f"=== {res.candidate_name} ===")
    print(f"recommendation: {res.recommendation}")
    print(f"placement: {res.suggested_routine_placement.time_of_day} | {res.suggested_routine_placement.rationale}")
    for f in res.compatibility_findings:
        print(f"  [{f.interaction_type}] {f.candidate_ingredient} x {f.existing_ingredient} (in {f.existing_product_name})")
        print(f"      context: {f.routine_context}")
    for r in res.redundancy_findings:
        print(f"  [redundancy] {r.existing_product_name}: shared={r.shared_ingredients} funcs={r.overlapping_functions}")
    print(f"benefits: {res.potential_benefits}")
    print(f"unknowns: {res.unknown_ingredients}")
    print(f"overall: {res.overall_assessment}")
    print()


tret_existing = [ProductPayload(id="p-ret", name="Tretinoin 0.05%", brand="Rx", category="treatment", ingredients=["Tretinoin"])]
evening = [RoutineStepPayload(product_id="p-ret", time_of_day="evening", order=1, days=[])]

# 1. tretinoin (evening) + vitamin C candidate
show(analyze(AnalyzeRequest(
    candidate=ProductPayload(id="cand", name="Vitamin C Serum", brand="X", category="serum",
                             ingredients=["Ascorbic Acid", "Ferulic Acid", "Glycerin"]),
    existing_products=tret_existing,
    evening=evening,
)))

# 2. tretinoin + benzoyl peroxide (established incompatibility)
show(analyze(AnalyzeRequest(
    candidate=ProductPayload(id="cand2", name="Benzoyl Peroxide 5% Gel", brand="Y", category="treatment",
                             ingredients=["Benzoyl Peroxide"]),
    existing_products=tret_existing,
    evening=evening,
)))

# 3. redundancy: two vitamin C serums
vc_existing = [ProductPayload(id="p-vc", name="Existing Vit C Serum", brand="A", category="serum",
                              ingredients=["Ascorbic Acid"])]
show(analyze(AnalyzeRequest(
    candidate=ProductPayload(id="cand3", name="New Vit C Serum", brand="B", category="serum",
                             ingredients=["Ascorbic Acid", "Tocopherol"]),
    existing_products=vc_existing,
)))

# 4. unknown ingredients only
show(analyze(AnalyzeRequest(
    candidate=ProductPayload(id="cand4", name="Mystery Serum", brand="?", category="serum",
                             ingredients=["Unobtainium", "Madeupium"]),
    existing_products=vc_existing,
)))

# 5. niacinamide + vitamin C (myth pair) -> should be no_established_concern, NOT a warning
show(analyze(AnalyzeRequest(
    candidate=ProductPayload(id="cand5", name="Niacinamide Serum", brand="C", category="serum",
                             ingredients=["Niacinamide"]),
    existing_products=vc_existing,
)))
