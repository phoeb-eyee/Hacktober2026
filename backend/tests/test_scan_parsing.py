"""Model-response parsing & normalization (gemma._parse).

Model output is untrusted: placeholders become empty, unknown categories are
coerced, invalid JSON falls back to a manual-review result, and an unidentifiable
product forces manual review.
"""

from app.services.gemma import _parse


def test_valid_json_parses():
    result = _parse(
        '{"brand":"Acme","product_name":"Cleanser","product_category":"cleanser",'
        '"visible_ingredients":["Water","Glycerin"],"packaging_text":"label",'
        '"uncertainties":[],"needs_manual_review":false}'
    )
    assert result.brand == "Acme"
    assert result.product_category == "cleanser"
    assert result.visible_ingredients == ["Water", "Glycerin"]
    assert result.needs_manual_review is False


def test_placeholders_normalize_to_empty_and_force_review():
    result = _parse(
        '{"brand":"Not provided","product_name":"N/A","product_category":"other",'
        '"visible_ingredients":["Not provided"],"packaging_text":"",'
        '"uncertainties":[],"needs_manual_review":false}'
    )
    assert result.brand == ""
    assert result.product_name == ""
    assert result.visible_ingredients == []
    assert result.needs_manual_review is True  # deterministic guard


def test_invalid_json_falls_back_to_manual_review():
    result = _parse("this is not json at all")
    assert result.needs_manual_review is True
    assert "this is not json at all" in result.packaging_text


def test_json_in_code_fence_is_extracted():
    result = _parse('```json\n{"brand":"A","product_name":"B","product_category":"serum",'
                    '"visible_ingredients":[],"packaging_text":"","uncertainties":[],'
                    '"needs_manual_review":false}\n```')
    assert result.brand == "A"


def test_unknown_category_coerced_to_other():
    result = _parse(
        '{"brand":"A","product_name":"B","product_category":"shampoo",'
        '"visible_ingredients":[],"packaging_text":"","uncertainties":[],'
        '"needs_manual_review":false}'
    )
    assert result.product_category == "other"


def test_duplicate_ingredients_deduplicated():
    result = _parse(
        '{"brand":"A","product_name":"B","product_category":"serum",'
        '"visible_ingredients":["Glycerin","glycerin"," Glycerin "],'
        '"packaging_text":"","uncertainties":[],"needs_manual_review":false}'
    )
    assert result.visible_ingredients == ["Glycerin"]
