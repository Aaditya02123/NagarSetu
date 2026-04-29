"""
Business logic for complaints.
Routers call these functions — they never touch the DB directly.
This keeps routers thin and logic testable.
"""
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.models.complaint import Complaint, ComplaintStatus, ComplaintCategory
from app.models.user import User
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, DashboardStats


# ── Reference ID generation ───────────────────────────────────────────────────

def _generate_ref(db: Session) -> str:
    """Generates the next NS-XXX reference number."""
    count = db.query(func.count(Complaint.id)).scalar()
    return f"NS-{count + 1:03d}"


# ── Image saving ──────────────────────────────────────────────────────────────

async def save_image(file: UploadFile) -> str:
    """
    Saves an uploaded image to disk.
    Returns the relative path stored in the DB, e.g. "2024/03/abc123.jpg".
    Max size enforced here.
    """
    max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Max {settings.MAX_IMAGE_SIZE_MB} MB allowed."
        )

    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    date_prefix = datetime.now().strftime("%Y/%m")
    rel_dir = os.path.join(settings.UPLOAD_DIR, date_prefix)
    os.makedirs(rel_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(rel_dir, filename)
    with open(full_path, "wb") as f:
        f.write(contents)

    return os.path.join(date_prefix, filename)   # stored in DB


# ── CRUD ──────────────────────────────────────────────────────────────────────

def create_complaint(
    db:           Session,
    data:         ComplaintCreate,
    citizen:      User,
    image_path:   Optional[str] = None,
    ai_confidence: Optional[float] = None,
    ai_severity:   Optional[float] = None,
    ai_label:      Optional[str]   = None,
    needs_review:  bool            = False,
    ai_priority:   Optional[str]   = None,
    ai_dept:       Optional[str]   = None,
) -> Complaint:
    from app.models.complaint import ComplaintPriority
    complaint = Complaint(
        complaint_ref = _generate_ref(db),
        title         = data.title,
        description   = data.description,
        category      = data.category,
        location      = data.location,
        city          = data.city,
        image_path    = image_path,
        citizen_id    = citizen.id,
        # AI fields
        ai_confidence = ai_confidence,
        ai_severity   = ai_severity,
        ai_label      = ai_label,
        needs_review  = needs_review,
        priority      = ComplaintPriority(ai_priority) if ai_priority else ComplaintPriority.Medium,
        assigned_to   = ai_dept,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


def get_complaint_by_ref(db: Session, ref: str) -> Complaint:
    c = db.query(Complaint).filter(Complaint.complaint_ref == ref).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return c


def list_complaints_for_citizen(db: Session, citizen_id: int) -> list[Complaint]:
    """Returns all complaints filed by a specific citizen."""
    return (
        db.query(Complaint)
        .filter(Complaint.citizen_id == citizen_id)
        .order_by(Complaint.created_at.desc())
        .all()
    )


def list_all_complaints(
    db:           Session,
    status:       Optional[str]  = None,
    category:     Optional[str]  = None,
    city:         Optional[str]  = None,
    search:       Optional[str]  = None,
    skip:         int            = 0,
    limit:        int            = 50,
    needs_review: Optional[bool] = None,   # ← add this
) -> tuple[int, list[Complaint]]:
    q = db.query(Complaint)
    if status:       q = q.filter(Complaint.status == status)
    if category:     q = q.filter(Complaint.category == category)
    if city:         q = q.filter(Complaint.city.ilike(f"%{city}%"))
    if search:       q = q.filter(
        Complaint.title.ilike(f"%{search}%") |
        Complaint.complaint_ref.ilike(f"%{search}%") |
        Complaint.location.ilike(f"%{search}%")
    )
    if needs_review is not None:           # ← add this block
        q = q.filter(Complaint.needs_review == needs_review)

    total = q.count()
    items = q.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()
    return total, items


def update_complaint(db: Session, ref: str, data: ComplaintUpdate) -> Complaint:
    """Admin updates status / assignment / priority / reject_reason."""
    c = get_complaint_by_ref(db, ref)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(c, field, value)
    c.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(c)
    return c


def get_dashboard_stats(db: Session) -> DashboardStats:
    """Counts by status for the admin Overview cards."""
    total      = db.query(func.count(Complaint.id)).scalar()
    pending    = db.query(func.count(Complaint.id)).filter(Complaint.status == ComplaintStatus.pending).scalar()
    inprogress = db.query(func.count(Complaint.id)).filter(Complaint.status == ComplaintStatus.inprogress).scalar()
    resolved   = db.query(func.count(Complaint.id)).filter(Complaint.status == ComplaintStatus.resolved).scalar()
    rejected   = db.query(func.count(Complaint.id)).filter(Complaint.status == ComplaintStatus.rejected).scalar()
    return DashboardStats(
        total=total, pending=pending,
        inprogress=inprogress, resolved=resolved, rejected=rejected
    )