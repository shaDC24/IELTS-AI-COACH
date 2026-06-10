from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.evaluation import WritingEvaluation, SpeakingEvaluation

router = APIRouter(prefix="/progress", tags=["progress"])

@router.get("/summary")
async def get_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    writing_result = await db.execute(
        select(WritingEvaluation)
        .where(WritingEvaluation.user_id == current_user.id)
        .order_by(WritingEvaluation.created_at.desc())
        .limit(10)
    )
    writings = writing_result.scalars().all()

    speaking_result = await db.execute(
        select(SpeakingEvaluation)
        .where(SpeakingEvaluation.user_id == current_user.id)
        .order_by(SpeakingEvaluation.created_at.desc())
        .limit(10)
    )
    speakings = speaking_result.scalars().all()

    return {
        "writing_scores": [
            {
                "date": str(w.created_at.date()),
                "overall": w.overall_band,
                "task_response": w.task_response,
                "coherence": w.coherence,
                "lexical": w.lexical_resource,
                "grammar": w.grammar,
            }
            for w in reversed(writings)
        ],
        "speaking_scores": [
            {
                "date": str(s.created_at.date()),
                "overall": s.overall_band,
                "fluency": s.fluency,
                "vocabulary": s.vocabulary,
                "grammar": s.grammar,
                "pronunciation": s.pronunciation,
            }
            for s in reversed(speakings)
        ],
        "total_writing_sessions": len(writings),
        "total_speaking_sessions": len(speakings),
        "avg_writing_band": round(sum(w.overall_band for w in writings) / len(writings), 1) if writings else 0,
        "avg_speaking_band": round(sum(s.overall_band for s in speakings) / len(speakings), 1) if speakings else 0,
    }