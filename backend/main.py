from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, writing, speaking, reading, study_plan, progress
from app.core.database import engine, Base

app = FastAPI(title="IELTS AI Coach API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://ielts-ai-coach.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(writing.router)
app.include_router(speaking.router)
app.include_router(reading.router)
app.include_router(study_plan.router)
app.include_router(progress.router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
async def health():
    return {"status": "ok"}