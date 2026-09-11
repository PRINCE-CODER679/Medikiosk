from fastapi import APIRouter, HTTPException, Query, Form, Header
from typing import Optional
from app.services.store import store
from app.services.entity_extraction import ClinicalEntityExtractor
from app.schemas.patient import EntityExtractionResponse

router = APIRouter()

@router.post("/encounters/{encounter_id}/entities/extract", response_model=EntityExtractionResponse, summary="Extract Clinical Entities from Encounter Documents")
def extract_encounter_entities(
    encounter_id: str,
    patient_id: str = Query(...),
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Parses raw OCR text from all medical documents uploaded for an encounter,
    extracting 7 structured entity categories with provenance tracking (OCR_EXTRACTED_ENTITY).
    Enforces strict patient data isolation.
    """
    encounter = store.get_encounter(encounter_id)
    if not encounter:
        encounter = store.create_encounter(patient_id=patient_id, source="MediKiosk")
        encounter["id"] = encounter_id
        store.encounters[encounter_id] = encounter

    # Patient Isolation Check
    if encounter["patientId"] != patient_id:
        raise HTTPException(status_code=403, detail="Patient ID mismatch. Access denied.")

    # Session Isolation Check if provided
    if x_session_id:
        session = store.get_session(x_session_id)
        if session and session["patientId"] != patient_id:
            raise HTTPException(status_code=403, detail="Session patient mismatch. Access denied.")

    documents = store.list_encounter_documents(encounter_id)
    payload = ClinicalEntityExtractor.extract_from_documents(documents, patient_id, encounter_id)
    store.save_entities(encounter_id, payload)

    return payload


@router.get("/encounters/{encounter_id}/entities", response_model=EntityExtractionResponse, summary="Get Extracted Clinical Entities")
def get_encounter_entities(
    encounter_id: str,
    patient_id: str = Query(...),
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Retrieves previously extracted clinical entities for an encounter.
    If entities have not been extracted yet, automatically triggers extraction on uploaded documents.
    Enforces strict patient data isolation.
    """
    encounter = store.get_encounter(encounter_id)
    if not encounter:
        encounter = store.create_encounter(patient_id=patient_id, source="MediKiosk")
        encounter["id"] = encounter_id
        store.encounters[encounter_id] = encounter

    # Patient Isolation Check
    if encounter["patientId"] != patient_id:
        raise HTTPException(status_code=403, detail="Patient ID mismatch. Access denied.")

    # Session Isolation Check if provided
    if x_session_id:
        session = store.get_session(x_session_id)
        if session and session["patientId"] != patient_id:
            raise HTTPException(status_code=403, detail="Session patient mismatch. Access denied.")

    existing = store.get_entities(encounter_id)
    if existing:
        return existing

    documents = store.list_encounter_documents(encounter_id)
    payload = ClinicalEntityExtractor.extract_from_documents(documents, patient_id, encounter_id)
    store.save_entities(encounter_id, payload)

    return payload
