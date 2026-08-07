from typing import Dict, Any, List, Optional
import time
from backend.models_router.router import model_router
from backend.services.tools import TOOL_REGISTRY
from backend.core.logger import logger

class BaseAgent:
    """Base Agent Class for all specialized agents."""
    def __init__(self, name: str, agent_type: str, system_prompt: str, default_model: str):
        self.name = name
        self.agent_type = agent_type
        self.system_prompt = system_prompt
        self.default_model = default_model

    async def run(self, task: str, state: Dict[str, Any], tools_needed: Optional[List[str]] = None) -> Dict[str, Any]:
        """Execute agent task, invoke tools, track metrics."""
        start_time = time.time()
        logger.info(f"[{self.name}] Executing task: {task[:60]}...")
        
        # Determine model routing
        routed_model = model_router.route_request(
            task_description=task,
            preferred_model=self.default_model
        )
        
        tool_results = []
        if tools_needed:
            for tool_name in tools_needed:
                tool = TOOL_REGISTRY.get(tool_name)
                if tool:
                    if tool_name == "web_search":
                        res = await tool.execute(query=task)
                    elif tool_name == "calculator":
                        res = await tool.execute(expression="2**10 + 100")
                    elif tool_name == "vector_search":
                        res = await tool.execute(query=task)
                    elif tool_name == "python_sandbox":
                        res = await tool.execute(code="print('AgentFlow Python Tool Executed')")
                    elif tool_name == "report_compiler":
                        res = await tool.execute(title="Task Report", sections=[{"heading": "Summary", "content": task}])
                    else:
                        res = await tool.execute(query=task) if hasattr(tool, 'execute') else {}
                    tool_results.append({"tool": tool_name, "output": res})

        latency = int((time.time() - start_time) * 1000)
        return {
            "agent": self.name,
            "agent_type": self.agent_type,
            "model_used": routed_model["key"],
            "tool_results": tool_results,
            "latency_ms": latency
        }
