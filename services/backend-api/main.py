from fastapi import FastAPI

app = FastAPI(title="Etka Backend API")

@app.get("/health")
def health_check():
    return {"status": "ok"}