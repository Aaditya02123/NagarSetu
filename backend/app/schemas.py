from pydantic import BaseModel, constr

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    phone: constr(pattern=r'^\d{10}$')