from fastapi import APIRouter, HTTPException, status
from app.schemas.patient import PatientIdentifyRequest, PatientRegisterRequest, PatientResponse
from app.services.store import store

router = APIRouter()

@router.post("/patients/identify", response_model=PatientResponse, summary="Identify Patient (ABHA or Aadhaar Mock)")
def identify_patient(req: PatientIdentifyRequest):
    if not req.identifier or len(req.identifier.strip()) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid ID number."
        )

    method = req.method.upper()
    if method == "ABHA":
        # Validate ABHA format (digits and hyphens, approx 14 digits)
        clean_id = req.identifier.replace(" ", "").replace("-", "")
        if not clean_id.isdigit() or len(clean_id) != 14:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please enter a valid 14-digit ABHA ID (e.g. 12-3456-7890-1234)."
            )
        patient = store.identify_abha(req.identifier)
    elif method == "AADHAAR":
        clean_id = req.identifier.replace(" ", "").replace("-", "")
        if not clean_id.isdigit() or len(clean_id) != 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please enter a valid 12-digit Aadhaar number."
            )
        patient = store.identify_aadhaar(clean_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid identity method specified."
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
