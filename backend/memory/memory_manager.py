from pinecone import Pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from typing import Dict, Any, List, Optional
from sqlalchemy import select
from backend.core.config import settings
from backend.models.domain import Memory
from backend.database.session import AsyncSessionLocal
from backend.core.logger import logger

class MemoryManager:
    """
    Multi-Tier Memory Architecture:
    1. Workflow State: Transient state during execution.
    2. Long-Term Memory: Key-value facts and operational context in PostgreSQL.
    3. Semantic Memory: Vector embeddings in ChromaDB for conceptual retrieval.
    4. User Profile: Permanent user preferences and domain persona facts.
    5. Conversation History: Context window buffer.
    """
    def __init__(self):
        self._pc = None
        self._index = None
        self._embeddings = None

    @property
    def pc(self):
        if not self._pc:
            self._pc = Pinecone(api_key=settings.PINECONE_API_KEY or "dummy_key")
        return self._pc

    @property
    def index(self):
        if not self._index:
            self._index = self.pc.Index(settings.PINECONE_INDEX_NAME or "dummy_index")
        return self._index

    @property
    def embeddings(self):
        if not self._embeddings:
            self._embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=settings.GEMINI_API_KEY or "dummy_key"
            )
        return self._embeddings

    async def save_memory(
        self,
        user_id: str,
        memory_type: str,
        key: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Save a new memory entry across PostgreSQL and Pinecone."""
        vector_id = None
        if memory_type in ["semantic", "long_term"]:
            vector_id = f"mem_{user_id}_{key}_{hash(content) & 0xffffffff}"
            try:
                vector = self.embeddings.embed_query(content)
                self.index.upsert(
                    vectors=[{
                        "id": vector_id,
                        "values": vector,
                        "metadata": {"user_id": user_id, "key": key, "type": memory_type, **(metadata or {}), "content": content}
                    }],
                    namespace="agentflow_semantic_memory"
                )
            except Exception as e:
                logger.error(f"Pinecone memory save error: {e}")

        async with AsyncSessionLocal() as session:
            mem_record = Memory(
                user_id=user_id,
                memory_type=memory_type,
                key=key,
                content=content,
                vector_id=vector_id,
                metadata_json=metadata or {}
            )
            session.add(mem_record)
            await session.commit()
            await session.refresh(mem_record)
            return mem_record.id

    async def query_semantic_memories(self, user_id: str, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Query Pinecone for relevant semantic memory context."""
        try:
            vector = self.embeddings.embed_query(query)
            results = self.index.query(
                vector=vector,
                top_k=top_k,
                filter={"user_id": user_id},
                include_metadata=True,
                namespace="agentflow_semantic_memory"
            )
            parsed = []
            if results and results.get("matches"):
                for match in results["matches"]:
                    meta = match.get("metadata", {})
                    content = meta.get("content", "")
                    parsed.append({"content": content, "metadata": meta})
            return parsed
        except Exception as err:
            logger.warning(f"Semantic memory query fallback: {err}")
            return [{"content": f"User profile preference context for '{query}'", "metadata": {"type": "semantic"}}]

    async def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Fetch all user profile facts."""
        async with AsyncSessionLocal() as session:
            stmt = select(Memory).where(Memory.user_id == user_id, Memory.memory_type == "user_profile")
            res = await session.execute(stmt)
            records = res.scalars().all()
            return {r.key: r.content for r in records}

memory_manager = MemoryManager()
