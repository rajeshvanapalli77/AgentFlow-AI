@echo off
cd /d "%~dp0"
echo =======================================================
echo    AgentFlow AI - Production Backend Server (FastAPI)
echo =======================================================
echo Starting server on http://localhost:8000 ...
echo API Docs available at: http://localhost:8000/api/v1/docs
echo.
backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
