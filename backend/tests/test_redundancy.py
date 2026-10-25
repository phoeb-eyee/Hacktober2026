"""Redundancy detection — same category + shared active, but never category alone."""

from app.schemas import AnalyzeRequest, ProductPayload
from app.services.analysis import analyze


def candidate(name, ingredients, category="serum"):
    return ProductPayload(id="cand", name=name, brand="X", category=category, ingredients=ingredients)


def product(pid, name, ingredients, category="serum"):
    return ProductPayload(id=pid, name=name, brand="Y", category=category, ingredients=ingredients)


def test_two_vitamin_c_serums_are_redundant():
    req = AnalyzeRequest(
        candidate=candidate("New Vit C", ["Ascorbic Acid"]),
        existing_products=[product("p", "Old Vit C", ["Ascorbic Acid"])],
    )
    findings = analyze(req).redundancy_findings
    assert len(findings) == 1
    assert findings[0].existing_product_name == "Old Vit C"
    assert findings[0].shared_ingredients == ["Ascorbic Acid (Vitamin C)"]


def test_same_ingredient_different_category_is_not_redundant():
    req = AnalyzeRequest(
        candidate=candidate("Vitamin C Cream", ["Ascorbic Acid"], "moisturizer"),
        existing_products=[product("p", "Vitamin C Serum", ["Ascorbic Acid"], "serum")],
    )
    assert analyze(req).redundancy_findings == []


def test_only_base_ingredient_is_not_redundant():
    """Two moisturizers sharing only glycerin should not be flagged."""
    req = AnalyzeRequest(
        candidate=candidate("Moisturizer A", ["Glycerin"], "moisturizer"),
        existing_products=[product("p", "Moisturizer B", ["Glycerin"], "moisturizer")],
    )
    assert analyze(req).redundancy_findings == []


def test_shared_retinol_is_redundant():
    req = AnalyzeRequest(
        candidate=candidate("Retinol Serum A", ["Retinol"], "serum"),
        existing_products=[product("p", "Retinol Serum B", ["Retinol"], "serum")],
    )
    assert len(analyze(req).redundancy_findings) == 1
