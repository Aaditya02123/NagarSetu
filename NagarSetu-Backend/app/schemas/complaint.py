from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.models.complaint import ComplaintStatus, ComplaintPriority, ComplaintCategory


# ── Complaint creation (multipart form — image handled separately) ────────────

class ComplaintCreate(BaseModel):
    title:       str
    description: str
    category:    ComplaintCategory
    location:    Optional[str] = None
    city:        Optional[str] = None


# ── Admin update (status, priority, assignment, reject reason) ────────────────

class ComplaintUpdate(BaseModel):
    status:        Optional[ComplaintStatus]   = None
    priority:      Optional[ComplaintPriority] = None
    assigned_to:   Optional[str]               = None
    reject_reason: Optional[str]               = None


# ── Response shape (matches what the frontend reads) ─────────────────────────

class CitizenBrief(BaseModel):
    id:         int
    first_name: str
    last_name:  str
    email:      str

    model_config = {"from_attributes": True}


class ComplaintOut(BaseModel):
    id:            int
    complaint_ref: str
    title:         str
    description:   str
    category:      ComplaintCategory
    location:      Optional[str]         = None
    city:          Optional[str]         = None
    image_url:     Optional[str]         = None
    status:        ComplaintStatus
    priority:      ComplaintPriority
    assigned_to:   Optional[str]         = None
    reject_reason: Optional[str]         = None
    citizen:       Optional[CitizenBrief] = None
    created_at:    datetime
    updated_at:    datetime

    # ── AI fields (None when AI was unavailable at submission time) ───────────
    ai_confidence: Optional[float] = None   # 0.0 – 1.0
    ai_severity:   Optional[float] = None   # 0.0 – 1.0
    ai_label:      Optional[str]   = None   # raw AI predicted class
    needs_review:  bool            = False  # True = admin should verify

    model_config = {"from_attributes": True}


# ── Paginated list wrapper ────────────────────────────────────────────────────

class ComplaintList(BaseModel):
    total: int
    items: list[ComplaintOut]


# ── Admin dashboard summary ───────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total:      int
    pending:    int
    inprogress: int
    resolved:   int
    rejected:   int