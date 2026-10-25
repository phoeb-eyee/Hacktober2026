"""Follow-up verification: confirm the faster MoE model supports image + JSON
structured output, and gauge 31b flakiness. Prints non-secret summaries only."""

import os
import sys
import time

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from dotenv import load_dotenv  # noqa: E402

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from google import genai  # noqa: E402
from google.genai import types  # noqa: E402
from PIL import Image, ImageDraw, ImageFont  # noqa: E402

FAST = "gemma-4-26b-a4b-it"
BIG = "gemma-4-31b-it"

SCAN_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "brand": {"type": "STRING"},
        "product_name": {"type": "STRING"},
        "product_category": {"type": "STRING"},
        "visible_ingredients": {"type": "ARRAY", "items": {"type": "STRING"}},
        "packaging_text": {"type": "STRING"},
        "uncertainties": {"type": "ARRAY", "items": {"type": "STRING"}},
        "needs_manual_review": {"type": "BOOLEAN"},
    },
    "required": ["brand", "product_name", "product_category", "visible_ingredients", "needs_manual_review"],
}


def _font(size):
    for path in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf"):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def make_test_image():
    img = Image.new("RGB", (680, 360), "white")
    d = ImageDraw.Draw(img)
    f1, f2 = _font(30), _font(22)
    d.rectangle([0, 0, 680, 64], fill=(232, 240, 230))
    d.text((24, 18), "ACME  Gentle Hydrating Cleanser", fill=(30, 30, 30), font=f1)
    d.text((24, 120), "Ingredients: Aqua, Glycerin, Niacinamide", fill=(60, 60, 60), font=f2)
    return img


def main():
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

    # 1. image on the fast model
    t0 = time.time()
    try:
        r = client.models.generate_content(
            model=FAST,
            contents=["Read the product name and ingredients in this image. Be brief.", make_test_image()],
        )
        print(f"[{FAST} image] ok {time.time()-t0:.1f}s -> {r.text[:160]!r}")
    except Exception as e:  # noqa: BLE001
        print(f"[{FAST} image] FAIL {type(e).__name__}: {str(e)[:200]}")

    # 2. structured JSON on the fast model
    t0 = time.time()
    try:
        r = client.models.generate_content(
            model=FAST,
            contents="Extract this product label into the schema.",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SCAN_SCHEMA,
            ),
        )
        print(f"[{FAST} json] ok {time.time()-t0:.1f}s -> {r.text[:200]!r}")
    except Exception as e:  # noqa: BLE001
        print(f"[{FAST} json] FAIL {type(e).__name__}: {str(e)[:200]}")

    # 3. retry 31b text twice to gauge flakiness
    for i in (1, 2):
        t0 = time.time()
        try:
            r = client.models.generate_content(model=BIG, contents="Reply with: ok")
            print(f"[{BIG} text #{i}] ok {time.time()-t0:.1f}s -> {r.text[:40]!r}")
        except Exception as e:  # noqa: BLE001
            print(f"[{BIG} text #{i}] FAIL {type(e).__name__}: {str(e)[:120]}")


if __name__ == "__main__":
    main()
