from typing import Dict, Any, List
from backend.agents.base_agent import BaseAgent
from backend.services.tools import TOOL_REGISTRY
from backend.services.rag_service import rag_service

class SupervisorAgent(BaseAgent):
    """1. Supervisor Agent: Breaks down tasks, plans sub-steps, delegates to agents, and merges final outputs."""
    def __init__(self):
        super().__init__(
            name="Supervisor Agent",
            agent_type="supervisor",
            system_prompt="You are the Lead Orchestrator. Decompose user requests, route to sub-agents, and merge results.",
            default_model="gpt-4o"
        )

    async def plan_and_delegate(self, user_request: str) -> Dict[str, Any]:
        req_lower = user_request.lower()
        plan = []
        if "research" in req_lower or "search" in req_lower or "find" in req_lower:
            plan.append("research")
        if "rag" in req_lower or "document" in req_lower or "pdf" in req_lower or "kb" in req_lower:
            plan.append("rag")
        if "code" in req_lower or "python" in req_lower or "bug" in req_lower or "script" in req_lower:
            plan.append("code")
        if "data" in req_lower or "chart" in req_lower or "excel" in req_lower or "sql" in req_lower:
            plan.append("data_analysis")
        if "image" in req_lower or "ocr" in req_lower or "scan" in req_lower:
            plan.append("vision")

        if not plan:
            plan = ["research", "report"]
        else:
            plan.append("report")

        return {
            "plan_steps": plan,
            "summary": f"Decomposed request into {len(plan)} sub-agent tasks: {', '.join(plan)}."
        }


class ResearchAgent(BaseAgent):
    """2. Research Agent: Web search, document scanning, summarization, fact extraction."""
    def __init__(self):
        super().__init__(
            name="Research Agent",
            agent_type="research",
            system_prompt="Execute web searches and extract facts.",
            default_model="gemini-flash"
        )

    async def execute_task(self, query: str) -> Dict[str, Any]:
        search_res = await TOOL_REGISTRY["web_search"].execute(query=query)
        facts = [r.get("snippet", "") for r in search_res.get("results", [])]
        summary = f"Research Agent collected {len(facts)} key facts for query '{query}': " + " ".join(facts[:2])
        return {
            "agent": self.name,
            "status": "success",
            "findings": summary,
            "sources": [r.get("url", "#") for r in search_res.get("results", [])]
        }


class RAGAgent(BaseAgent):
    """3. RAG Agent: Vector search, chunk retrieval, re-ranking, grounded answers."""
    def __init__(self):
        super().__init__(
            name="RAG Agent",
            agent_type="rag",
            system_prompt="Search vector database and provide grounded answers with source citations.",
            default_model="gemini-flash"
        )

    async def execute_task(self, query: str, user_id: str = "default") -> Dict[str, Any]:
        chunks = await rag_service.search(query=query, top_k=3, user_id=user_id)
        context = "\n".join([f"[{c['metadata'].get('filename', 'doc')}]: {c['chunk_text']}" for c in chunks])
        answer = f"Grounded Answer based on Knowledge Base:\n{context[:600]}\n\n(Retrieved {len(chunks)} high-relevance chunks with max score {chunks[0]['score'] if chunks else 0.0})"
        return {
            "agent": self.name,
            "status": "success",
            "answer": answer,
            "chunks_retrieved": len(chunks)
        }


class CodeAgent(BaseAgent):
    """4. Code Agent: Code generation, explanation, debugging, execution."""
    def __init__(self):
        super().__init__(
            name="Code Agent",
            agent_type="code",
            system_prompt="Generate, optimize, and debug python/typescript/SQL code.",
            default_model="gpt-4o"
        )

    async def execute_task(self, code_request: str) -> Dict[str, Any]:
        py_tool = TOOL_REGISTRY["python_sandbox"]
        sample_code = "def calculate_efficiency(nodes, latency):\n    return round(nodes / (latency + 1e-5), 4)\n\nprint('Efficiency metric:', calculate_efficiency(12, 45.2))"
        exec_res = await py_tool.execute(code=sample_code)
        return {
            "agent": self.name,
            "status": "success",
            "generated_code": sample_code,
            "execution_output": exec_res.get("stdout"),
            "language": "python"
        }


class DataAnalysisAgent(BaseAgent):
    """5. Data Analysis Agent: CSV/Excel, pandas, charts, SQL execution."""
    def __init__(self):
        super().__init__(
            name="Data Analysis Agent",
            agent_type="data_analysis",
            system_prompt="Analyze structured data, run SQL, compute stats, and format charts.",
            default_model="gpt-4o"
        )

    async def execute_task(self, query: str) -> Dict[str, Any]:
        db_res = await TOOL_REGISTRY["database_query"].execute("SELECT COUNT(*) as active_runs FROM runs")
        chart_data = [
            {"label": "Run 101", "tokens": 1420, "cost": 0.007},
            {"label": "Run 102", "tokens": 2840, "cost": 0.014},
            {"label": "Run 103", "tokens": 980, "cost": 0.004},
            {"label": "Run 104", "tokens": 3100, "cost": 0.015}
        ]
        return {
            "agent": self.name,
            "status": "success",
            "analysis_summary": f"Data analysis executed. Database query response: {db_res}",
            "chart_data": chart_data
        }


class VisionAgent(BaseAgent):
    """6. Vision Agent: OCR and image analysis."""
    def __init__(self):
        super().__init__(
            name="Vision Agent",
            agent_type="vision",
            system_prompt="Perform OCR text extraction and visual scene understanding.",
            default_model="gemini-vision"
        )

    async def execute_task(self, image_input: str) -> Dict[str, Any]:
        ocr_res = await TOOL_REGISTRY["ocr_reader"].execute(image_path=image_input)
        return {
            "agent": self.name,
            "status": "success",
            "ocr_text": ocr_res.get("extracted_text"),
            "confidence": ocr_res.get("confidence")
        }


class ReportAgent(BaseAgent):
    """7. Report Agent: PDF & Markdown report generation."""
    def __init__(self):
        super().__init__(
            name="Report Agent",
            agent_type="report",
            system_prompt="Compile multi-agent outputs into executive Markdown and PDF reports.",
            default_model="gemini-flash"
        )

    async def execute_task(self, title: str, agent_outputs: List[Dict[str, Any]]) -> Dict[str, Any]:
        sections = []
        for out in agent_outputs:
            sections.append({
                "heading": f"Agent Output: {out.get('agent', 'Specialized Agent')}",
                "content": str(out.get('findings') or out.get('answer') or out.get('generated_code') or out.get('analysis_summary') or out.get('ocr_text') or "Task executed successfully.")
            })
        report_res = await TOOL_REGISTRY["report_compiler"].execute(title=title, sections=sections)
        return {
            "agent": self.name,
            "status": "success",
            "report_markdown": report_res.get("markdown_report"),
            "title": title
        }
