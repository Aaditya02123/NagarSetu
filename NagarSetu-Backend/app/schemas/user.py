from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import UserRole


# ── Request bodies ────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    first_name: str
    last_name:  str
    email:      EmailStr
    phone:      str | None = None
    password:   str
    # role is intentionally absent — always forced to citizen in the router


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str
    # role is intentionally absent — role is read from DB, not trusted from client


# ── Response bodies ───────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id:         int
    first_name: str
    last_name:  str
    email:      str
    phone:      str | None
    role:       UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut