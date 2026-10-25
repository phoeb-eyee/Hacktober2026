"""SkinSync API — FastAPI application.

Endpoints:
- GET  /health    — liveness + which model is configured (not the key).
- POST /api/scan  — accept a product image, return a validated ScanResult.
"""

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import (
    AnalysisResult,
    AnalyzeRequest,
    IngredientDetailResponse,
    IngredientSummary,
    ScanResult,
)
from app.services.gemma import scan_image
from app.services.ingredients import get_detail, list_summaries
from app.services.analysis import analyze

app = FastAPI(title="SkinSync API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": settings.gemma_model}


@app.post("/api/scan", response_model=ScanResult)
async def scan(file: UploadFile = File(...)) -> ScanResult:
    data = await file.read()

    if not data:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(data) > settings.max_image_bytes:
        raise HTTPException(status_code=413, detail="Image is too large (max 10 MB).")

    mime_type = file.content_type or "application/octet-stream"
    if not mime_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="Unsupported file type — please upload an image."
        )

    try:
        return scan_image(data, mime_type)
    except Exception as exc:  # noqa: BLE001
        message = str(exc)
        lowered = message.lower()
        if any(
            token in lowered
            for token in ("api key", "401", "403", "authentication", "permission", "unauthorized")
        ):
            raise HTTPException(
                status_code=502,
                detail="AI model authentication failed. Check the server's GOOGLE_API_KEY.",
            )
        raise HTTPException(
            status_code=502, detail="The AI model request failed. Please try again."
        )


@app.get("/api/ingredients", response_model=list[IngredientSummary])
def ingredients(query: str | None = None) -> list[IngredientSummary]:
    return list_summaries(query)


@app.get("/api/ingredients/{ingredient_id}", response_model=IngredientDetailResponse)
def ingredient_detail(ingredient_id: str) -> IngredientDetailResponse:
    detail = get_detail(ingredient_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Ingredient not found.")
    return detail


@app.post("/api/analyze", response_model=AnalysisResult)
def analyze_product(request: AnalyzeRequest) -> AnalysisResult:
    return analyze(request)
