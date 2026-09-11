from pydantic import BaseModel, Field
from typing import Optional

class PatientIdentifyRequest(BaseModel):
    method: str = Field("AUTO", description="Identity lookup method: 'ABHA', 'PATIENT_ID', or 'AUTO'")
    identifier: str = Field(..., description="ABHA ID (e.g. 14-8829-1029-4829) or Patient ID (e.g. PAT-10928)")

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
    languagePreference: Optional[str] = "en"
    accessibilityPreferences: Optional[dict] = None
    consentStatus: Optional[str] = "pending"
    consentTimestamp: Optional[str] = None

class SessionUpdateRequest(BaseModel):
    languagePreference: Optional[str] = None
    accessibilityPreferences: Optional[dict] = None
    consentStatus: Optional[str] = None
    consentTimestamp: Optional[str] = None
    currentWorkflowStep: Optional[str] = None
    status: Optional[str] = None

class SessionResponse(BaseModel):
    sessionId: str
    patientId: str
    encounterId: str
    languagePreference: Optional[str] = "en"
    accessibilityPreferences: Optional[dict] = None
    consentStatus: Optional[str] = "pending"
    consentTimestamp: Optional[str] = None
    createdTimestamp: str
    lastActivityTimestamp: str
    currentWorkflowStep: str
    status: str

# Phase 4: Clinical History Engine Schemas
class ChiefComplaintSchema(BaseModel):
    primarySymptom: Optional[str] = None
    onset: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None

class HPISchema(BaseModel):
    onset: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    severity: Optional[int] = Field(5, ge=1, le=10)
    character: Optional[str] = None
    aggravatingFactors: Optional[str] = None
    relievingFactors: Optional[str] = None
    associatedSymptoms: Optional[list] = None

class PastMedicalHistorySchema(BaseModel):
    conditions: Optional[list] = None
    surgeries: Optional[list] = None
    hospitalizations: Optional[list] = None
    notes: Optional[str] = None

class MedicationItemSchema(BaseModel):
    name: str
    dose: Optional[str] = None
    frequency: Optional[str] = None
    reason: Optional[str] = None

class AllergyItemSchema(BaseModel):
    category: Optional[str] = "Drug"
    allergen: str
    reaction: Optional[str] = None

class FamilyHistorySchema(BaseModel):
    conditions: Optional[list] = None
    notes: Optional[str] = None

class PersonalHistorySchema(BaseModel):
    smoking: Optional[str] = "Never"
    alcohol: Optional[str] = "Never"
    occupation: Optional[str] = None
    lifestyle: Optional[str] = None

class ReviewOfSystemsSchema(BaseModel):
    general: Optional[list] = None
    respiratory: Optional[list] = None
    cardiovascular: Optional[list] = None
    gastrointestinal: Optional[list] = None
    neurological: Optional[list] = None
    genitourinary: Optional[list] = None
    musculoskeletal: Optional[list] = None
    skin: Optional[list] = None

class ClinicalHistorySaveRequest(BaseModel):
    chiefComplaint: Optional[dict] = None
    hpi: Optional[dict] = None
    pastMedicalHistory: Optional[dict] = None
    medications: Optional[list] = None
    allergies: Optional[list] = None
    familyHistory: Optional[dict] = None
    personalHistory: Optional[dict] = None
    reviewOfSystems: Optional[dict] = None
    investigations: Optional[list] = None
    currentSection: Optional[int] = 1
    completionStatus: Optional[str] = "IN_PROGRESS"

class ClinicalHistoryResponse(BaseModel):
    encounterId: str
    patientId: str
    chiefComplaint: Optional[dict] = None
    hpi: Optional[dict] = None
    pastMedicalHistory: Optional[dict] = None
    medications: Optional[list] = None
    allergies: Optional[list] = None
    familyHistory: Optional[dict] = None
    personalHistory: Optional[dict] = None
    reviewOfSystems: Optional[dict] = None
    investigations: Optional[list] = None
    currentSection: Optional[int] = 1
    completionStatus: str = "IN_PROGRESS"
    updatedAt: str

# Phase 5: Adaptive Conversational AI Schemas
class ConversationCreateRequest(BaseModel):
    encounterId: str
    patientId: str
    sessionId: Optional[str] = None
    languagePreference: Optional[str] = "en"

class ConversationResponse(BaseModel):
    conversationId: str
    encounterId: str
    patientId: str
    sessionId: Optional[str] = None
    status: str = "ACTIVE"
    questionCount: int = 0
    maxQuestions: int = 4
    mode: str = "DETERMINISTIC_FALLBACK"

class QuestionResponse(BaseModel):
    conversationId: str
    questionId: str
    question: str
    targetSection: str
    targetField: str
    questionType: str = "single_choice"
    options: list = []
    shouldContinue: bool = True
    mode: str = "DETERMINISTIC_FALLBACK"

class AnswerSubmitRequest(BaseModel):
    questionId: str
    targetSection: str
    targetField: str
    answerValue: str

# Phase 6: Clinical Safety & Red Flags Schemas
class TriggeredFindingSchema(BaseModel):
    ruleId: str
    finding: str
    field: str
    value: str
    source: str = "PATIENT"

class SafetyAssessmentResponse(BaseModel):
    safetyAssessmentId: str
    patientId: str
    encounterId: str
    sessionId: Optional[str] = None
    status: str = Field(..., description="EMERGENCY | URGENT | NO_IMMEDIATE_FLAG | INSUFFICIENT_INFORMATION")
    ruleIds: list[str] = []
    triggeredFindings: list[dict] = []
    patientGuidance: str
    clinicianGuidance: str
    ruleVersion: str = "1.0"
    source: str = "DETERMINISTIC_RULE"
    createdAt: str

# Phase 7: Medical Document Intelligence / OCR Schemas
class DocumentResponse(BaseModel):
    documentId: str
    patientId: str
    encounterId: str
    sessionId: Optional[str] = None
    documentType: str = Field("OTHER", description="LAB_REPORT | PRESCRIPTION | DISCHARGE_SUMMARY | MEDICAL_REPORT | OTHER")
    fileName: str
    mimeType: str
    status: str = Field("OCR_COMPLETE", description="UPLOADED | PROCESSING | OCR_COMPLETE | NEEDS_REVIEW | FAILED")
    extractedText: str = ""
    ocrConfidence: Optional[float] = 0.95
    source: str = "OCR_EXTRACTED"
    createdAt: str
    updatedAt: str

class DocumentListResponse(BaseModel):
    encounterId: str
    patientId: str
    documents: list[DocumentResponse] = []
    totalCount: int = 0






