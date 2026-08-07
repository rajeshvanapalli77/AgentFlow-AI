import pytest
import asyncio
from backend.core.security import hash_password, verify_password, create_access_token, decode_token
from backend.models_router.router import model_router
from backend.services.tools import TOOL_REGISTRY
from backend.services.rag_service import rag_service
from backend.orchestrator.graph import orchestrator

def test_security_hashing():
    pwd = "secret_password_123"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_jwt_tokens():
    token = create_access_token(subject="user_123", role="admin")
    decoded = decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user_123"
    assert decoded["role"] == "admin"

def test_model_router():
    route_flash = model_router.route_request("Simple greeting task")
    assert route_flash["key"] == "gemini-flash"

    route_code = model_router.route_request("Complex Python architecture design and debugging optimization")
    assert route_code["key"] in ["gpt-4o", "gemini-flash", "ollama-local"]

    route_vision = model_router.route_request("Read invoice details", has_image=True)
    assert route_vision["key"] == "gemini-vision"

@pytest.mark.asyncio
async def test_tools_execution():
    calc_res = await TOOL_REGISTRY["calculator"].execute(expression="10 * 10 + 42")
    assert calc_res["success"] is True
    assert calc_res["result"] == "142"

    weather_res = await TOOL_REGISTRY["weather_lookup"].execute(city="San Francisco")
    assert weather_res["success"] is True
    assert "temp" in weather_res["forecast"]

@pytest.mark.asyncio
async def test_rag_chunking():
    text = "Sentence 1. Sentence 2. Sentence 3. Sentence 4. Sentence 5."
    chunks = rag_service._chunk_text(text, chunk_size=30, overlap=10)
    assert len(chunks) >= 1

@pytest.mark.asyncio
async def test_orchestrator_execution():
    res = await orchestrator.execute_workflow(
        task="Research the latest trends in Agentic AI and write a short summary",
        user_id="test_user"
    )
    assert res["status"] in ["completed", "pending_approval"]
    assert "plan" in res
    assert len(res["plan"]) > 0
