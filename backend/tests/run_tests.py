import sys
import os
sys.path.insert(0, os.path.abspath("."))
import unittest
import asyncio
from backend.core.security import hash_password, verify_password, create_access_token, decode_token
from backend.models_router.router import model_router
from backend.services.tools import TOOL_REGISTRY
from backend.services.rag_service import rag_service
from backend.orchestrator.graph import orchestrator

class TestAgentFlow(unittest.TestCase):
    def test_security_hashing(self):
        pwd = "secret_password_123"
        hashed = hash_password(pwd)
        self.assertTrue(verify_password(pwd, hashed))
        self.assertFalse(verify_password("wrong_password", hashed))

    def test_jwt_tokens(self):
        token = create_access_token(subject="user_123", role="admin")
        decoded = decode_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["sub"], "user_123")
        self.assertEqual(decoded["role"], "admin")

    def test_model_router(self):
        route_flash = model_router.route_request("Simple greeting task")
        self.assertEqual(route_flash["key"], "gemini-flash")

        route_vision = model_router.route_request("Read invoice details", has_image=True)
        self.assertEqual(route_vision["key"], "gemini-vision")

    def test_async_components(self):
        async def run_async_tests():
            calc_res = await TOOL_REGISTRY["calculator"].execute(expression="10 * 10 + 42")
            self.assertTrue(calc_res["success"])
            self.assertEqual(calc_res["result"], "142")

            weather_res = await TOOL_REGISTRY["weather_lookup"].execute(city="San Francisco")
            self.assertTrue(weather_res["success"])

            orch_res = await orchestrator.execute_workflow(
                task="Research the latest trends in Agentic AI and write a short summary",
                user_id="test_user"
            )
            self.assertIn(orch_res["status"], ["completed", "pending_approval"])
            self.assertTrue(len(orch_res["plan"]) > 0)

        asyncio.run(run_async_tests())

if __name__ == "__main__":
    unittest.main()
