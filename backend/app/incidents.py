# Imports tools for creating API endpoints, handling errors, and database dependencies.
from fastapi import APIRouter, HTTPException, Depends

# Imports the schema used to validate incoming incident data.
from app.schemas import IncidentCreate

# Imports the database dependency.
from app.database.connection import get_db

# Imports the Incident database model.
from app.models import Incident


# Creates a router for incident-related endpoints.
router = APIRouter()


# Registers an endpoint to retrieve all incidents.
@router.get("/incidents")
def get_incidents(db=Depends(get_db)):
    # Retrieves all incidents from PostgreSQL.
    incident_records = db.query(Incident).all()

    # Returns all retrieved incidents.
    return incident_records


# Registers an endpoint to retrieve one incident by ID.
@router.get("/incidents/{incident_id}")
def get_incident(incident_id: int, db=Depends(get_db)):
    # Searches for the requested incident in PostgreSQL.
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    # Returns an error if the incident does not exist.
    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    # Returns the matching incident.
    return incident


# Registers an endpoint to create a new incident.
@router.post("/incidents")
def create_incident(
    incident_data: IncidentCreate,
    db=Depends(get_db)
):
    # Creates a new incident using the validated input.
    new_incident = Incident(
        title=incident_data.title,
        severity=incident_data.severity,
        status="open"
    )

    try:
        # Adds the incident to the database session.
        db.add(new_incident)

        # Saves the new incident in PostgreSQL.
        db.commit()

        # Retrieves the database-generated ID and saved values.
        db.refresh(new_incident)

        # Returns the created incident.
        return new_incident

    except Exception:
        # Rolls back the transaction if an error occurs.
        db.rollback()

        # Passes the error to FastAPI.
        raise


# Registers an endpoint to update an existing incident.
@router.put("/incidents/{incident_id}")
def update_incident(
    incident_id: int,
    updated_data: IncidentCreate,
    db=Depends(get_db)
):
    # Searches for the incident that needs updating.
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    # Returns an error if the incident does not exist.
    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    try:
        # Updates the incident title.
        incident.title = updated_data.title

        # Updates the incident severity.
        incident.severity = updated_data.severity

        # Saves the changes in PostgreSQL.
        db.commit()

        # Refreshes the incident with the saved values.
        db.refresh(incident)

        # Returns the updated incident.
        return incident

    except Exception:
        # Rolls back the transaction if an error occurs.
        db.rollback()

        # Passes the error to FastAPI.
        raise


# Registers an endpoint to delete an incident.
@router.delete("/incidents/{incident_id}")
def delete_incident(
    incident_id: int,
    db=Depends(get_db)
):
    # Searches for the incident that needs deleting.
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    # Returns an error if the incident does not exist.
    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    # Stores the incident details before deletion.
    deleted_incident = {
        "id": incident.id,
        "title": incident.title,
        "severity": incident.severity,
        "status": incident.status
    }

    try:
        # Marks the incident for deletion.
        db.delete(incident)

        # Saves the deletion in PostgreSQL.
        db.commit()

        # Returns confirmation and the deleted incident details.
        return {
            "message": "Incident deleted successfully",
            "incident": deleted_incident
        }

    except Exception:
        # Rolls back the transaction if an error occurs.
        db.rollback()

        # Passes the error to FastAPI.
        raise