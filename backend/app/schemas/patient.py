from pydantic import BaseModel, Field
from typing import Optional

class PatientIdentifyRequest(BaseModel):
    method: str = Field(..., description="Identity method: 'ABHA' or 'AADHAAR'")
    identifier: str = Field(..., description="ABHA ID (e.g. 12-3456-7890-1234) or Aadhaar Number")

class PatientRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Full Name")
    age: int = Field(..., ge=0, le=120, description="Age in years")
    gender: str = Field(..., description="Gender: Male, Female, Other")
    phone: Optional[str] = Field(None, description="Mobile Number")

class PatientResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    phone: Optional[str] = None
    abhaId: Optional[str] = None
    verificationStatus: str
    identityMethod: str
    createdAt: str

class EncounterCreateRequest(BaseModel):
    patientId: str = Field(..., description="Patient ID")
    source: str = Field("MediKiosk", description="Intake source")

class EncounterResponse(BaseModel):
    id: str
    patientId: str
    createdAt: str
    status: str
    source: str
    workflowStatus: str

class SessionCreateRequest(BaseModel):
    patientId: str
    encounterId: str
    currentStep: str = "IDENTITY"

class SessionResponse(BaseModel):
    sessionId: str
    patientId: str
    encounterId: str
    createdTimestamp: str
    lastActivityTimestamp: str
    currentWorkflowStep: str
    status: str
