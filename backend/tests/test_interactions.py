"""Interaction-classification evaluation — the core correctness property.

The system must distinguish established incompatibility from irritation,
scheduling, and "no concern", and must never invent a conflict.
"""

from app.schemas import AnalyzeRequest, ProductPayload, RoutineStepPayload
from app.services.analysis import analyze


def candidate(name, ingredients, category="serum"):
    return ProductPayload(id="cand", name=name, brand="X", category=category, ingredients=ingredients)


def product(pid, name, ingredients, category="treatment"):
    return ProductPayload(id=pid, name=name, brand="Rx", category=category, ingredients=ingredients)


def finding_types(req):
    return {f.interaction_type for f in analyze(req).compatibility_findings}


def test_tretinoin_vitamin_c_is_irritation_not_incompatibility():
    """The flagship case: never classify tretinoin + vitamin C as incompatible."""
    req = AnalyzeRequest(
        candidate=candidate("Vitamin C Serum", ["Ascorbic Acid"]),
        existing_products=[product("p", "Tretinoin 0.05%", ["Tretinoin"])],
        evening=[RoutineStepPayload(product_id="p", time_of_day="evening", order=1, days=[])],
    )
    types = finding_types(req)
    assert "potential_irritation" in types
    assert "established_incompatibility" not in types


def test_tretinoin_benzoyl_peroxide_is_established_incompatibility():
    req = AnalyzeRequest(
        candidate=candidate("BPO 5%", ["Benzoyl Peroxide"], "treatment"),
        existing_products=[product("p", "Tretinoin", ["Tretinoin"])],
        evening=[RoutineStepPayload(product_id="p", time_of_day="evening", order=1, days=[])],
    )
    assert "established_incompatibility" in finding_types(req)


def test_niacinamide_vitamin_c_does_not_warn():
    """A popular 'incompatibility' that must NOT produce a warning."""
    req = AnalyzeRequest(
        candidate=candidate("Niacinamide Serum", ["Niacinamide"]),
        existing_products=[product("p", "Vitamin C Serum", ["Ascorbic Acid"], "serum")],
    )
    assert finding_types(req) == {"no_established_concern"}


def test_tretinoin_hyaluronic_acid_no_concern():
    req = AnalyzeRequest(
        candidate=candidate("HA Serum", ["Hyaluronic Acid"]),
        existing_products=[product("p", "Tretinoin", ["Tretinoin"])],
    )
    assert finding_types(req) == {"no_established_concern"}


def test_shared_ingredient_alone_is_not_a_conflict():
    """Two products sharing one ingredient must not produce any finding."""
    req = AnalyzeRequest(
        candidate=candidate("Moisturizer A", ["Glycerin"], "moisturizer"),
        existing_products=[product("p", "Moisturizer B", ["Glycerin"], "moisturizer")],
    )
    assert analyze(req).compatibility_findings == []


def test_unknown_pair_is_not_invented():
    req = AnalyzeRequest(
        candidate=candidate("Mystery", ["Unobtainium"]),
        existing_products=[product("p", "Tretinoin", ["Tretinoin"])],
    )
    assert analyze(req).compatibility_findings == []


def test_insufficient_evidence_type_present():
    req = AnalyzeRequest(
        candidate=candidate("AHA Toner", ["Glycolic Acid"]),
        existing_products=[product("p", "Vitamin C", ["Ascorbic Acid"], "serum")],
    )
    assert "insufficient_evidence" in finding_types(req)
