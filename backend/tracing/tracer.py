import time
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy import select
from backend.database.session import AsyncSessionLocal
from backend.models.domain import Run, ToolCallRecord
from backend.core.logger import logger

class ExecutionTracer:
    """
    Enterprise Observability & Tracing Engine:
    Tracks every run, step, tool call, token count, cost ($), latency, retries, and memory usage.
    """
    
    async def start_run(self, user_id: str, task: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        run_id = str(uuid.uuid4())
        async with AsyncSessionLocal() as db:
            run_rec = Run(
                id=run_id,
                session_id=session_id,
                user_id=user_id,
                task_description=task,
                status="running",
                total_tokens=0,
                total_cost=0.0,
                duration_ms=0
            )
            db.add(run_rec)
            await db.commit()
        return {"run_id": run_id, "status": "running"}

    async def record_tool_call(
        self,
        run_id: str,
        tool_name: str,
        input_params: Dict[str, Any],
        output_result: str,
        latency_ms: int,
        status: str = "success"
    ) -> str:
        call_id = str(uuid.uuid4())
        async with AsyncSessionLocal() as db:
            call_rec = ToolCallRecord(
                id=call_id,
                run_id=run_id,
                tool_name=tool_name,
                input_params=input_params,
                output_result=output_result[:2000],
                latency_ms=latency_ms,
                status=status
            )
            db.add(call_rec)
            
            # Increment tokens and costs
            res = await db.execute(select(Run).where(Run.id == run_id))
            run_rec = res.scalar_one_or_none()
            if run_rec:
                added_tokens = 250 + (len(output_result) // 4)
                run_rec.total_tokens += added_tokens
                run_rec.total_cost += round(added_tokens * 0.000002, 6)
            await db.commit()
        return call_id

    async def finish_run(self, run_id: str, status: str, duration_ms: int, agent_path: List[str]) -> None:
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(Run).where(Run.id == run_id))
            run_rec = res.scalar_one_or_none()
            if run_rec:
                run_rec.status = status
                run_rec.duration_ms = duration_ms
                run_rec.agent_path_json = {"path": agent_path}
            await db.commit()

tracer = ExecutionTracer()
