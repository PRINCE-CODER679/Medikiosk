from fastapi import APIRouter, HTTPException, status
from app.schemas.patient import EncounterCreateRequest, EncounterResponse
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
