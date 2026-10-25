# SkinSync — Demo script (≈2–3 minutes)

## Setup

```bash
# Terminal 1 — backend
cd backend && ./.venv/bin/uvicorn app.main:app --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev   # → http://localhost:5173
```

On an empty inventory, click **"Load sample data"** (on the Dashboard or My Products
empty state). This seeds a morning routine (cleanser → vitamin C serum → moisturizer →
SPF) and an evening routine (cleanser → **tretinoin 0.05%** → moisturizer).

## Narrative

1. **"Your skincare routine, understood."** — Open the Dashboard; point out the saved
   products and the morning/evening routine summary.
2. **My Routine** — show the morning and evening lineup in application order, with
   tretinoin in the evening.
3. **Ingredient Explorer** — open **Tretinoin**; show the educational record (what it
   is, how it works, precautions, sources) and its interactions — call out that
   "with Vitamin C" is **Potential irritation, not incompatible**.
4. **Scan a Product** — photograph (or upload) a **new vitamin C serum**; show Gemma 4
   reading the label into structured fields.
5. **Review & correct** the result, then click **"Analyze against my routine."**
6. **The report** — walk through:
   - the **potential-irritation** finding (tretinoin × vitamin C) with the AM/PM
     context ("tretinoin is in your evening routine; vitamin C is suggested for
     morning"),
   - the green **"Checked — no concern identified"** section (vitamin C × niacinamide),
   - the **overlap** with the vitamin C serum you already own.
7. Click an **ingredient** inside the report → its detail page (traceability).
8. Finish on the non-coercive **recommendation**.

## Alternate beats

- Scan a **niacinamide serum** → "no established concern" with vitamin C (debunks a
  common "can't mix them" myth).
- Scan a **benzoyl peroxide** product → "established incompatibility" with tretinoin
  (stability — separate the application times).
