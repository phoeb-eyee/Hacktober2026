"""Model evaluation harness (Phase 7).

Runs a small synthetic product-label image set through the real scan pipeline
and reports field accuracy, structured-output validity, and latency.

Scope: this measures the model on CLEAN synthetic labels only. Real-photo OCR
accuracy is NOT claimed here — that requires a real-photo evaluation set.
"""

import io
import os
import sys
import time

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from dotenv import load_dotenv  # noqa: E402

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from PIL import Image, ImageDraw, ImageFont  # noqa: E402

from app.services.gemma import scan_image  # noqa: E402


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


def make_label(brand, name, ingredients):
    img = Image.new("RGB", (720, 480), "white")
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 720, 72], fill=(228, 238, 226))
    d.text((30, 22), brand, fill=(40, 40, 40), font=_font(34))
    d.text((30, 118), name, fill=(28, 28, 28), font=_font(30))
    d.text((30, 170), "Ingredients:", fill=(70, 70, 70), font=_font(24))
    wrapped = ", ".join(ingredients)
    d.text((30, 206), wrapped, fill=(60, 60, 60), font=_font(22))
    return img


CASES = [
    {"brand": "VELVET LAB", "name": "Daily Hydration Serum",
     "ingredients": ["Glycerin", "Hyaluronic Acid", "Niacinamide", "Panthenol"]},
    {"brand": "ARDENT SKIN", "name": "Brightening Vitamin C Serum",
     "ingredients": ["Ascorbic Acid", "Ferulic Acid", "Tocopherol"]},
    {"brand": "ACME", "name": "Barrier Repair Moisturizer",
     "ingredients": ["Ceramide NP", "Squalane", "Glycerin"]},
]


def main():
    valid = brand_hits = name_hits = 0
    recalls = []
    latencies = []

    for case in CASES:
        img = make_label(case["brand"], case["name"], case["ingredients"])
        buf = io.BytesIO()
        img.save(buf, format="PNG")

        t0 = time.time()
        try:
            result = scan_image(buf.getvalue(), "image/png")
            latency = time.time() - t0
        except Exception as e:  # noqa: BLE001
            print(f"[{case['name']}] FAIL: {type(e).__name__}: {str(e)[:120]}")
            continue

        latencies.append(latency)
        if result.brand or result.product_name:
            valid += 1

        b_low, r_low = result.brand.lower(), case["brand"].lower()
        if b_low and (b_low in r_low or r_low in b_low):
            brand_hits += 1
        n_low, rn_low = result.product_name.lower(), case["name"].lower()
        if n_low and (n_low in rn_low or rn_low in n_low):
            name_hits += 1

        found = [i.lower() for i in result.visible_ingredients]
        expected = [i.lower() for i in case["ingredients"]]
        if expected:
            recalls.append(
                sum(1 for e in expected if any(e in f or f in e for f in found)) / len(expected)
            )

        print(
            f"[{case['name']}] {latency:.1f}s "
            f"brand={result.brand!r} name={result.product_name!r} "
            f"ingredients={result.visible_ingredients}"
        )

    n = len(CASES)
    print("\n=== Summary (synthetic labels) ===")
    print(f"cases: {n}")
    print(f"structured-output valid: {valid}/{n}")
    print(f"brand accuracy: {brand_hits}/{n}")
    print(f"name accuracy: {name_hits}/{n}")
    if recalls:
        print(f"ingredient recall (avg): {sum(recalls) / len(recalls):.2f}")
    if latencies:
        print(f"avg latency: {sum(latencies) / len(latencies):.1f}s")


if __name__ == "__main__":
    main()
