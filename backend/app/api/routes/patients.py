from fastapi import APIRouter, HTTPException, status
from app.schemas.patient import PatientIdentifyRequest, PatientRegisterRequest, PatientResponse
from app.services.store import store

router = APIRouter()

@router.post("/patients/identify", response_model=PatientResponse, summary="Identify Patient (ABHA ID or Patient ID Mock)")
def identify_patient(req: PatientIdentifyRequest):
    identifier = req.identifier.strip() if req.identifier else ""
    if not identifier or len(identifier) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid Patient ID (e.g. PAT-10928) or 14-digit ABHA ID."
        )

    patient = store.lookup_patient(identifier, req.method)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No patient record found for '{identifier}'. Please check the ID or register as a new patient."
        )

    return patient

@router.post("/patients/register", response_model=PatientResponse, summary="Register New Patient")
def register_patient(req: PatientRegisterRequest):
    if not req.name or len(req.name.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full Name must be at least 2 characters long."
        )
    if req.age < 0 or req.age > 120:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid age between 0 and 120."
        )

    patient = store.register_patient(
        name=req.name.strip(),
        age=req.age,
        gender=req.gender,
        phone=req.phone.strip() if req.phone else None
    )
    return patient
