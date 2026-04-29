"""
Citizen-facing complaint routes.
  POST /api/complaints        — file a new complaint (with image)
  GET  /api/complaints/mine   — get all complaints filed by logged-in citizen
  GET  /api/complaints/{ref}  — get a single complaint by NS-XXX ref
"""
import os
import logging
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.complaint import ComplaintOut, ComplaintCreate, ComplaintCategory
from app.services.complaint_service import (
    create_complaint, list_complaints_for_citizen,
    get_complaint_by_ref, save_image
)

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])
logger = logging.getLogger("nagarsetu.complaints")

# ── AI service config ─────────────────────────────────────────────────────────

AI_SERVICE_URL     = os.getenv("AI_SERVICE_URL", "http://localhost:8001")
AI_TIMEOUT         = 10.0    # seconds — complaint still saves if AI times out
CONFIDENCE_THRESHOLD = 0.70  # below this → needs_review = True

# ── AI call (never raises — always returns None on failure) ───────────────────

async def _get_ai_prediction(image_path: str) -> Optional[dict]:
    """
    Sends the saved image to the inference API and returns the prediction.
    Returns None silently if the AI service is down or times out —
    the complaint will still be saved with default values.
    """
    full_path = os.path.join(settings.UPLOAD_DIR, image_path)
    if not os.path.exists(full_path):
        logger.warning(f"Image not found for AI prediction: {full_path}")
        return None

    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
            with open(full_path, "rb") as f:
                # Detect content type from extension
                ext = os.path.splitext(full_path)[1].lower()
                mime = {
                    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                    ".png": "image/png",  ".webp": "image/webp",
                }.get(ext, "image/jpeg")

                response = await client.post(
                    f"{AI_SERVICE_URL}/predict",
                    files={"image": (os.path.basename(full_path), f, mime)},
                )

        if response.status_code == 200:
            return response.json()

        logger.warning(f"AI service returned {response.status_code}: {response.text}")
        return None

    except httpx.TimeoutException:
        logger.warning("AI service timed out — complaint saved without AI classification")
        return None
    except Exception as e:
        logger.error(f"AI service error: {e}")
        return None


# ── Map AI label → ComplaintCategory ─────────────────────────────────────────

# AI model uses these exact class names — map them to your ComplaintCategory enum
_AI_LABEL_TO_CATEGORY = {
    "Garbage":     ComplaintCategory.Garbage,
    "Pothole":     ComplaintCategory.Pothole,
    "Sewage":      ComplaintCategory.Waterlogging,   # closest match
    "StreetLight": ComplaintCategory.StreetLight,
    "Other":       ComplaintCategory.Other,
}

_AI_LABEL_TO_PRIORITY = {
    "High":   "High",
    "Medium": "Medium",
    "Low":    "Low",
}

_AI_LABEL_TO_DEPT = {
    "Garbage":     "Municipal Corporation",
    "Pothole":     "PWD Department",
    "Sewage":      "Municipal Corporation",
    "StreetLight": "Electricity Dept",
    "Other":       "Municipal Corporation",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_image_url(request_base_url: str, image_path: Optional[str]) -> Optional[str]:
    if not image_path:
        return None
    return f"{request_base_url.rstrip('/')}/uploads/{image_path}"


def _complaint_to_out(c, base_url: str) -> ComplaintOut:
    data = ComplaintOut.model_validate(c)
    data.image_url = _build_image_url(base_url, c.image_path)
    return data


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("", response_model=ComplaintOut, status_code=201)
async def file_complaint(
    title:        str               = Form(...),
    description:  str               = Form(...),
    category:     ComplaintCategory = Form(...),
    location:     Optional[str]     = Form(None),
    city:         Optional[str]     = Form(None),
    image:        UploadFile        = File(...),
    db:           Session           = Depends(get_db),
    current_user: User              = Depends(get_current_user),
    request_base_url: str           = "",
):
    """
    Report.jsx submits a FormData with fields: title, description, category,
    location, city, and the image file.

    After saving the image, the AI inference API is called to:
      - Classify the image
      - Override category/priority/department if confidence is high enough
      - Flag for manual review if confidence is low
    """
    # 1. Save image to disk first
    image_path = await save_image(image)

    # 2. Call AI service (non-blocking — never fails the request)
    ai_result = await _get_ai_prediction(image_path)

    # 3. Prepare complaint data starting from what citizen submitted
    data = ComplaintCreate(
        title=title, description=description,
        category=category, location=location, city=city,
    )

    # 4. AI override fields (defaults if AI unavailable)
    ai_confidence = None
    ai_severity   = None
    ai_label      = None
    needs_review  = False
    ai_priority   = None
    ai_dept       = None

    if ai_result:
        ai_label      = ai_result.get("predicted_class")
        ai_confidence = ai_result.get("confidence")
        ai_severity   = ai_result.get("severity_score")
        needs_review  = ai_result.get("needs_review", False)
        ai_priority   = ai_result.get("priority")          # "Low" | "Medium" | "High"

        logger.info(
            f"AI result for new complaint — "
            f"label={ai_label}, conf={ai_confidence:.2f}, "
            f"priority={ai_priority}, needs_review={needs_review}"
        )

        # Only override category if confidence is high enough
        if ai_label and ai_confidence and ai_confidence >= CONFIDENCE_THRESHOLD:
            mapped_category = _AI_LABEL_TO_CATEGORY.get(ai_label)
            if mapped_category:
                data = ComplaintCreate(
                    title=title, description=description,
                    category=mapped_category,   # ← AI overrides citizen selection
                    location=location, city=city,
                )
            ai_dept = _AI_LABEL_TO_DEPT.get(ai_label)
        else:
            # Low confidence — keep citizen's category, flag for review
            logger.info(f"Low confidence ({ai_confidence:.2f}) — keeping citizen category")

    # 5. Create complaint in DB
    complaint = create_complaint(
        db          = db,
        data        = data,
        citizen     = current_user,
        image_path  = image_path,
        # AI fields passed through to service
        ai_confidence = ai_confidence,
        ai_severity   = ai_severity,
        ai_label      = ai_label,
        needs_review  = needs_review,
        ai_priority   = ai_priority,
        ai_dept       = ai_dept,
    )

    return _complaint_to_out(complaint, request_base_url)


@router.get("/mine", response_model=list[ComplaintOut])
def my_complaints(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """
    UserDashboard.jsx fetches this to populate the complaint cards.
    Returns all complaints for the logged-in citizen ordered newest first.
    """
    complaints = list_complaints_for_citizen(db, current_user.id)
    return complaints


@router.get("/{ref}", response_model=ComplaintOut)
def get_complaint(
    ref:          str,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """
    Returns a single complaint. Citizens can only see their own.
    Admins and authorities can see any.
    """
    complaint = get_complaint_by_ref(db, ref)
    if current_user.role == "citizen" and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your complaint.")
    return complaint