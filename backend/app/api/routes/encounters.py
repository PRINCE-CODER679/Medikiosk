from fastapi import APIRouter, HTTPException, status
from app.schemas.patient import (
    EncounterCreateRequest,
    EncounterResponse,
    ClinicalHistorySaveRequest,
    ClinicalHistoryResponse
)
from app.services.store import store

router = APIRouter()

@router.post("/encounters", response_model=EncounterResponse, summary="Create Patient Encounter")
def create_encounter(req: EncounterCreateRequest):
    patient = store.get_patient(req.patientId)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {req.patientId} not found."
        )

    encounter = store.create_encounter(patient_id=req.patientId, source=req.source)
    return encounter

@router.post("/encounters/{encounter_id}/history", response_model=ClinicalHistoryResponse, summary="Save Clinical History Section")
def save_clinical_history(encounter_id: str, req: ClinicalHistorySaveRequest):
    encounter = store.encounters.get(encounter_id)
    patient_id = encounter["patientId"] if encounter else "PAT-UNKNOWN"
    
    history_data = req.model_dump(exclude_unset=True)
    history = store.save_clinical_history(encounter_id, patient_id, history_data)
    return history

@router.get("/encounters/{encounter_id}/history", response_model=ClinicalHistoryResponse, summary="Get Clinical History for Encounter")
def get_clinical_history(encounter_id: str):
    history = store.get_clinical_history(encounter_id)
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No clinical history recorded for encounter {encounter_id}."
        )
    return history

