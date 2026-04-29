"""
Admin-only routes — protected by require_admin dependency.
All data consumed by AdminDashboard.jsx comes from here.
"""
from typing import Optional
from collections import defaultdict

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.user import User
from app.models.complaint import Complaint, ComplaintStatus
from app.schemas.complaint import (
    ComplaintOut, ComplaintList, ComplaintUpdate, DashboardStats
)
from app.schemas.user import UserOut
from app.services.complaint_service import (
    list_all_complaints, update_complaint, get_dashboard_stats
)
from pydantic import BaseModel

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ── Overview stats ────────────────────────────────────────────────────────────

@router.get("/stats", response_model=DashboardStats)
def stats(
    db:    Session = Depends(get_db),
    _user: User    = Depends(require_admin),
):
    return get_dashboard_stats(db)


# ── AI stats — new endpoint ───────────────────────────────────────────────────

class AIStats(BaseModel):
    total_classified:    int     # complaints that have an ai_label
    needs_review:        int     # complaints where needs_review = True
    auto_classified:     int     # classified + NOT needs_review
    avg_confidence:      float   # average ai_confidence across classified complaints
    avg_severity:        float   # average ai_severity across classified complaints
    high_severity:       int     # complaints with ai_severity >= 0.75
    label_counts:        dict    # { "Pothole": 12, "Garbage": 5, ... }


@router.get("/stats/ai", response_model=AIStats)
def ai_stats(
    db:    Session = Depends(get_db),
    _user: User    = Depends(require_admin),
):
    """
    Powers the AI section in the Analytics tab.
    Returns aggregated AI classification metrics.
    """
    # All complaints that were AI-classified
    classified = (
        db.query(Complaint)
        .filter(Complaint.ai_label.isnot(None))
        .all()
    )

    total_classified = len(classified)
    needs_review     = sum(1 for c in classified if c.needs_review)
    auto_classified  = total_classified - needs_review

    avg_confidence = (
        round(sum(c.ai_confidence for c in classified if c.ai_confidence) / total_classified, 4)
        if total_classified else 0.0
    )
    avg_severity = (
        round(sum(c.ai_severity for c in classified if c.ai_severity) / total_classified, 4)
        if total_classified else 0.0
    )
    high_severity = sum(
        1 for c in classified if c.ai_severity and c.ai_severity >= 0.75
    )

    # Count per AI label
    label_counts: dict[str, int] = defaultdict(int)
    for c in classified:
        if c.ai_label:
            label_counts[c.ai_label] += 1

    return AIStats(
        total_classified = total_classified,
        needs_review     = needs_review,
        auto_classified  = auto_classified,
        avg_confidence   = avg_confidence,
        avg_severity     = avg_severity,
        high_severity    = high_severity,
        label_counts     = dict(label_counts),
    )


# ── Complaint list (with filters) ─────────────────────────────────────────────

@router.get("/complaints", response_model=ComplaintList)
def complaints_list(
    status:        Optional[str] = Query(None),
    category:      Optional[str] = Query(None),
    city:          Optional[str] = Query(None),
    search:        Optional[str] = Query(None),
    needs_review:  Optional[bool] = Query(None),   # ← new filter
    skip:          int            = Query(0, ge=0),
    limit:         int            = Query(50, le=200),
    db:            Session        = Depends(get_db),
    _user:         User           = Depends(require_admin),
):
    total, items = list_all_complaints(
        db, status, category, city, search, skip, limit, needs_review
    )
    return ComplaintList(total=total, items=items)


# ── Update a complaint ────────────────────────────────────────────────────────

@router.patch("/complaints/{ref}", response_model=ComplaintOut)
def update(
    ref:   str,
    body:  ComplaintUpdate,
    db:    Session = Depends(get_db),
    _user: User    = Depends(require_admin),
):
    return update_complaint(db, ref, body)


# ── Department performance ────────────────────────────────────────────────────

class DeptStat(BaseModel):
    name:     str
    assigned: int
    resolved: int
    pending:  int


