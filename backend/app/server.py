from fastapi import FastAPI
from app.database import engine, Base
import app.models  # IMPORTANT → registers models
from app.routes import router

app = FastAPI(title="NagarSetu Backend")

# Create tables automatically
Base.metadata.create_all(bind=engine)

app.include_router(router)

@app.get("/")
def health_check():
    return {"message": "NagarSetu Backend Running 🚀"}