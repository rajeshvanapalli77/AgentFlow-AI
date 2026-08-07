# AgentFlow AI - Local Installation Guide

## Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL & ChromaDB (or SQLite default)

## 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m backend.database.init_db
python -m backend.main
```
Backend will run at `http://localhost:8000`.

## 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run at `http://localhost:5173`.
Default Login Credentials: `admin@agentflow.ai` / `admin123!`.
