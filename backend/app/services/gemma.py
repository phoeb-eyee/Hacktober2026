"""Gemma 4 integration — the only place the model is called.

Responsibilities:
- Build the scan prompt and JSON schema.
- Call the hosted Gemini API (Gemma 4) with an image.
- Parse and normalize the model's structured output into a `ScanResult`.

The model is treated as untrusted: its JSON is parsed, cleaned, and coerced
before being returned. Missing/placeholder values are normalized to explicit
empty values rather than surfaced as-is.
"""

import json
import re

from google import genai
from google.genai import types

from app.config import settings
from app.schemas import ProductCategory, ScanResult

SCAN_PROMPT = (
    "You are an ingredient-label reader for a skincare app. Examine the image of a "
    "skincare product package and extract ONLY information that is clearly visible. "
    "Do not invent or guess anything that is not readable in the image.\n\n"
    "Return JSON with these fields:\n"
    '- "brand": the brand name if visible, otherwise ""\n'
    '- "product_name": the product name if visible, otherwise ""\n'
    '- "product_category": one of cleanser, moisturizer, sunscreen, serum, exfoliant, '
    'treatment, other (based only on what is stated or strongly implied), else "other"\n'
    '- "visible_ingredients": a list of ingredient names printed on the label, exactly '
    "as shown and in order; empty list if none are legible\n"
    '- "packaging_text": the raw packaging text you could read (may be partial), '
    'otherwise ""\n'
    '- "uncertainties": a list of short strings describing anything you could not read '
    "or were unsure about\n"
    '- "needs_manual_review": true if the image is blurry, contains multiple products, '
    "is unreadable, or important fields are missing\n\n"
    "Important: a readable brand and product name do NOT mean the ingredient list is "
    "known. Only list ingredients that are actually visible in the image."
)

# Gemini API uses uppercase type names in its JSON-schema dialect.
SCAN_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "brand": {"type": "STRING"},
        "product_name": {"type": "STRING"},
        "product_category": {
            "type": "STRING",
            "enum": [
                "cleanser", "moisturizer", "sunscreen", "serum",
                "exfoliant", "treatment", "other",
            ],
        },
        "visible_ingredients": {"type": "ARRAY", "items": {"type": "STRING"}},
        "packaging_text": {"type": "STRING"},
        "uncertainties": {"type": "ARRAY", "items": {"type": "STRING"}},
        "needs_manual_review": {"type": "BOOLEAN"},
    },
    "required": [
        "brand", "product_name", "product_category", "visible_ingredients",
        "packaging_text", "uncertainties", "needs_manual_review",
    ],
}

_PLACEHOLDERS = {
    "", "not provided", "n/a", "na", "none", "null", "unknown",
    "not visible", "not readable", "not stated", "unreadable",
}

_CATEGORIES = {
    "cleanser", "moisturizer", "sunscreen", "serum", "exfoliant", "treatment", "other",
}

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.google_api_key:
            raise RuntimeError("GOOGLE_API_KEY is not configured on the server.")
        _client = genai.Client(api_key=settings.google_api_key)
    return _client


def _clean_str(value: object) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text.lower() in _PLACEHOLDERS else text


def _clean_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for item in value:
        cleaned = _clean_str(item)
        if cleaned and cleaned.lower() not in seen:
            seen.add(cleaned.lower())
            out.append(cleaned)
    return out


def _clean_category(value: object) -> ProductCategory:
    text = _clean_str(value).lower()
    return text if text in _CATEGORIES else "other"


def _extract_json(text: str) -> dict | None:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None
    return None


def _parse(text: str) -> ScanResult:
    data = _extract_json(text)
    if data is None:
        return ScanResult(
            packaging_text=text[:2000],
            uncertainties=["The model response was not valid JSON; manual review required."],
            needs_manual_review=True,
        )

    result = ScanResult(
        brand=_clean_str(data.get("brand")),
        product_name=_clean_str(data.get("product_name")),
        product_category=_clean_category(data.get("product_category")),
        visible_ingredients=_clean_list(data.get("visible_ingredients")),
        packaging_text=_clean_str(data.get("packaging_text")),
        uncertainties=_clean_list(data.get("uncertainties")),
        needs_manual_review=bool(data.get("needs_manual_review", False)),
    )

    # Deterministic guard: if nothing identifiable was read, require review.
    if not result.brand and not result.product_name:
        result.needs_manual_review = True

    return result


def scan_image(image_bytes: bytes, mime_type: str) -> ScanResult:
    """Send an image to Gemma 4 and return a validated, normalized ScanResult."""
    client = _get_client()
    response = client.models.generate_content(
        model=settings.gemma_model,
        contents=[
            SCAN_PROMPT,
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SCAN_SCHEMA,
        ),
    )
    return _parse(response.text or "")
