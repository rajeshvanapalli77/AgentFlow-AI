from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from backend.database.session import get_db
from backend.models.domain import Memory, User
from backend.schemas.domain import MemoryCreate, MemorySchema
from backend.api.deps import get_current_user
from backend.memory.memory_manager import memory_manager

router = APIRouter(prefix="/memory", tags=["Memory Management"])

@router.post("", response_model=MemorySchema)
async def create_memory(data: MemoryCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    mem_id = await memory_manager.save_memory(
        user_id=user.id,
        memory_type=data.memory_type,
        key=data.key,
        content=data.content,
        metadata=data.metadata_json
    )
    res = await db.execute(select(Memory).where(Memory.id == mem_id))
    return res.scalar_one()

@router.get("", response_model=List[MemorySchema])
async def list_memories(
    memory_type: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Memory).where(Memory.user_id == user.id)
    if memory_type:
        stmt = stmt.where(Memory.memory_type == memory_type)
    res = await db.execute(stmt.order_by(Memory.created_at.desc()))
    return list(res.scalars().all())

@router.get("/semantic/search")
async def semantic_memory_search(query: str, user: User = Depends(get_current_user)):
    results = await memory_manager.query_semantic_memories(user_id=user.id, query=query)
    return {"query": query, "results": results}
