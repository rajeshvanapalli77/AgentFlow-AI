from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from backend.database.session import get_db
from backend.models.domain import Document, User
from backend.schemas.domain import DocumentResponse, SearchQueryRequest, SearchChunkResult
from backend.api.deps import get_current_user
from backend.services.rag_service import rag_service

router = APIRouter(prefix="/documents", tags=["Documents & RAG"])

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    contents = await file.read()
    ingest_result = await rag_service.ingest_document(
        user_id=user.id,
        filename=file.filename,
        file_bytes=contents,
        file_type=file.content_type or "application/octet-stream"
    )
    
    res = await db.execute(select(Document).where(Document.id == ingest_result["document_id"]))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=500, detail="Failed to save document record.")
    return doc

@router.get("", response_model=List[DocumentResponse])
async def list_documents(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Document).where(Document.user_id == user.id).order_by(Document.created_at.desc()))
    return list(res.scalars().all())

@router.post("/search")
async def search_documents(data: SearchQueryRequest, user: User = Depends(get_current_user)):
    results = await rag_service.search(query=data.query, top_k=data.top_k, user_id=user.id)
    return {"query": data.query, "results": results}
