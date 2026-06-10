from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.services.study_plan_service import generate_study_plan
from app.services.rag_service import chat_with_mentor

router = APIRouter(prefix="/study-plan", tags=["study_plan"])

class PlanRequest(BaseModel):
    weeks: int = 4

class MentorRequest(BaseModel):
    question: str

@router.post("/generate")
async def generate(
    req: PlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = await generate_study_plan(
        target_band=current_user.target_band or 7.0,
        current_level=current_user.current_level or 5.5,
        weak_skills=current_user.weak_skills or [],
        weeks=req.weeks
    )
    return plan

@router.post("/mentor")
async def mentor(
    req: MentorRequest,
    current_user: User = Depends(get_current_user)
):
    answer = await chat_with_mentor(
        question=req.question,
        user_performance={
            "target_band": current_user.target_band,
            "current_level": current_user.current_level,
            "weak_skills": current_user.weak_skills,
        }
    )
    return {"answer": answer}