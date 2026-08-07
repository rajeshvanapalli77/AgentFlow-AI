# AgentFlow AI - API Documentation

Base URL: `http://localhost:8000/api/v1`

## Interactive Swagger & ReDoc
- **Swagger UI**: `http://localhost:8000/api/v1/docs`
- **ReDoc**: `http://localhost:8000/api/v1/redoc`

## Key API Routes

### 1. Authentication (`/auth`)
- `POST /auth/register`: Register user (`email`, `password`, `full_name`, `role`).
- `POST /auth/login`: Authenticate & return JWT token.
- `GET /auth/me`: Get current user details.

### 2. Multi-Agent Chat & Orchestration (`/chat`)
- `POST /chat/sessions`: Create new agent session.
- `GET /chat/sessions`: List user sessions.
- `GET /chat/sessions/{session_id}/messages`: Fetch session message history.
- `POST /chat/execute`: Trigger LangGraph Multi-Agent execution.
  - Body: `{"message": "Task...", "session_id": "...", "require_approval": false}`

### 3. RAG & Document Storage (`/documents`)
- `POST /documents/upload`: Upload PDF, DOCX, TXT, MD file to RAG vector store.
- `GET /documents`: List indexed documents.
- `POST /documents/search`: Query vector embeddings in ChromaDB.

### 4. Deep Research (`/research`)
- `POST /research/execute`: Trigger Research & Report agents for deep web research.

### 5. Multi-Tier Memory (`/memory`)
- `POST /memory`: Store memory entry (semantic, long_term, user_profile, workflow).
- `GET /memory`: List user memories.
- `GET /memory/semantic/search`: Query semantic memory vectors.

### 6. Observability & Tracing (`/tracing`)
- `GET /tracing/runs`: List trace execution logs.
- `GET /tracing/runs/{run_id}`: Fetch detailed tool call logs and latency.
- `GET /tracing/analytics`: Get aggregated token usage and cost metrics.

### 7. AI Evaluation (`/evaluation`)
- `GET /evaluation/metrics`: Fetch answer quality, retrieval quality, groundedness, and hallucination scores.
