import random
import datetime
from typing import Dict, Optional

class DataStore:
    def __init__(self):
        self.patients: Dict[str, dict] = {
            "PAT-10928": {
                "id": "PAT-10928",
                "name": "Rajesh Kumar",
                "age": 45,
                "gender": "Male",
                "phone": "+91 98765 43210",
                "abhaId": "14-8829-1029-4829",
                "verificationStatus": "Prototype Sandbox Verified",
                "identityMethod": "ABHA",
                "createdAt": datetime.datetime.now().isoformat()
            }
        }
        self.encounters: Dict[str, dict] = {}
        self.sessions: Dict[str, dict] = {}

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

    def identify_abha(self, abha_id: str) -> dict:
        # Check if existing or generate prototype sandbox patient
        for p in self.patients.values():
            if p.get("abhaId") == abha_id:
                return p
        
        patient_id = self.generate_patient_id()
        patient = {
            "id": patient_id,
            "name": "Devendra Sharma (Demo)",
            "age": 52,
            "gender": "Male",
            "phone": "+91 98123 45678",
            "abhaId": abha_id,
            "verificationStatus": "Sandbox Verified",
            "identityMethod": "ABHA",
            "createdAt": datetime.datetime.now().isoformat()
        }
        self.patients[patient_id] = patient
        return patient

    def identify_aadhaar(self, aadhaar_number: str) -> dict:
        # Sandbox verification - NEVER store real Aadhaar!
        patient_id = self.generate_patient_id()
        masked_aadhaar = f"XXXX-XXXX-{aadhaar_number[-4:] if len(aadhaar_number) >= 4 else '1234'}"
        patient = {
            "id": patient_id,
            "name": "Priya Patel (Demo)",
            "age": 38,
            "gender": "Female",
            "phone": "+91 97654 32109",
            "abhaId": f"99-{random.randint(1000,9999)}-{random.randint(1000,9999)}-{random.randint(1000,9999)}",
            "verificationStatus": f"Aadhaar Sandbox Verified ({masked_aadhaar})",
            "identityMethod": "AADHAAR",
            "createdAt": datetime.datetime.now().isoformat()
        }
        self.patients[patient_id] = patient
        return patient

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

    def create_session(self, patient_id: str, encounter_id: str, current_step: str = "IDENTITY") -> dict:
        session_id = self.generate_session_id()
        now = datetime.datetime.now().isoformat()
        session = {
            "sessionId": session_id,
            "patientId": patient_id,
            "encounterId": encounter_id,
            "createdTimestamp": now,
            "lastActivityTimestamp": now,
            "currentWorkflowStep": current_step,
            "status": "ACTIVE"
        }
        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[dict]:
        return self.sessions.get(session_id)

store = DataStore()
