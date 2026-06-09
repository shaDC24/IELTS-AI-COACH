from fastapi import APIRouter
router = APIRouter(prefix="/reading", tags=["reading"])

@router.get("/ping")
async def ping():
    return {"status": "coming soon"}