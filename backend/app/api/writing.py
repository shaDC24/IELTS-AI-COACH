from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.evaluation import WritingEvaluation
from app.services.writing_service import evaluate_writing

router = APIRouter(prefix="/writing", tags=["writing"])

class WritingRequest(BaseModel):
    essay: str
    task_type: str = "task2"  # "task1" or "task2"

@router.post("/evaluate")
async def evaluate(
    req: WritingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await evaluate_writing(req.essay, req.task_type)

    eval_record = WritingEvaluation(
        user_id=current_user.id,
        task_type=req.task_type,
        essay=req.essay,
        task_response=result["task_response"],
        coherence=result["coherence_cohesion"],
        lexical_resource=result["lexical_resource"],
        grammar=result["grammatical_range"],
        overall_band=result["overall_band"],
        feedback=result,
        improved_essay=result.get("improved_essay")
    )
    db.add(eval_record)
    await db.commit()
    return result