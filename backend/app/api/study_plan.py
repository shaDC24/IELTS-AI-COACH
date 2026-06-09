from fastapi import APIRouter
router = APIRouter(prefix="/study-plan", tags=["study_plan"])

@router.get("/ping")
async def ping():
    return {"status": "coming soon"}