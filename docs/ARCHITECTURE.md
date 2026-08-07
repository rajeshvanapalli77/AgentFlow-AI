# AgentFlow AI - Production Architecture Guide

AgentFlow AI is an enterprise-grade agentic AI platform designed with Clean Architecture principles.

```
[ Frontend: React + TypeScript + TailwindCSS ]
                     │
                     ▼
[ FastAPI Backend REST API Gateway (v1) ]
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
[ Auth & RBAC ]  [ Dynamic LLM ] [ Tracing & Eval ]
                  Router Engine   Engine
                     │
                     ▼
   [ LangGraph Multi-Agent Orchestrator ]
                     │
   ┌───────┬─────────┼─────────┬───────┐
   ▼       ▼         ▼         ▼       ▼
[Supervisor] [Research] [RAG] [Code] [Data/Vision]
   │       │         │         │       │
   └───────┴─────────┼─────────┴───────┘
                     ▼
            [ 12 Tool APIs ]
                     │
   ┌─────────────────┴─────────────────┐
   ▼                                   ▼
[ PostgreSQL DB ]               [ ChromaDB Vector Store ]
(Users, Runs, Logs,             (RAG Embeddings &
 Memories, Settings)            Semantic Memories)
```

## System Layers
1. **API Gateway Layer**: FastAPI endpoints with Pydantic schema validation, JWT auth, and RBAC permissions.
2. **Orchestrator Layer**: LangGraph state graph managing Supervisor planning, sub-agent execution nodes, retries, fallbacks, checkpoints, and Human-in-the-Loop approval.
3. **Multi-Agent Engine**: 7 specialized agents (Supervisor, Research, RAG, Code, Data Analysis, Vision, Report Agent).
4. **Dynamic LLM Router**: Classifies request complexity and routes to Gemini Flash, GPT-4o, Gemini Vision, or Ollama.
5. **Multi-Tier Memory**: Workflow state, Postgres long-term facts, ChromaDB semantic embeddings, User profile.
6. **Observability**: Execution tracer tracking token usage, latency (ms), tool call traces, and cost ($USD).
