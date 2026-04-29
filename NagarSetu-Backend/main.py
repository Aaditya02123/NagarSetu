import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
from app.models import user, complaint  # noqa: F401
from app.routers import auth, complaints, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    print("✅  Database tables ready")
    yield
    print("👋  Shutting down")


app = FastAPI(
    title="NagarSetu API",
    description="Backend for the NagarSetu civic issue reporting platform",
    version="1.0.0",
    lifespan=lifespan,
)

print(f"🌐 CORS origin: {settings.FRONTEND_URL}")

# ── CORS must be registered FIRST before any other middleware ─────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ── Inject base URL ───────────────────────────────────────────────────────────
@app.middleware("http")
async def inject_base_url(request: Request, call_next):
    request.state.base_url = str(request.base_url)
    response = await call_next(request)
    return response

# ── Static files ──────────────────────────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(admin.router)

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "nagarsetu-api"}


# ── Public stats (used by landing page Stats.jsx — no auth required) ──────────
@app.get("/api/stats", tags=["Public"])
def public_stats(db=None):
    from app.core.database import get_db
    from app.models.complaint import Complaint, ComplaintStatus
    from app.models.user import User
    from sqlalchemy import func
    from fastapi import Depends
    # Inline DB call — avoids dependency injection outside route context
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        total    = db.query(func.count(Complaint.id)).scalar() or 0
        resolved = db.query(func.count(Complaint.id)).filter(
            Complaint.status == ComplaintStatus.resolved
        ).scalar() or 0
        departments = db.query(Complaint.assigned_to).filter(
            Complaint.assigned_to.isnot(None)
        ).distinct().count()
    finally:
        db.close()
    return {
        "total":       total,
        "resolved":    resolved,
        "departments": departments,
        "monitoring":  "24/7",
    }