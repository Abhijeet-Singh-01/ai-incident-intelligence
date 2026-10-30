# Imports FastAPI tools for creating API endpoints.
from fastapi import APIRouter, Depends, HTTPException, Query

# Imports SQLAlchemy database tools.
from sqlalchemy.orm import Session

# Imports Pydantic for request validation.
from pydantic import BaseModel
from typing import Literal

# Imports the database session dependency.
from app.database.connection import get_db

# Imports the Log database model.
from app.models import Log


# Creates a router for log-related endpoints.
router = APIRouter(prefix="/logs", tags=["Logs"])


# Defines the structure of incoming log data.
class LogCreate(BaseModel):
    level: Literal["INFO", "WARNING", "ERROR", "CRITICAL"]
    message: str
    source: str = "application"


# Defines the structure of log responses.
class LogResponse(BaseModel):
    id: int
    level: str
    message: str
    source: str
    created_at: object

    model_config = {"from_attributes": True}


# Creates and stores a new application log.
@router.post("/", response_model=LogResponse, status_code=201)
def create_log(log: LogCreate, db: Session = Depends(get_db)):
    # Creates a new Log database object.
    new_log = Log(level=log.level, message=log.message, source=log.source)

    # Adds the log to the database session.
    db.add(new_log)

    # Saves the log in PostgreSQL.
    db.commit()

    # Retrieves the generated ID and timestamp.
    db.refresh(new_log)

    # Returns the saved log.
    return new_log


# Retrieves all logs with pagination.
@router.get("/", response_model=list[LogResponse])
def get_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    # Retrieves logs, newest first.
    logs = db.query(Log).order_by(Log.id.desc()).offset(skip).limit(limit).all()

    return logs


# Retrieves one log using its ID.
@router.get("/{log_id}", response_model=LogResponse)
def get_log(log_id: int, db: Session = Depends(get_db)):
    # Searches for the requested log.
    log = db.query(Log).filter(Log.id == log_id).first()

    # Returns 404 if the log does not exist.
    if log is None:
        raise HTTPException(status_code=404, detail="Log not found")

    return log
