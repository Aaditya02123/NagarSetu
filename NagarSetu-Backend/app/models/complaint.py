import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, Text, Enum, DateTime,
    ForeignKey, Boolean, Float
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ComplaintStatus(str, enum.Enum):
    pending    = "pending"
    inprogress = "inprogress"
    resolved   = "resolved"
    rejected   = "rejected"


class ComplaintPriority(str, enum.Enum):
    Low    = "Low"
    Medium = "Medium"
    High   = "High"


class ComplaintCategory(str, enum.Enum):
    Pothole        = "Pothole"
    Waterlogging   = "Waterlogging"
    Garbage        = "Garbage"
    StreetLight    = "Street Light"
    Traffic        = "Traffic"
    Infrastructure = "Infrastructure"
    Other          = "Other"


class Complaint(Base):
    __tablename__ = "complaints"

    id            = Column(Integer, primary_key=True, index=True)

    # Human-readable ID shown in UI e.g. "NS-001"
    complaint_ref = Column(String(20), unique=True, index=True, nullable=False)

    title         = Column(String(255), nullable=False)
    description   = Column(Text, nullable=False)
    category      = Column(Enum(ComplaintCategory), nullable=False)
    location      = Column(String(255), nullable=True)
    city          = Column(String(100), nullable=True)

    # File path relative to UPLOAD_DIR, e.g. "2024/03/abc123.jpg"
    image_path    = Column(String(500), nullable=True)

    status        = Column(Enum(ComplaintStatus), default=ComplaintStatus.pending, nullable=False)
    priority      = Column(Enum(ComplaintPriority), default=ComplaintPriority.Medium, nullable=False)

    # Department the complaint is routed to (free text for now)
    assigned_to   = Column(String(200), nullable=True)

    # Reason shown when status = rejected
    reject_reason = Column(Text, nullable=True)

    # ── AI fields ─────────────────────────────────────────────────────────────
    # Confidence score from the ONNX model (0.0 – 1.0)
    ai_confidence  = Column(Float, nullable=True)

    # Severity score computed by step7_severity_engine (0.0 – 1.0)
    ai_severity    = Column(Float, nullable=True)

    # Raw predicted class from AI e.g. "Garbage" (may differ from citizen-selected category)
    ai_label       = Column(String(100), nullable=True)

    # True when AI confidence < 0.70 — admin should manually verify
    needs_review   = Column(Boolean, default=False, nullable=False)

    # FK to User who filed it
    citizen_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    citizen       = relationship("User", foreign_keys=[citizen_id])

    created_at    = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at    = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Complaint {self.complaint_ref} status={self.status}>"