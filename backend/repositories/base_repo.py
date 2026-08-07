from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from backend.models.domain import User, ChatSession, Message, Document, AgentRecord, Run, ToolCallRecord, EvaluationRecord, Memory, Setting

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> Optional[User]:
        res = await self.db.execute(select(User).where(User.email == email))
        return res.scalar_one_or_none()

    async def get_by_id(self, user_id: str) -> Optional[User]:
        res = await self.db.execute(select(User).where(User.id == user_id))
        return res.scalar_one_or_none()

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user


class RunRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_run(self, run: Run) -> Run:
        self.db.add(run)
        await self.db.commit()
        await self.db.refresh(run)
        return run

    async def get_run(self, run_id: str) -> Optional[Run]:
        res = await self.db.execute(select(Run).where(Run.id == run_id))
        return res.scalar_one_or_none()

    async def list_user_runs(self, user_id: str, limit: int = 50) -> List[Run]:
        res = await self.db.execute(select(Run).where(Run.user_id == user_id).order_by(Run.created_at.desc()).limit(limit))
        return list(res.scalars().all())

    async def add_tool_call(self, tool_call: ToolCallRecord) -> ToolCallRecord:
        self.db.add(tool_call)
        await self.db.commit()
        await self.db.refresh(tool_call)
        return tool_call


class MemoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_memory(self, memory: Memory) -> Memory:
        self.db.add(memory)
        await self.db.commit()
        await self.db.refresh(memory)
        return memory

    async def get_user_memories(self, user_id: str, memory_type: Optional[str] = None) -> List[Memory]:
        stmt = select(Memory).where(Memory.user_id == user_id)
        if memory_type:
            stmt = stmt.where(Memory.memory_type == memory_type)
        res = await self.db.execute(stmt.order_by(Memory.created_at.desc()))
        return list(res.scalars().all())
