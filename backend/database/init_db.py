import asyncio
from sqlalchemy import select
from backend.database.session import AsyncSessionLocal, init_tables
from backend.models.domain import AgentRecord

DEFAULT_AGENTS = [
    {
        "name": "Supervisor Agent",
        "agent_type": "supervisor",
        "description": "Analyzes complex requests, breaks tasks into sub-plans, delegates to specialized agents, and merges final outputs.",
        "system_prompt": "You are the Lead Orchestrator and Supervisor Agent. Your duty is to plan execution workflows, break down tasks, delegate to sub-agents, and synthesize clean conclusions.",
        "default_model": "gpt-4o",
        "capabilities_json": {"planning": True, "delegation": True, "merging": True}
    },
    {
        "name": "Research Agent",
        "agent_type": "research",
        "description": "Performs web searches, reads documents, synthesizes facts, and summarizes findings.",
        "system_prompt": "You are a Research Agent specializing in factual gathering, web search execution, document scanning, and structured summarization.",
        "default_model": "gemini-flash",
        "capabilities_json": {"web_search": True, "fact_extraction": True, "summarization": True}
    },
    {
        "name": "RAG Agent",
        "agent_type": "rag",
        "description": "Queries vector databases, retrieves semantic document chunks, re-ranks context, and generates grounded answers.",
        "system_prompt": "You are a RAG (Retrieval-Augmented Generation) Specialist. Search vector stores, evaluate document chunk relevance, and generate grounded answers with source citations.",
        "default_model": "gemini-flash",
        "capabilities_json": {"vector_search": True, "reranking": True, "grounded_qa": True}
    },
    {
        "name": "Code Agent",
        "agent_type": "code",
        "description": "Generates, reviews, executes, and debugs code across Python, TypeScript, SQL, and bash.",
        "system_prompt": "You are a Senior Software Engineer Code Agent. Write clean, idiomatic code, explain logic, and debug runtime exceptions.",
        "default_model": "gpt-4o",
        "capabilities_json": {"code_generation": True, "code_execution": True, "debugging": True}
    },
    {
        "name": "Data Analysis Agent",
        "agent_type": "data_analysis",
        "description": "Processes CSV/Excel files, executes SQL queries, computes data analytics, and generates chart metadata.",
        "system_prompt": "You are a Principal Data Scientist and Analytics Agent. Perform tabular statistics, execute SQL, and format data for charts.",
        "default_model": "gpt-4o",
        "capabilities_json": {"csv_excel": True, "sql_execution": True, "charts": True}
    },
    {
        "name": "Vision Agent",
        "agent_type": "vision",
        "description": "Performs Optical Character Recognition (OCR) and high-dimensional image analysis.",
        "system_prompt": "You are an Expert Computer Vision Agent. Analyze image content, read text via OCR, and extract visual context.",
        "default_model": "gemini-vision",
        "capabilities_json": {"ocr": True, "image_analysis": True}
    },
    {
        "name": "Report Agent",
        "agent_type": "report",
        "description": "Synthesizes detailed technical research, data analysis, and code into structured Markdown and PDF reports.",
        "system_prompt": "You are an Enterprise Technical Writer and Report Generator. Format information into executive Markdown summaries and PDF documents.",
        "default_model": "gemini-flash",
        "capabilities_json": {"markdown_reports": True, "pdf_generation": True}
    }
]

async def seed_data():
    await init_tables()
    async with AsyncSessionLocal() as session:
        # Seed default admin user
        result = await sessio        # Seed default agents
        for ag in DEFAULT_AGENTS:
            res = await session.execute(select(AgentRecord).where(AgentRecord.name == ag["name"]))
            existing = res.scalar_one_or_none()
            if not existing:
                record = AgentRecord(
                    name=ag["name"],
                    agent_type=ag["agent_type"],
                    description=ag["description"],
                    system_prompt=ag["system_prompt"],
                    default_model=ag["default_model"],
                    capabilities_json=ag["capabilities_json"]
                )
                session.add(record)
        await session.commit()
        print("--> Seeded 7 default AI Agents into DB.")

if __name__ == "__main__":
    asyncio.run(seed_data())
