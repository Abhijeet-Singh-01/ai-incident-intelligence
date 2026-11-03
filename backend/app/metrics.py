# Import FastAPI tools for creating API endpoints and handling errors.
from fastapi import APIRouter, Depends, HTTPException

# Import SQLAlchemy database session.
from sqlalchemy.orm import Session

# Import Pydantic for response validation.
from pydantic import BaseModel, ConfigDict

# Import datetime for timestamp representation.
from datetime import datetime

# Import database session dependency.
from app.database.connection import get_db

# Import the Metric database model.
from app.models import Metric

# Import our system monitoring function.
from app.monitoring import collect_system_metrics


# Create a router for metrics endpoints.
router = APIRouter(prefix="/metrics", tags=["Metrics"])


# Define the structure of metric data returned by the API.
class MetricResponse(BaseModel):
    id: int
    cpu_usage: float
    memory_usage: float
    memory_total_gb: float
    memory_available_gb: float
    disk_usage: float
    disk_total_gb: float
    disk_free_gb: float
    created_at: datetime

    # Allow Pydantic to read data from SQLAlchemy objects.
    model_config = ConfigDict(from_attributes=True)


# Endpoint 1: Collect current system metrics and save them.
@router.post("/collect", response_model=MetricResponse)
def collect_metrics(db: Session = Depends(get_db)):

    # Collect actual CPU, RAM, and disk usage.
    metrics_data = collect_system_metrics()

    # Create a new database record.
    new_metric = Metric(**metrics_data)

    # Add the record to the database session.
    db.add(new_metric)

    # Save the record in PostgreSQL.
    db.commit()

    # Refresh the object to get its generated ID and timestamp.
    db.refresh(new_metric)

    # Return the saved metric.
    return new_metric


# Endpoint 2: Retrieve the latest collected metrics.
@router.get("/latest", response_model=MetricResponse)
def get_latest_metrics(db: Session = Depends(get_db)):

    # Find the newest metric record.
    latest_metric = db.query(Metric).order_by(Metric.created_at.desc()).first()

    # Return a 404 error if no metrics have been collected yet.
    if latest_metric is None:
        raise HTTPException(
            status_code=404, detail="No metrics found. Collect metrics first."
        )

    # Return the latest metric.
    return latest_metric


# Endpoint 3: Retrieve historical metric records.
@router.get("/", response_model=list[MetricResponse])
def get_metrics(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):

    # Retrieve records, newest first, with pagination.
    metrics = (
        db.query(Metric)
        .order_by(Metric.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Return the historical metrics.
    return metrics
