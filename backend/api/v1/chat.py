from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from backend.database.session import get_db
from backend.models.domain import User, ChatSession, Message
from backend.schemas.domain import ChatRequest, SessionCreate, SessionResponse, MessageResponse
from backend.api.deps import get_current_user
from backend.orchestrator.graph import orchestrator
from backend.evaluation.evaluator import evaluation_engine

router = APIRouter(prefix="/chat", tags=["Chat & Multi-Agent Operations"])

@router.post("/sessions", response_model=SessionResponse)
async def create_session(data: SessionCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    sess = ChatSession(user_id=user.id, title=data.title or "Agent Worksession")
    db.add(sess)
    await db.commit()
    await db.refresh(sess)
    return sess

@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ChatSession).where(ChatSession.user_id == user.id).order_by(ChatSession.created_at.desc()))
    return list(res.scalars().all())

@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
async def list_messages(session_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Message).where(Message.session_id == session_id).order_by(Message.created_at.asc()))
    return list(res.scalars().all())

@router.post("/execute")
async def execute_chat(data: ChatRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    session_id = data.session_id
    if not session_id:
        sess = ChatSession(user_id=user.id, title=f"Task: {data.message[:30]}")
        db.add(sess)
        await db.commit()
        await db.refresh(sess)
        session_id = sess.id

    # 1. Save user message
    user_msg = Message(
        session_id=session_id,
        sender="user",
        content=data.message
    )
    db.add(user_msg)
    await db.commit()

    # 2. Run LangGraph Multi-Agent Orchestrator
    orchestration_result = await orchestrator.execute_workflow(
        task=data.message,
        user_id=user.id,
        session_id=session_id,
        require_approval=data.require_approval or False
    )

    final_content = orchestration_result.get("final_output") or orchestration_result.get("message") or "Workflow executed."

    # 3. Save agent output message
    agent_msg = Message(
        session_id=session_id,
        sender="supervisor",
        agent_name="Supervisor Agent",
        content=final_content,
        metadata_json={
            "run_id": orchestration_result.get("run_id"),
            "agent_path": orchestration_result.get("agent_path"),
            "plan": orchestration_result.get("plan"),
            "status": orchestration_result.get("status")
        }
    )
    db.add(agent_msg)
    await db.commit()
    await db.refresh(agent_msg)

    # 4. Trigger auto-evaluation in background
    if orchestration_result.get("run_id"):
        await evaluation_engine.evaluate_run(
            run_id=orchestration_result["run_id"],
            question=data.message,
            answer=final_content
        )

    return {
        "session_id": session_id,
        "message_id": agent_msg.id,
        "run_id": orchestration_result.get("run_id"),
        "status": orchestration_result.get("status"),
        "agent_path": orchestration_result.get("agent_path"),
        "response": final_content,
        "agent_outputs": orchestration_result.get("agent_outputs")
    }
