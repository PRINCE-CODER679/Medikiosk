import random
import datetime
from typing import Dict, Optional

class DataStore:
    def __init__(self):
        self.patients: Dict[str, dict] = {
            "PAT-10928": {
                "id": "PAT-10928",
                "name": "Ramesh Kumar",
                "age": 45,
                "gender": "Male",
                "phone": "+91 98765 43210",
                "abhaId": "14-8829-1029-4829",
                "verificationStatus": "Sandbox ABDM Verified",
                "identityMethod": "PATIENT_ID",
                "createdAt": datetime.datetime.now().isoformat()
            },
            "PAT-10929": {
                "id": "PAT-10929",
                "name": "Priya Sharma",
                "age": 34,
                "gender": "Female",
                "phone": "+91 98123 45678",
                "abhaId": "91-4432-8819-2091",
                "verificationStatus": "Sandbox ABDM Verified",
                "identityMethod": "PATIENT_ID",
                "createdAt": datetime.datetime.now().isoformat()
            },
            "PAT-10930": {
                "id": "PAT-10930",
                "name": "Amit Patil",
                "age": 48,
                "gender": "Male",
                "phone": "+91 97654 32109",
                "abhaId": "55-9012-3456-7890",
                "verificationStatus": "Sandbox ABDM Verified",
                "identityMethod": "PATIENT_ID",
                "createdAt": datetime.datetime.now().isoformat()
            },
            "PAT-10931": {
                "id": "PAT-10931",
                "name": "Neha Singh",
                "age": 29,
                "gender": "Female",
                "phone": "+91 91234 56789",
                "abhaId": "33-1122-3344-5566",
                "verificationStatus": "Sandbox ABDM Verified",
                "identityMethod": "PATIENT_ID",
                "createdAt": datetime.datetime.now().isoformat()
            }
        }
        self.encounters: Dict[str, dict] = {}
        self.sessions: Dict[str, dict] = {}
        self.clinical_histories: Dict[str, dict] = {}
        self.conversations: Dict[str, dict] = {}
        self.safety_assessments: Dict[str, dict] = {}
        self.documents: Dict[str, dict] = {}

    def generate_patient_id(self) -> str:
        num = random.randint(10000, 99999)
        return f"PAT-{num}"

    def generate_encounter_id(self) -> str:
        year = datetime.datetime.now().year
        num = random.randint(10000, 99999)
        return f"ENC-{year}-{num}"

    def generate_session_id(self) -> str:
        num = random.randint(10000, 99999)
        return f"SES-{num}"

    def get_patient(self, patient_id: str) -> Optional[dict]:
        return self.patients.get(patient_id)

    def lookup_patient(self, identifier: str, method: str = "AUTO") -> Optional[dict]:
        clean_id = identifier.strip().upper()
        
        # 1. Match exact Patient ID or ABHA ID in seeded store
        for p in self.patients.values():
            if p["id"].upper() == clean_id or (p.get("abhaId") and p["abhaId"].replace("-", "").replace(" ", "") == clean_id.replace("-", "").replace(" ", "")):
                return p

        # 2. If ABHA format (approx 14 digits), simulate sandbox discovery
        digits_only = clean_id.replace("-", "").replace(" ", "")
        if method.upper() in ["ABHA", "AUTO"] and digits_only.isdigit() and len(digits_only) == 14:
            patient_id = self.generate_patient_id()
            formatted_abha = f"{digits_only[:2]}-{digits_only[2:6]}-{digits_only[6:10]}-{digits_only[10:]}"
            patient = {
                "id": patient_id,
                "name": "Devendra Sharma (Demo)",
                "age": 52,
                "gender": "Male",
                "phone": "+91 98123 45678",
                "abhaId": formatted_abha,
                "verificationStatus": "Sandbox ABDM Verified",
                "identityMethod": "ABHA",
                "createdAt": datetime.datetime.now().isoformat()
            }
            self.patients[patient_id] = patient
            return patient

        return None

    def register_patient(self, name: str, age: int, gender: str, phone: Optional[str] = None) -> dict:
        patient_id = self.generate_patient_id()
        patient = {
            "id": patient_id,
            "name": name,
            "age": age,
            "gender": gender,
            "phone": phone or "+91 90000 00000",
            "abhaId": None,
            "verificationStatus": "Self Registered (New Patient)",
            "identityMethod": "NEW_PATIENT",
            "createdAt": datetime.datetime.now().isoformat()
        }
        self.patients[patient_id] = patient
        return patient

    def create_encounter(self, patient_id: str, source: str = "MediKiosk") -> dict:
        encounter_id = self.generate_encounter_id()
        now = datetime.datetime.now().isoformat()
        encounter = {
            "id": encounter_id,
            "patientId": patient_id,
            "createdAt": now,
            "status": "In-Progress",
            "source": source,
            "workflowStatus": "IDENTITY_VERIFIED"
        }
        self.encounters[encounter_id] = encounter
        return encounter

    def get_encounter(self, encounter_id: str) -> Optional[dict]:
        return self.encounters.get(encounter_id)

    def get_session(self, session_id: str) -> Optional[dict]:
        return self.sessions.get(session_id)

    def create_session(
        self,
        patient_id: str,
        encounter_id: str,
        current_step: str = "IDENTITY",
        language_preference: str = "en",
        accessibility_preferences: Optional[dict] = None,
        consent_status: str = "pending",
        consent_timestamp: Optional[str] = None
    ) -> dict:
        session_id = self.generate_session_id()
        now = datetime.datetime.now().isoformat()
        session = {
            "sessionId": session_id,
            "patientId": patient_id,
            "encounterId": encounter_id,
            "languagePreference": language_preference,
            "accessibilityPreferences": accessibility_preferences or {
                "textSize": "normal",
                "highContrast": False,
                "voiceGuidance": False,
                "reduceMotion": False
            },
            "consentStatus": consent_status,
            "consentTimestamp": consent_timestamp,
            "createdTimestamp": now,
            "lastActivityTimestamp": now,
            "currentWorkflowStep": current_step,
            "status": "ACTIVE"
        }
        self.sessions[session_id] = session
        return session

    def update_session(self, session_id: str, updates: dict) -> Optional[dict]:
        session = self.sessions.get(session_id)
        if not session:
            return None
        
        now = datetime.datetime.now().isoformat()
        session["lastActivityTimestamp"] = now

        if "languagePreference" in updates and updates["languagePreference"] is not None:
            session["languagePreference"] = updates["languagePreference"]
        if "accessibilityPreferences" in updates and updates["accessibilityPreferences"] is not None:
            session["accessibilityPreferences"] = updates["accessibilityPreferences"]
        if "consentStatus" in updates and updates["consentStatus"] is not None:
            session["consentStatus"] = updates["consentStatus"]
        if "consentTimestamp" in updates and updates["consentTimestamp"] is not None:
            session["consentTimestamp"] = updates["consentTimestamp"]
        if "currentWorkflowStep" in updates and updates["currentWorkflowStep"] is not None:
            session["currentWorkflowStep"] = updates["currentWorkflowStep"]
        if "status" in updates and updates["status"] is not None:
            session["status"] = updates["status"]

        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[dict]:
        return self.sessions.get(session_id)

    def save_clinical_history(self, encounter_id: str, patient_id: str, history_data: dict) -> dict:
        now = datetime.datetime.now().isoformat()
        existing = self.clinical_histories.get(encounter_id, {
            "encounterId": encounter_id,
            "patientId": patient_id,
            "chiefComplaint": None,
            "hpi": None,
            "pastMedicalHistory": None,
            "medications": [],
            "allergies": [],
            "familyHistory": None,
            "personalHistory": None,
            "reviewOfSystems": None,
            "investigations": [],
            "currentSection": 1,
            "completionStatus": "IN_PROGRESS",
            "updatedAt": now
        })

        for key, value in history_data.items():
            if value is not None:
                existing[key] = value

        existing["updatedAt"] = now
        self.clinical_histories[encounter_id] = existing
        return existing

    def get_clinical_history(self, encounter_id: str) -> Optional[dict]:
        return self.clinical_histories.get(encounter_id)

    def create_conversation(self, encounter_id: str, patient_id: str, session_id: Optional[str] = None, language_preference: str = "en") -> dict:
        conv_id = f"CONV-{random.randint(10000, 99999)}"
        now = datetime.datetime.now().isoformat()
        conv = {
            "conversationId": conv_id,
            "encounterId": encounter_id,
            "patientId": patient_id,
            "sessionId": session_id,
            "languagePreference": language_preference,
            "status": "ACTIVE",
            "questionCount": 0,
            "maxQuestions": 4,
            "mode": "DETERMINISTIC_FALLBACK",
            "messages": [],
            "createdAt": now,
            "updatedAt": now
        }
        self.conversations[conv_id] = conv
        return conv

    def get_conversation(self, conversation_id: str) -> Optional[dict]:
        return self.conversations.get(conversation_id)

    def record_answer(self, conversation_id: str, target_section: str, target_field: str, answer_value: str) -> Optional[dict]:
        conv = self.conversations.get(conversation_id)
        if not conv:
            return None

        now = datetime.datetime.now().isoformat()
        conv["questionCount"] += 1
        conv["updatedAt"] = now
        conv["messages"].append({
            "targetSection": target_section,
            "targetField": target_field,
            "answer": answer_value,
            "timestamp": now,
            "source": "AI_CLARIFICATION"
        })

        # Update clinical history for the encounter
        encounter_id = conv["encounterId"]
        patient_id = conv["patientId"]
        history = self.get_clinical_history(encounter_id) or {
            "encounterId": encounter_id,
            "patientId": patient_id,
            "chiefComplaint": {},
            "hpi": {},
            "pastMedicalHistory": {},
            "medications": [],
            "allergies": [],
            "familyHistory": {},
            "personalHistory": {},
            "reviewOfSystems": {},
            "investigations": [],
            "currentSection": 8,
            "completionStatus": "IN_PROGRESS",
            "updatedAt": now
        }

        # Dynamically write answer into target section
        sec = target_section.lower()
        if sec == "hpi":
            if "hpi" not in history or not history["hpi"]:
                history["hpi"] = {}
            history["hpi"][target_field] = answer_value
        elif sec == "chiefcomplaint":
            if "chiefComplaint" not in history or not history["chiefComplaint"]:
                history["chiefComplaint"] = {}
            history["chiefComplaint"][target_field] = answer_value
        elif sec == "reviewofsystems":
            if "reviewOfSystems" not in history or not history["reviewOfSystems"]:
                history["reviewOfSystems"] = {"general": []}
            if isinstance(history["reviewOfSystems"].get("general"), list):
                history["reviewOfSystems"]["general"].append(f"{target_field}: {answer_value}")

        self.clinical_histories[encounter_id] = history
        self.conversations[conversation_id] = conv
        return conv

    def save_safety_assessment(self, encounter_id: str, assessment_data: dict) -> dict:
        self.safety_assessments[encounter_id] = assessment_data
        return assessment_data

    def get_safety_assessment(self, encounter_id: str) -> Optional[dict]:
        return self.safety_assessments.get(encounter_id)

    def save_document(self, doc_data: dict) -> dict:
        doc_id = doc_data.get("documentId")
        self.documents[doc_id] = doc_data
        return doc_data

    def get_document(self, document_id: str) -> Optional[dict]:
        return self.documents.get(document_id)

    def list_encounter_documents(self, encounter_id: str) -> list[dict]:
        return [doc for doc in self.documents.values() if doc.get("encounterId") == encounter_id]

store = DataStore()