@router.get("/departments", response_model=list[DeptStat])
def departments(
    db:    Session = Depends(get_db),
    _user: User    = Depends(require_admin),
):
    rows = (
        db.query(
            Complaint.assigned_to,
            Complaint.status,
            func.count(Complaint.id).label("cnt"),
        )
        .filter(Complaint.assigned_to.isnot(None))
        .group_by(Complaint.assigned_to, Complaint.status)
        .all()
    )

    agg: dict[str, dict] = defaultdict(lambda: {"assigned": 0, "resolved": 0, "pending": 0})
    for dept, status, cnt in rows:
        agg[dept]["assigned"] += cnt
        if status == ComplaintStatus.resolved:
            agg[dept]["resolved"] += cnt
        elif status in (ComplaintStatus.pending, ComplaintStatus.inprogress):
            agg[dept]["pending"] += cnt

    return [
        DeptStat(name=name, **counts)
        for name, counts in agg.items()
    ]


# ── Recent activity feed ──────────────────────────────────────────────────────

class ActivityItem(BaseModel):
    complaint_ref: str
    action:        str
    time_ago:      str
    type:          str


@router.get("/activity", response_model=list[ActivityItem])
def activity(
    db:    Session = Depends(get_db),
    _user: User    = Depends(require_admin),
):
    from datetime import datetime, timezone

    recent = (
        db.query(Complaint)
        .order_by(desc(Complaint.updated_at))
        .limit(20)
        .all()
    )

    def time_ago(dt) -> str:
        now  = datetime.now(timezone.utc)
        diff = now - dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else now - dt
        seconds = int(diff.total_seconds())
        if seconds < 3600:  return f"{seconds // 60}m ago"
        if seconds < 86400: return f"{seconds // 3600}h ago"
        return f"{seconds // 86400}d ago"

    def action_type(c: Complaint) -> tuple[str, str]:
        if c.status == ComplaintStatus.resolved:
            return f"Complaint {c.complaint_ref} resolved", "resolve"
        if c.status == ComplaintStatus.rejected:
            return f"Complaint {c.complaint_ref} rejected", "reject"
        if c.status == ComplaintStatus.inprogress:
            return f"{c.complaint_ref} moved to In Progress", "update"
        return f"New complaint filed: {c.complaint_ref}", "new"

    result = []
    for c in recent:
        action, atype = action_type(c)
        result.append(ActivityItem(
            complaint_ref=c.complaint_ref,
            action=action,
            time_ago=time_ago(c.updated_at),
            type=atype,
        ))
    return result


# ── User management ───────────────────────────────────────────────────────────

class UserAdminOut(BaseModel):
    id:         int
    first_name: str
    last_name:  str
    email:      str
    role:       str
    is_active:  bool

    model_config = {"from_attributes": True}


class UserStatusUpdate(BaseModel):
    is_active: bool


@router.get("/users", response_model=list[UserAdminOut])
def list_users(
    db:    Session = Depends(get_db),
    _user: User    = Depends(require_admin),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}", response_model=UserAdminOut)
def toggle_user(
    user_id: int,
    body:    UserStatusUpdate,
    db:      Session = Depends(get_db),
    _user:   User    = Depends(require_admin),
):
    from fastapi import HTTPException
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = body.is_active
    db.commit()
    db.refresh(user)
    return user


# ── Weekly analytics ──────────────────────────────────────────────────────────

class WeeklyData(BaseModel):
    day:   str
    count: int


@router.get("/analytics/weekly", response_model=list[WeeklyData])
def weekly_analytics(
    db:    Session = Depends(get_db),
    _user: User    = Depends(require_admin),
):
    from datetime import datetime, timezone, timedelta

    today = datetime.now(timezone.utc).date()
    days  = [(today - timedelta(days=i)) for i in range(6, -1, -1)]

    result = []
    for day in days:
        count = (
            db.query(func.count(Complaint.id))
            .filter(func.date(Complaint.created_at) == day)
            .scalar()
        )
        result.append(WeeklyData(day=day.strftime("%a"), count=count or 0))
    return result


class CategoryStat(BaseModel):
    category: str
    count:    int
    pct:      float


@router.get("/analytics/categories", response_model=list[CategoryStat])
def category_breakdown(
    db:    Session = Depends(get_db),
    _user: User    = Depends(require_admin),
):
    rows = (
        db.query(Complaint.category, func.count(Complaint.id).label("cnt"))
        .group_by(Complaint.category)
        .all()
    )
    total = sum(r.cnt for r in rows)
    return [
        CategoryStat(
            category=r.category,
            count=r.cnt,
            pct=round((r.cnt / total) * 100, 1) if total else 0,
        )
        for r in rows
    ]