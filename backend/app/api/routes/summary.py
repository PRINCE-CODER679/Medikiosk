from fastapi import APIRouter, HTTPException, Query, Header
from typing import Optional
from app.services.store import store
from app.services.clinical_summary import ClinicalSummaryEngine
from app.schemas.patient import ClinicalSummaryResponse

router = APIRouter()

@router.get(
    "/encounters/{encounter_id}/summary",
    response_model=ClinicalSummaryResponse,
    summary="Get Clinical Intake Summary"
)
def get_encounter_summary(
    encounter_id: str,
    patient_id: str = Query(...),
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Retrieves the aggregated clinical intake summary for an encounter.
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

    existing = store.get_summary(encounter_id)
    if existing and existing.get("patientId") == patient_id:
        return existing

    payload = ClinicalSummaryEngine.generate_encounter_summary(encounter_id, patient_id)
    return payload


@router.post(
    "/encounters/{encounter_id}/summary",
    response_model=ClinicalSummaryResponse,
    summary="Generate or Re-generate Clinical Intake Summary"
)
def generate_encounter_summary(
    encounter_id: str,
    patient_id: str = Query(...),
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Generates a fresh clinical intake summary aggregating all patient intake records,
    AI clarifications, safety triage status, scanned documents, OCR entities, and medical timeline.
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

    payload = ClinicalSummaryEngine.generate_encounter_summary(encounter_id, patient_id)
    return payload
