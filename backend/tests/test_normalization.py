"""Ingredient-name normalization — product labels must resolve to canonical ids."""

from app.services.ingredients import normalize, resolve_name


def test_normalize_strips_parentheticals():
    assert normalize("Ascorbic Acid (Vitamin C)") == "ascorbic acid"
    assert normalize("Tocopherol (Vitamin E)") == "tocopherol"


def test_resolve_known_ingredients():
    assert resolve_name("Ceramide NP") == "ceramides"
    assert resolve_name("Vitamin C") == "ascorbic-acid"
    assert resolve_name("Hyaluronic Acid") == "hyaluronic-acid"
    assert resolve_name("Retin-A") == "tretinoin"
    assert resolve_name("L-Ascorbic Acid") == "ascorbic-acid"


def test_resolve_unknown_ingredient():
    assert resolve_name("Unobtainium") is None
    assert resolve_name("Water") is None


def test_resolve_is_case_and_space_insensitive():
    assert resolve_name("  glycerin  ") == "glycerin"
    assert resolve_name("NIACINAMIDE") == "niacinamide"
