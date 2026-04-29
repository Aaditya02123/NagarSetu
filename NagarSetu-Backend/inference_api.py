# -*- coding: utf-8 -*-
"""
step6_inference_api.py — NagarSetu AI Inference Service
---------------------------------------------------------
A standalone FastAPI microservice that:
  • Loads the exported ONNX model
  • Accepts POST /predict  with an image file
  • Returns predicted class + confidence + severity score
  • Exposes GET  /health   for liveness checks

Run locally:
    uvicorn step6_inference_api:app --host 0.0.0.0 --port 8001 --reload

Your main NagarSetu FastAPI backend calls this service via HTTP
(or you can mount the router directly — see the integration note at the bottom).
"""

import io
import json
import time
import logging
from pathlib import Path

import numpy as np
from PIL import Image

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─── CONFIG ───────────────────────────────────────────────────────────────────

BASE_DIR       = Path(__file__).parent
MODELS_DIR = BASE_DIR / "ml_models"
ONNX_PATH      = MODELS_DIR / "nagarsetu.onnx"
CLASS_MAP_PATH = MODELS_DIR / "class_names.json"

IMAGE_SIZE     = 224
IMAGENET_MEAN  = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD   = np.array([0.229, 0.224, 0.225], dtype=np.float32)

# Severity weights per class (tweak these for your domain)
SEVERITY_WEIGHTS = {
    "Pothole":     0.85,
    "Sewage":      0.90,
    "Waterlogging":0.80,
    "Garbage":     0.65,
    "StreetLight": 0.60,
    "Construction":0.75,
    "Other":       0.50,
}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nagarsetu.ai")

# ─── ONNX RUNTIME SESSION ─────────────────────────────────────────────────────

try:
    import onnxruntime as ort
    _PROVIDERS = (
        ["CUDAExecutionProvider", "CPUExecutionProvider"]
        if ort.get_device() == "GPU"
        else ["CPUExecutionProvider"]
    )
    _SESSION: ort.InferenceSession | None = None
    _CLASS_NAMES: dict[str, str] = {}
except ImportError:
    raise RuntimeError(
        "onnxruntime is required.\n"
        "Install it with:  pip install onnxruntime\n"
        "  or for GPU:     pip install onnxruntime-gpu"
    )


def load_model():
    global _SESSION, _CLASS_NAMES
    if not ONNX_PATH.exists():
        raise FileNotFoundError(
            f"ONNX model not found at {ONNX_PATH}\n"
            "Run step5_export_model.py first."
        )
    _SESSION = ort.InferenceSession(str(ONNX_PATH), providers=_PROVIDERS)
    logger.info(f"✅ ONNX model loaded from {ONNX_PATH}")
    logger.info(f"   Providers: {_SESSION.get_providers()}")

    if CLASS_MAP_PATH.exists():
        with open(CLASS_MAP_PATH) as f:
            _CLASS_NAMES = json.load(f)        # {"0": "Garbage", "1": "Pothole", ...}
        logger.info(f"✅ Class map loaded: {_CLASS_NAMES}")
    else:
        logger.warning("class_names.json not found — using index labels")


# ─── PREPROCESSING ────────────────────────────────────────────────────────────

