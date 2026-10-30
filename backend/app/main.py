from fastapi import FastAPI

from app.incidents import router as incidents_router

from app.logs import router as logs_router

app = FastAPI(title="AI INCIDENT INTELLIGENCE")

# Imports middleware that controls cross-origin browser requests.
from fastapi.middleware.cors import CORSMiddleware

# Allows the local React frontend to communicate with this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents_router)
app.include_router(logs_router)

@app.get("/")
def home():
    return {"message": "Welcome to AI INCIDENT INTELLIGENCE API its running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
