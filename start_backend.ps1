Set-Location $PSScriptRoot
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   AgentFlow AI - Production Backend Server (FastAPI)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Starting server on http://localhost:8000 ..." -ForegroundColor Green
Write-Host "API Docs available at: http://localhost:8000/api/v1/docs" -ForegroundColor Yellow
Write-Host ""
& ".\backend\venv\Scripts\python.exe" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
