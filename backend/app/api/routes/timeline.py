from fastapi import APIRouter, HTTPException, Query, Header
from typing import Optional
from app.services.store import store
from app.services.timeline import TimelineBuilder
from app.schemas.patient import TimelineResponse

router = APIRouter()

@router.get(
    "/encounters/{encounter_id}/timeline",
    response_model=TimelineResponse,
    summary="Get Longitudinal Medical Timeline & Patient Record"
)
def get_encounter_timeline(
    encounter_id: str,
    patient_id: str = Query(...),
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Retrieves the longitudinal medical timeline for an encounter.
    Aggregates check-in, structured history, AI clarifications, safety triage,
    scanned documents, and Phase 8 OCR-extracted clinical entities.
    Enforces strict patient data isolation.
    """
    encounter = store.get_encounter(encounter_id)
    if not encounter:
        encounter = store.create_encounter(patient_id=patient_id, source="MediKiosk")
        encounter["id"] = encounter_id
        store.encounters[encounter_id] = encounter

    # Strict Patient Isolation Check
    if encounter["patientId"] != patient_id:
        raise HTTPException(status_code=403, detail="Patient ID mismatch. Access denied.")

    # Strict Session Isolation Check if provided
    if x_session_id:
        session = store.get_session(x_session_id)
        if session and session["patientId"] != patient_id:
            raise HTTPException(status_code=403, detail="Session patient mismatch. Access denied.")

    # Return stored timeline or dynamically build
    existing = store.get_timeline(encounter_id)
    if existing and existing.get("patientId") == patient_id:
        return existing

    payload = TimelineBuilder.build_encounter_timeline(encounter_id, patient_id)
    return payload


@router.post(
    "/encounters/{encounter_id}/timeline/build",
    response_model=TimelineResponse,
    summary="Build or Re-build Longitudinal Medical Timeline"
)
def build_encounter_timeline(
    encounter_id: str,
    patient_id: str = Query(...),
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Forces a fresh aggregation and re-build of the encounter timeline.
    Enforces strict patient data isolation.
    """
    encounter = store.get_encounter(encounter_id)
    if not encounter:
        encounter = store.create_encounter(patient_id=patient_id, source="MediKiosk")
        encounter["id"] = encounter_id
        store.encounters[encounter_id] = encounter

    # Strict Patient Isolation Check
    if encounter["patientId"] != patient_id:
        raise HTTPException(status_code=403, detail="Patient ID mismatch. Access denied.")

    # Strict Session Isolation Check if provided
    if x_session_id:
        session = store.get_session(x_session_id)
        if session and session["patientId"] != patient_id:
            raise HTTPException(status_code=403, detail="Session patient mismatch. Access denied.")

    payload = TimelineBuilder.build_encounter_timeline(encounter_id, patient_id)
    return payload
