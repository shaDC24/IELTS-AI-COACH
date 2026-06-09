from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.evaluation import SpeakingEvaluation
from app.services.speaking_service import transcribe_audio, evaluate_speaking
import random

router = APIRouter(prefix="/speaking", tags=["speaking"])

IELTS_QUESTIONS = [
    "Tell me about your hometown.",
    "Describe a person who has influenced you greatly.",
    "Talk about a skill you would like to learn.",
    "Describe a memorable journey you have taken.",
    "Talk about your favourite season and why you like it.",
    "Describe a time when you helped someone.",
    "Talk about a book or film that impressed you.",
    "Describe your ideal job.",
]

@router.get("/question")
async def get_question():
    return {"question": random.choice(IELTS_QUESTIONS)}

@router.post("/evaluate")
async def evaluate(
    audio: UploadFile = File(...),
    question: str = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    audio_bytes = await audio.read()
    transcript = await transcribe_audio(audio_bytes, audio.filename or "audio.webm")
    result = await evaluate_speaking(transcript, question)

    eval_record = SpeakingEvaluation(
        user_id=current_user.id,
        question=question,
        transcript=transcript,
        fluency=result["fluency_coherence"],
        grammar=result["grammatical_range"],
        vocabulary=result["lexical_resource"],
        pronunciation=result["pronunciation"],
        overall_band=result["overall_band"],
        feedback=result
    )
    db.add(eval_record)
    await db.commit()
    return {**result, "transcript": transcript}