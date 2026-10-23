# Imports tools for creating API endpoints, handling errors, and database dependencies.
from fastapi import APIRouter, HTTPException, Depends

# Imports schemas for validating incoming data and outgoing responses.
from app.schemas import IncidentCreate, IncidentResponse

# Imports the database dependency.
from app.database.connection import get_db

# Imports the Incident database model.
from app.models import Incident


# Creates a router for incident-related endpoints.
router = APIRouter()


# Returns a list of incidents using the response schema.
@router.get("/incidents", response_model=list[IncidentResponse])
def get_incidents(db=Depends(get_db)):

    # Retrieves all incidents from PostgreSQL.
    incident_records = db.query(Incident).all()

    # Returns all retrieved incidents.
    return incident_records


# Returns one incident using the response schema.
@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db=Depends(get_db)):

    # Searches for the requested incident in PostgreSQL.
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    # Returns a 404 error if the incident does not exist.
    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    # Returns the matching incident.
    return incident


# Creates a new incident and returns the response schema.
@router.post("/incidents", response_model=IncidentResponse)
def create_incident(
    incident_data: IncidentCreate,
    db=Depends(get_db)
):

    # Creates a new incident using the validated request data.
    new_incident = Incident(
        title=incident_data.title,
        severity=incident_data.severity,
        status="open"
    )

    try:
        # Adds the new incident to the database session.
        db.add(new_incident)

        # Saves the new incident in PostgreSQL.
        db.commit()

        # Retrieves the generated ID and saved values.
        db.refresh(new_incident)

        # Returns the created incident.
        return new_incident

    except Exception:
        # Rolls back the transaction if something goes wrong.
        db.rollback()

        # Passes the original error to FastAPI.
        raise


# Updates an existing incident and returns the response schema.
@router.put("/incidents/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int,
    updated_data: IncidentCreate,
    db=Depends(get_db)
):

    # Searches for the incident that needs updating.
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    # Returns a 404 error if the incident does not exist.
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

        # Saves the updated values in PostgreSQL.
        db.commit()

        # Refreshes the incident with the saved values.
        db.refresh(incident)

        # Returns the updated incident.
        return incident

    except Exception:
        # Rolls back the transaction if something goes wrong.
        db.rollback()

        # Passes the original error to FastAPI.
        raise


# Deletes an incident and returns a confirmation message.
@router.delete("/incidents/{incident_id}")
def delete_incident(
    incident_id: int,
    db=Depends(get_db)
):

    # Searches for the incident that needs deleting.
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    # Returns a 404 error if the incident does not exist.
    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    # Saves the incident details before deleting it.
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
        # Rolls back the transaction if something goes wrong.
        db.rollback()

        # Passes the original error to FastAPI.
        raise