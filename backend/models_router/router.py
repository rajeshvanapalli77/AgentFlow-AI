import os
from typing import Dict, Any, Optional
from backend.core.config import settings
from backend.core.logger import logger

class ModelRouter:
    """
    Enterprise Dynamic Model Router.
    Evaluates request characteristics (task complexity, vision input, offline preference, latency sensitivity)
    and selects the optimal LLM provider and model.
    """
    
    MODELS = {
        "gemini-flash": {"provider": "gemini", "model_name": "gemini-1.5-flash", "cost_per_1k": 0.00015, "type": "fast"},
        "gpt-4o": {"provider": "openai", "model_name": "gpt-4o", "cost_per_1k": 0.005, "type": "reasoning"},
        "gemini-vision": {"provider": "gemini", "model_name": "gemini-1.5-pro", "cost_per_1k": 0.00125, "type": "vision"},
        "ollama-local": {"provider": "ollama", "model_name": "llama3", "cost_per_1k": 0.0, "type": "offline"}
    }

    @classmethod
    def route_request(
        self,
        task_description: str,
        has_image: bool = False,
        require_offline: bool = False,
        preferred_model: Optional[str] = None
    ) -> Dict[str, Any]:
        """Dynamically route request to optimal model based on features."""
        
        if preferred_model and preferred_model in self.MODELS:
            selected = self.MODELS[preferred_model]
            selected["key"] = preferred_model
            return selected

        # 1. Offline Mode Requirement
        if require_offline:
            logger.info("Routing to Offline model (Ollama / Fallback)")
            selected = self.MODELS["ollama-local"]
            selected["key"] = "ollama-local"
            return selected

        # 2. Vision Requirement
        if has_image:
            logger.info("Routing request to Vision model (Gemini Vision)")
            selected = self.MODELS["gemini-vision"]
            selected["key"] = "gemini-vision"
            return selected

        # 3. High-Complexity Reasoning Classifier
        reasoning_keywords = [
            "complex", "architecture", "debug", "refactor", "code generation",
            "proof", "math", "sql design", "optimization", "analyse deep", "plan"
        ]
        
        task_lower = task_description.lower()
        is_complex = len(task_description) > 300 or any(kw in task_lower for kw in reasoning_keywords)

        if is_complex and settings.OPENAI_API_KEY:
            logger.info("Routing request to Reasoning model (GPT-4o)")
            selected = self.MODELS["gpt-4o"]
            selected["key"] = "gpt-4o"
            return selected

        # 4. Default to fast & cost-efficient Gemini Flash
        logger.info("Routing request to Speed/Cost model (Gemini Flash)")
        selected = self.MODELS["gemini-flash"]
        selected["key"] = "gemini-flash"
        return selected

model_router = ModelRouter()
