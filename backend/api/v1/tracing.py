from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from backend.database.session import get_db
from backend.models.domain import Run, ToolCallRecord, User
from backend.schemas.domain import RunSchema
from backend.api.deps import get_current_user

router = APIRouter(prefix="/tracing", tags=["Observability & Tracing"])

@router.get("/runs", response_model=List[RunSchema])
async def list_runs(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Run)
        .options(selectinload(Run.tool_calls))
        .where(Run.user_id == user.id)
        .order_by(Run.created_at.desc())
        .limit(50)
    )
    return list(res.scalars().all())

@router.get("/runs/{run_id}", response_model=RunSchema)
async def get_run_details(run_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Run)
        .options(selectinload(Run.tool_calls))
        .where(Run.id == run_id, Run.user_id == user.id)
    )
    run_rec = res.scalar_one_or_none()
    if not run_rec:
        raise HTTPException(status_code=404, detail="Run trace not found.")
    return run_rec

@router.get("/analytics")
async def get_tracing_analytics(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Run).where(Run.user_id == user.id))
    runs = list(res.scalars().all())
    
    total_runs = len(runs)
    total_tokens = sum(r.total_tokens for r in runs)
    total_cost = sum(r.total_cost for r in runs)
    avg_latency = (sum(r.duration_ms for r in runs) / total_runs) if total_runs > 0 else 0.0

    return {
        "total_runs": total_runs,
        "total_tokens": total_tokens,
        "total_cost_usd": round(total_cost, 4),
        "avg_latency_ms": round(avg_latency, 2),
        "active_models": ["gemini-flash", "gpt-4o", "gemini-vision", "ollama-local"]
    }
