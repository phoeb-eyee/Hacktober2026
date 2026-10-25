"""End-to-end analysis result shape, recommendation, and routine context."""

from app.schemas import AnalyzeRequest, ProductPayload, RoutineStepPayload
from app.services.analysis import analyze


def candidate(name, ingredients, category="serum"):
    return ProductPayload(id="cand", name=name, brand="X", category=category, ingredients=ingredients)


def test_routine_context_notes_different_times():
    req = AnalyzeRequest(
        candidate=candidate("Vitamin C Serum", ["Ascorbic Acid"]),
        existing_products=[ProductPayload(id="p", name="Tretinoin", brand="Rx", category="treatment", ingredients=["Tretinoin"])],
        evening=[RoutineStepPayload(product_id="p", time_of_day="evening", order=1, days=[])],
    )
    result = analyze(req)
    finding = result.compatibility_findings[0]
    assert finding.interaction_type == "potential_irritation"
    assert "evening" in finding.routine_context
    assert "morning" in finding.routine_context  # candidate suggested for morning


def test_unknown_ingredients_reported_and_more_information_needed():
    req = AnalyzeRequest(
        candidate=candidate("Mystery Serum", ["Unobtainium", "Madeupium"]),
        existing_products=[],
    )
    result = analyze(req)
    assert result.unknown_ingredients == ["Unobtainium", "Madeupium"]
    assert result.recommendation == "more_information_needed"


def test_known_ingredient_summaries_populated():
    req = AnalyzeRequest(
        candidate=candidate("Vitamin C Serum", ["Ascorbic Acid", "Unobtainium"]),
        existing_products=[],
    )
    result = analyze(req)
    names = {i.name for i in result.known_ingredients}
    assert "Ascorbic Acid (Vitamin C)" in names


def test_evidence_aggregated_without_duplicates():
    req = AnalyzeRequest(
        candidate=candidate("Vitamin C Serum", ["Ascorbic Acid"]),
        existing_products=[ProductPayload(id="p", name="Tretinoin", brand="Rx", category="treatment", ingredients=["Tretinoin"])],
    )
    result = analyze(req)
    urls = [s.url for s in result.evidence]
    assert len(urls) == len(set(urls))  # no duplicate source URLs


def test_no_existing_products_yields_useful_result():
    req = AnalyzeRequest(candidate=candidate("Vitamin C Serum", ["Ascorbic Acid"]), existing_products=[])
    result = analyze(req)
    assert result.recommendation == "potentially_useful_addition"
    assert result.compatibility_findings == []
    assert result.redundancy_findings == []
