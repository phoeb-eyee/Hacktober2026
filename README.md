# SkinSync

**Your skincare routine, understood.**

SkinSync is a multimodal skincare education and routine-analysis app. Photograph a
product, understand its ingredients, and learn how it fits into your routine
before you buy it — powered by Google's Gemma 4 multimodal model.

> **Status:** Complete — all eight phases implemented and tested.
>
> 📖 [Architecture](ARCHITECTURE.md) · 🎬 [Demo script](DEMO.md)

## Repository layout

```
frontend/   React + TypeScript + Vite + Tailwind CSS
backend/    Python + FastAPI + Pydantic + Gemma 4 (Gemini API)
```

## Setup

### Backend

Requirements: Python 3.11+ (a native arm64 Python is recommended on Apple
Silicon — see the note below).

```bash
cd backend
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
cp .env.example .env        # then set GOOGLE_API_KEY
./.venv/bin/uvicorn app.main:app --reload --port 8000
```

### Frontend

Requirements: Node.js 20+ and npm.

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxies /api → :8000)
```

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `GOOGLE_API_KEY` | `backend/.env` (server-only) | Gemini API key — never sent to the browser |
| `GEMMA_MODEL` | `backend/.env` | Model id; default `gemma-4-26b-a4b-it` |
| `CORS_ORIGINS` | `backend/.env` | Comma-separated allowed origins |

> **Apple Silicon note:** the default `python3` here is an x86_64 conda build
> (running under Rosetta) that can't compile some native wheels. Create the venv
> with a native arm64 Python instead (e.g. `/usr/local/bin/python3`, which is
> 3.13.x on this machine).

## Testing

```bash
# Backend — normalization, interaction classification, redundancy, parsing
cd backend && ./.venv/bin/python -m pytest tests/

# Frontend — pure logic (normalization, slug, parsing, request mapping)
cd frontend && npm test

# Model evaluation — live Gemma 4 on synthetic labels
cd backend && ./.venv/bin/python scripts/eval_model.py
```

**Model eval result (synthetic labels only):** 3/3 structured-output valid, 3/3
brand, 3/3 name, 1.00 ingredient recall, ~4.4s average latency. Real-photo OCR
accuracy has not been measured and requires a real-photo evaluation set.

## Notes

- Real product + routine data persists to localStorage behind `src/lib/storage.ts`.
- The scan flow sends the image to Gemma 4 (`backend/app/services/gemma.py`),
  validates the structured response, and only saves after the user confirms.
- The ingredient knowledge base (`backend/app/data/`) is hand-curated and
  source-attributed (referencing CosIng, AAD, NIH/MedlinePlus). CosIng's INCI
  data is third-party IP, so it is referenced, not bulk-imported.
- The analysis report compares a candidate product against your saved routine
  via `POST /api/analyze`, with every finding traceable to a curated interaction
  record and every ingredient selectable to its detail page.

## Roadmap (brief)

1. Visual foundation & shell ✅
2. Product inventory & routine builder ✅
3. Gemma 4 image-understanding integration ✅
4. Ingredient knowledge base & educational explorer ✅ *(current)*
5. Compatibility & redundancy engine ✅
6. Personalized analysis & education UI ✅
7. Testing, reliability & evaluation ✅
8. Final polish & demo ✅

Skincare information is educational and does not replace professional medical advice.
