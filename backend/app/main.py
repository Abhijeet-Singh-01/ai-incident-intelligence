
# Import FastAPI to create our backend application.
from fastapi import FastAPI

# Import CORS middleware to allow frontend-backend communication.
from fastapi.middleware.cors import CORSMiddleware

# Import the Incidents API router.
from app.incidents import router as incidents_router

# Import the Logs API router.
from app.logs import router as logs_router

# Import the Metrics API router.
from app.metrics import router as metrics_router


# Create the FastAPI application.
app = FastAPI(
    title="AI Incident Intelligence",
    description="AI-powered incident monitoring and root cause analysis platform",
    version="1.0.0"
)


# Configure CORS so our React frontend can communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register the Incidents API routes.
app.include_router(incidents_router)

# Register the Logs API routes.
app.include_router(logs_router)

# Register the Metrics API routes.
app.include_router(metrics_router)


# Home endpoint to check whether the backend is running.
@app.get("/")
def home():
    return {
        "message": "Welcome to AI Incident Intelligence API"
    }


# Health endpoint to check backend status.
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