def preprocess(image_bytes: bytes) -> np.ndarray:
    """
    Converts raw image bytes → (1, 3, H, W) float32 tensor
    matching the training val_transforms pipeline.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((IMAGE_SIZE, IMAGE_SIZE), Image.BILINEAR)
    arr = np.array(img, dtype=np.float32) / 255.0           # [H, W, 3]
    arr = (arr - IMAGENET_MEAN) / IMAGENET_STD              # normalize
    arr = arr.transpose(2, 0, 1)                            # [3, H, W]
    return arr[np.newaxis, ...]                              # [1, 3, H, W]

# ─── INFERENCE ────────────────────────────────────────────────────────────────

def softmax(logits: np.ndarray) -> np.ndarray:
    e = np.exp(logits - logits.max())
    return e / e.sum()


CONFIDENCE_THRESHOLD = 0.70   # below this → flag for manual review

def predict(image_bytes: bytes) -> dict:
    if _SESSION is None:
        raise RuntimeError("Model not loaded — call load_model() first.")

    tensor     = preprocess(image_bytes)
    input_name = _SESSION.get_inputs()[0].name

    start = time.perf_counter()
    [logits] = _SESSION.run(None, {input_name: tensor})
    latency_ms = (time.perf_counter() - start) * 1000

    probs       = softmax(logits[0])
    top_idx     = int(np.argmax(probs))
    confidence  = float(probs[top_idx])
    class_label = _CLASS_NAMES.get(str(top_idx), f"class_{top_idx}")

    # Severity score = confidence × class weight
    weight         = SEVERITY_WEIGHTS.get(class_label, 0.5)
    severity_score = round(confidence * weight, 4)

    # Map severity to human-readable priority
    if severity_score >= 0.75:
        priority = "High"
    elif severity_score >= 0.45:
        priority = "Medium"
    else:
        priority = "Low"

    # Build top-3 predictions
    top3_idx = np.argsort(probs)[::-1][:3]
    top3 = [
        {
            "class":      _CLASS_NAMES.get(str(i), f"class_{i}"),
            "confidence": round(float(probs[i]), 4),
        }
        for i in top3_idx
    ]

    # Confidence check — flag low confidence for manual admin review
    needs_review = confidence < CONFIDENCE_THRESHOLD
    warning = (
        f"Low confidence ({confidence:.0%}) — manual review recommended. "
        f"Could also be {top3[1]['class']} ({top3[1]['confidence']:.0%})"
        if needs_review else None
    )

    return {
        "predicted_class": class_label,
        "confidence":      round(confidence, 4),
        "severity_score":  severity_score,
        "priority":        priority,
        "top3":            top3,
        "latency_ms":      round(latency_ms, 2),
        "needs_review":    needs_review,
        "warning":         warning,
    }

# ─── FASTAPI APP ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="NagarSetu AI Inference API",
    description="Image classification + severity scoring for civic complaint images",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    load_model()


# ─── RESPONSE SCHEMAS ─────────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    predicted_class: str
    confidence:      float
    severity_score:  float
    priority:        str          # "Low" | "Medium" | "High"
    top3:            list[dict]
    latency_ms:      float


class HealthResponse(BaseModel):
    status:      str
    model_loaded: bool
    classes:     list[str]


# ─── ROUTES ───────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health():
    """Liveness + readiness check. Call this from your main backend's startup."""
    return HealthResponse(
        status       = "ok" if _SESSION else "model_not_loaded",
        model_loaded = _SESSION is not None,
        classes      = list(_CLASS_NAMES.values()),
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
async def predict_endpoint(image: UploadFile = File(...)):
    """
    Accepts a JPEG / PNG / WEBP image and returns the complaint category,
    confidence, and severity score.

    Called by the NagarSetu complaint router after image upload:
        response = httpx.post("http://localhost:8001/predict", files={"image": img_bytes})
    """
    # Validate content type
    if image.content_type not in ("image/jpeg", "image/png", "image/webp", "image/bmp"):
        raise HTTPException(
            status_code=415,
            detail="Unsupported image format. Use JPEG, PNG, or WEBP."
        )

    image_bytes = await image.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    if len(image_bytes) > 10 * 1024 * 1024:   # 10 MB hard limit
        raise HTTPException(status_code=413, detail="Image too large. Max 10 MB.")

    try:
        result = predict(image_bytes)
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

    logger.info(
        f"Predicted: {result['predicted_class']} "
        f"(conf={result['confidence']:.2f}, "
        f"severity={result['severity_score']:.2f}, "
        f"{result['latency_ms']:.1f}ms)"
    )
    return PredictionResponse(**result)


# ─── INTEGRATION NOTE ─────────────────────────────────────────────────────────
# To call this from your main NagarSetu FastAPI backend (complaints.py),
# add this helper and call it after save_image():
#
#   import httpx
#
#   async def get_ai_classification(image_path: str) -> dict | None:
#       try:
#           with open(image_path, "rb") as f:
#               r = await httpx.AsyncClient().post(
#                   "http://localhost:8001/predict",
#                   files={"image": f},
#                   timeout=10,
#               )
#           return r.json() if r.status_code == 200 else None
#       except Exception:
#           return None   # AI is optional — don't fail the complaint submission