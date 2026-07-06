# Etka — Common Dev Commands

**Version:** 0.1
**Last updated:** 2026-07-07

> Living reference for terminal commands used often during development. Add new sections as new tools/services come online.

---

## Backend (FastAPI) — `services/backend-api`

**Activate virtual environment** (needed every new terminal session):
```powershell
cd services/backend-api
.\venv\Scripts\Activate.ps1
```

**Run the dev server** (auto-reloads on file changes):
```powershell
uvicorn main:app --reload
```
Health check: http://127.0.0.1:8000/health

**Install a new Python package:**
```powershell
pip install <package-name>
pip freeze > requirements.txt
```

**Deactivate venv:**
```powershell
deactivate
```

---

## Git

**Check what's changed:**
```powershell
git status
```

**Stage + commit:**
```powershell
git add .
git commit -m "Description of change"
```

**Push:**
```powershell
git push
```

---

## Docker (Postgres — coming up next)

*(To be filled in once we set up docker-compose.yml)*

---

## Frontend (Next.js) — `apps/web`

*(To be filled in once we scaffold the frontend)*
