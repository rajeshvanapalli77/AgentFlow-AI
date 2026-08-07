# AgentFlow AI - Deployment Guide (Docker / Render / Vercel)

## Option 1: Docker Compose Deployment
```bash
docker-compose up --build -d
```
Services spun up:
- PostgreSQL on port `5432`
- ChromaDB on port `8000`
- FastAPI Backend on port `8000`
- React Frontend on port `3000`

## Option 2: Cloud Deployment (Render & Vercel)
- **Backend (Render)**: Deploy backend as a Web Service running Python 3.12 with start command `python -m backend.main`.
- **Frontend (Vercel)**: Deploy `frontend/` directory with build command `npm run build` and output directory `dist`.
