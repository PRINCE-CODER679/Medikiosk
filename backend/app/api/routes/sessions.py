from fastapi import APIRouter, HTTPException, status
from app.schemas.patient import SessionCreateRequest, SessionUpdateRequest, SessionResponse
from app.services.store import store

router = APIRouter()

@router.post("/sessions", response_model=SessionResponse, summary="Establish Patient Session")
def create_session(req: SessionCreateRequest):
    patient = store.get_patient(req.patientId)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated patient record not found."
        )

    session = store.create_session(
        patient_id=req.patientId,
        encounter_id=req.encounterId,
        current_step=req.currentStep,
        language_preference=req.languagePreference or "en",
        accessibility_preferences=req.accessibilityPreferences,
        consent_status=req.consentStatus or "pending",
        consent_timestamp=req.consentTimestamp
    )
    return session

@router.get("/sessions/{session_id}", response_model=SessionResponse, summary="Get Active Session Status")
def get_session(session_id: str):
    session = store.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found or expired."
        )
    return session

@router.patch("/sessions/{session_id}", response_model=SessionResponse, summary="Update Kiosk Session State")
def update_session(session_id: str, req: SessionUpdateRequest):
    updates = req.model_dump(exclude_unset=True)
    session = store.update_session(session_id, updates)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found."
        )
    return session

