from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.models.domain import User
from backend.api.deps import get_current_user
from backend.agents.specialized_agents import ResearchAgent, ReportAgent

router = APIRouter(prefix="/research", tags=["Deep Research"])

class ResearchRequest(BaseModel):
    topic: str
    depth: str = "deep"  # quick, standard, deep

@router.post("/execute")
async def execute_deep_research(data: ResearchRequest, user: User = Depends(get_current_user)):
    research_agent = ResearchAgent()
    report_agent = ReportAgent()

    findings = await research_agent.execute_task(query=data.topic)
    report = await report_agent.execute_task(
        title=f"Deep Research Report: {data.topic}",
        agent_outputs=[findings]
    )

    return {
        "topic": data.topic,
        "depth": data.depth,
        "findings": findings,
        "markdown_report": report.get("report_markdown"),
        "status": "completed"
    }
