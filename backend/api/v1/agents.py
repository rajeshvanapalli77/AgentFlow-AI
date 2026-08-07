from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from backend.database.session import get_db
from backend.models.domain import AgentRecord, User
from backend.schemas.domain import AgentSchema
from backend.api.deps import get_current_user

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("", response_model=List[AgentSchema])
async def list_agents(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(AgentRecord).where(AgentRecord.is_active == True))
    return list(res.scalars().all())
