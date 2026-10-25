"""Ingredient knowledge-base access.

Loads the curated ingredient and interaction data, validates it through Pydantic,
and provides deterministic lookup helpers used by the API. Ingredient-name
normalization (lowercase, strip parentheticals, collapse separators) lets
product-label names such as "Ceramide NP" or "Ascorbic Acid" resolve to canonical
records.
"""

import re

from app.data.ingredients import INGREDIENTS
from app.data.interactions import INTERACTIONS
from app.schemas import (
    Ingredient,
    IngredientDetailResponse,
    IngredientSummary,
    Interaction,
    InteractionWithPeer,
)

_ingredients: dict[str, Ingredient] = {}
_interactions: list[Interaction] = []
_alias_index: dict[str, str] = {}


def normalize(name: str) -> str:
    text = name.strip().lower()
    text = re.sub(r"\s*\([^)]*\)", "", text)  # strip "(Vitamin C)" etc.
    text = text.replace("_", " ").replace("-", " ")
    return re.sub(r"\s+", " ", text).strip()


def _load() -> None:
    for raw in INGREDIENTS:
        ing = Ingredient.model_validate(raw)
        _ingredients[ing.ingredient_id] = ing
        for alias in [ing.canonical_name, *ing.aliases]:
            _alias_index.setdefault(normalize(alias), ing.ingredient_id)
    for raw in INTERACTIONS:
        _interactions.append(Interaction.model_validate(raw))


_load()


def list_summaries(query: str | None = None) -> list[IngredientSummary]:
    summaries = [
        IngredientSummary(
            ingredient_id=ing.ingredient_id,
            canonical_name=ing.canonical_name,
            aliases=ing.aliases,
            ingredient_category=ing.ingredient_category,
            primary_functions=ing.primary_functions,
            short_description=ing.short_description,
        )
        for ing in _ingredients.values()
    ]
    summaries.sort(key=lambda s: s.canonical_name)
    if query:
        q = query.strip().lower()
        summaries = [
            s
            for s in summaries
            if q in s.canonical_name.lower()
            or q in s.ingredient_category.lower()
            or any(q in a.lower() for a in s.aliases)
        ]
    return summaries


def get_detail(ingredient_id: str) -> IngredientDetailResponse | None:
    ing = _ingredients.get(ingredient_id)
    if ing is None:
        return None

    interactions: list[InteractionWithPeer] = []
    for it in _interactions:
        if it.ingredient_a == ingredient_id:
            peer = _ingredients.get(it.ingredient_b)
            interactions.append(
                InteractionWithPeer(
                    **it.model_dump(),
                    peer_name=peer.canonical_name if peer else it.ingredient_b,
                )
            )
        elif it.ingredient_b == ingredient_id:
            peer = _ingredients.get(it.ingredient_a)
            interactions.append(
                InteractionWithPeer(
                    **it.model_dump(),
                    peer_name=peer.canonical_name if peer else it.ingredient_a,
                )
            )

    return IngredientDetailResponse(ingredient=ing, interactions=interactions)


def resolve_name(name: str) -> str | None:
    """Map a product-label ingredient name to a canonical ingredient_id, or None."""
    return _alias_index.get(normalize(name))


def get_ingredient(ingredient_id: str) -> Ingredient | None:
    return _ingredients.get(ingredient_id)


def all_interactions() -> list[Interaction]:
    return list(_interactions)
