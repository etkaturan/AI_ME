# Activates venv and starts the AI orchestrator service
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8001