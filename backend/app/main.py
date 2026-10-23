from fastapi import FastAPI

from app.incidents import router as incidents_router

app=FastAPI(title="AI INCIDENT INTELLIGENCE")

app.include_router(incidents_router)


@app.get("/")
def home():
    return {"message": "Welcome to AI INCIDENT INTELLIGENCE API its running"}



@app.get("/health")
def health_check():
    return {"status": "healthy"}