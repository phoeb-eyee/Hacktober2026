"""Phase 3, Step 1 — verify Gemma 4 access via the Gemini API.

Reads GOOGLE_API_KEY from backend/.env (never printed). Makes three minimal
requests: (1) text, (2) text + image, (3) structured JSON, plus a check of the
lower-cost alternative model. Prints a non-secret summary so we can confirm
access, interface, and image encoding before building the full integration.
"""

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

MODEL = os.getenv("GEMMA_MODEL", "gemma-4-31b-it")
ALT_MODEL = "gemma-4-26b-a4b-it"


def make_test_image():
    img = Image.new("RGB", (680, 360), "white")
    d = ImageDraw.Draw(img)
    font = _font(30)
    small = _font(22)
    d.rectangle([0, 0, 680, 64], fill=(232, 240, 230))
    d.text((24, 18), "ACME  Gentle Hydrating Cleanser", fill=(30, 30, 30), font=font)
    d.text((24, 120), "Ingredients: Aqua, Glycerin, Niacinamide", fill=(60, 60, 60), font=small)
    return img


def _font(size):
    for path in (
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def run(label, fn):
    t0 = time.time()
    try:
        text = fn()
        print(f"[{label}] ok in {time.time() - t0:.1f}s -> {text!r}")
    except Exception as e:  # noqa: BLE001
        print(f"[{label}] FAIL {type(e).__name__}: {str(e)[:240]}")


def main():
    key = os.getenv("GOOGLE_API_KEY")
    if not key:
        print("FAIL: GOOGLE_API_KEY not set (missing backend/.env?)")
        sys.exit(1)
    # Print only the ends of the key, never the middle.
    print(f"key present: {key[:4]}…{key[-4:]} (length {len(key)})")

    client = genai.Client(api_key=key)

    run("text", lambda: client.models.generate_content(
        model=MODEL, contents="Reply with the single word: ok").text)

    run("image", lambda: client.models.generate_content(
        model=MODEL,
        contents=[
            "Read any text in this image and say what product it appears to be. Be brief.",
            make_test_image(),
        ],
    ).text)

    run("json", lambda: client.models.generate_content(
        model=MODEL,
        contents='Return JSON: {"brand": "...", "product_name": "..."} for a fictional "Acme Gentle Cleanser" by "Acme".',
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    ).text)

    run(f"alt:{ALT_MODEL}", lambda: client.models.generate_content(
        model=ALT_MODEL, contents="Reply with: ok").text)


if __name__ == "__main__":
    main()
