import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    role: str
    full_name: str

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime.datetime

# Session & Message Schemas
class SessionCreate(BaseModel):
    title: Optional[str] = "New Agent Worksession"

class SessionResponse(BaseModel):
    id: str
    title: str
    user_id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

class MessageResponse(BaseModel):
    id: str
    session_id: str
    sender: str
    agent_name: Optional[str] = None
    content: str
    tool_calls_json: Optional[Dict[str, Any]] = None
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime.datetime

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    model_override: Optional[str] = None
    selected_agent: Optional[str] = "supervisor"
    enable_web_search: Optional[bool] = True
    enable_rag: Optional[bool] = True
    require_approval: Optional[bool] = False

# Agent Schemas
class AgentSchema(BaseModel):
    id: str
    name: str
    agent_type: str
    description: str
    system_prompt: str
    default_model: str
    capabilities_json: Optional[Dict[str, Any]] = None
    is_active: bool

# Document & RAG Schemas
class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    chunk_count: int
    status: str
    created_at: datetime.datetime

class SearchQueryRequest(BaseModel):
    query: str
    top_k: int = 5

class SearchChunkResult(BaseModel):
    chunk_id: str
    document_id: str
    chunk_text: str
    score: float
    metadata: Dict[str, Any]

# Tracing & Run Schemas
class ToolCallSchema(BaseModel):
    id: str
    run_id: str
    tool_name: str
    input_params: Optional[Dict[str, Any]]
    output_result: Optional[str]
    latency_ms: int
    status: str
    created_at: datetime.datetime

class RunSchema(BaseModel):
    id: str
    session_id: Optional[str]
    user_id: str
    task_description: str
    status: str
    total_tokens: int
    total_cost: float
    duration_ms: int
    agent_path_json: Optional[Dict[str, Any]]
    created_at: datetime.datetime
    tool_calls: List[ToolCallSchema] = []

# Evaluation Schemas
class EvaluationSchema(BaseModel):
    id: str
    run_id: str
    answer_quality: float
    retrieval_quality: float
    hallucination_score: float
    groundedness_score: float
    tool_accuracy: float
    feedback_notes: Optional[str]
    created_at: datetime.datetime

# Memory Schemas
class MemoryCreate(BaseModel):
    memory_type: str  # workflow, long_term, user_profile, semantic
    key: str
    content: str
    metadata_json: Optional[Dict[str, Any]] = None

class MemorySchema(BaseModel):
    id: str
    user_id: str
    memory_type: str
    key: str
    content: str
    vector_id: Optional[str]
    metadata_json: Optional[Dict[str, Any]]
    created_at: datetime.datetime

# Settings Schema
class SettingUpdate(BaseModel):
    setting_key: str
    setting_value: str
