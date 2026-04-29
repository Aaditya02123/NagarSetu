"""
Auth routes — registration and login.
Both match exactly what Login.jsx and Register.jsx send.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.middleware.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.user import RegisterRequest, LoginRequest, TokenResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register.jsx sends:
      { first_name, last_name, email, phone, password }
    Role is always forced to citizen — no client can escalate their own role.
    """
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    if len(body.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters."
        )

    user = User(
        first_name    = body.first_name,
        last_name     = body.last_name,
        email         = body.email,
        phone         = body.phone,
        password_hash = hash_password(body.password),
        role          = UserRole.citizen,   # always forced, never trusted from client
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Login.jsx sends: { email, password }
    No role is sent or checked — the token carries the role after login.
    Admin accounts can only access /admin via token role check there.
    """
    user = db.query(User).filter(User.email == body.email).first()

    # Deliberate: same error for wrong email OR wrong password
    # Never reveal which one failed
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="This account has been deactivated."
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Returns the currently logged-in user's profile."""
    return current_user

@router.get("/public-stats")
def public_stats(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == UserRole.citizen, User.is_active == True).order_by(User.created_at.desc()).limit(3).all()
    total = db.query(func.count(User.id)).filter(User.role == UserRole.citizen).scalar()
    return {
        "total": total,
        "previews": [{"initials": f"{u.first_name[0]}{u.last_name[0]}".upper()} for u in users]
    }