"""
MediKiosk Phase 10 Backend Test Suite — Clinical Summary Engine
Comprehensive test suite verifying deterministic intake summary aggregation,
safety preservation (EMERGENCY non-downgrading), missing field handling,
provenance tracking, patient isolation, and summary update behavior.
"""

import sys
import os
import unittest

# Ensure app module can be imported
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.services.store import store
from app.services.clinical_summary import ClinicalSummaryEngine

class TestPhase10ClinicalSummary(unittest.TestCase):

    def setUp(self):
        # Reset store before each test
        store.patients.clear()
        store.encounters.clear()
        store.sessions.clear()
        store.clinical_histories.clear()
        store.conversations.clear()
        store.safety_assessments.clear()
        store.documents.clear()
        store.entities.clear()
        store.timelines.clear()
        store.summaries.clear()

        self.client = TestClient(app)

        # Setup standard patient & encounter
        self.patient_id = "PAT-SUMM-001"
        self.encounter_id = "ENC-SUMM-001"
        self.session_id = "SES-SUMM-001"

        store.save_patient({
            "id": self.patient_id,
            "name": "Devendra Sharma",
            "age": 52,
            "gender": "Male",
            "phone": "+91 98123 45678",
            "abhaId": "91-4432-8819-2091",
            "verificationStatus": "Sandbox ABDM Verified",
            "identityMethod": "ABHA",
            "createdAt": "2026-09-12T10:00:00"
        })

        store.save_encounter({
            "id": self.encounter_id,
            "patientId": self.patient_id,
            "createdAt": "2026-09-12T10:05:00",
            "status": "In-Progress",
            "source": "MediKiosk",
            "workflowStatus": "IDENTITY_VERIFIED"
        })

    def test_1_summary_generation_complete_history(self):
        """Test 1: Summary generation with complete structured clinical history."""
        store.save_clinical_history(self.encounter_id, self.patient_id, {
            "chiefComplaint": {
                "primarySymptom": "Chest Tightness & Shortness of Breath",
                "onset": "2 hours ago",
                "duration": "2 hours",
                "description": "Sudden onset during exercise"
            },
            "hpi": {
                "severity": 8,
                "location": "Substernal",
                "character": "Heavy pressure",
                "aggravatingFactors": "Exertion",
                "relievingFactors": "Rest"
            },
            "pastMedicalHistory": {
                "conditions": ["Coronary Artery Disease", "Hyperlipidemia"]
            },
            "medications": [
                {"name": "Atorvastatin", "dose": "20mg", "frequency": "Once daily"}
            ],
            "allergies": [
                {"allergen": "Aspirin", "reaction": "Bronchospasm"}
            ]
        })

        response = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["encounterId"], self.encounter_id)
        self.assertEqual(data["chiefComplaint"]["primarySymptom"], "Chest Tightness & Shortness of Breath")
        self.assertIn("Coronary Artery Disease", data["pastMedicalHistory"]["conditions"])
        self.assertEqual(len(data["currentMedications"]), 1)
        self.assertEqual(data["currentMedications"][0]["name"], "Atorvastatin")
        self.assertEqual(len(data["allergies"]), 1)

    def test_2_summary_generation_minimal_history(self):
        """Test 2: Summary generation with minimal history handles missing fields gracefully."""
        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["chiefComplaint"]["primarySymptom"], "Not reported")
        self.assertEqual(data["hpi"]["severity"], "Not reported")
        self.assertIn("Chief Complaint", data["missingInformation"])
        self.assertIn("Past Medical History", data["missingInformation"])

    def test_3_ai_clarification_appears(self):
        """Test 3: Phase 5 AI clarifications appear in HPI summary section."""
        conv_id = "CONV-SUMM-1"
        store.conversations[conv_id] = {
            "conversationId": conv_id,
            "encounterId": self.encounter_id,
            "patientId": self.patient_id,
            "messages": [
                {
                    "targetSection": "hpi",
                    "targetField": "dyspneaSeverity",
                    "answer": "Moderate breathlessness on walking",
                    "timestamp": "2026-09-12T10:12:00"
                }
            ]
        }

        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        data = res.json()
        ai_items = data["hpi"]["aiClarifications"]
        self.assertTrue(len(ai_items) > 0)
        self.assertEqual(ai_items[0]["answer"], "Moderate breathlessness on walking")
        self.assertEqual(ai_items[0]["provenance"], "AI_CLARIFICATION")

    def test_4_phase8_entities_appear(self):
        """Test 4: Phase 8 extracted clinical entities appear in summary with OCR provenance."""
        store.save_entities(self.encounter_id, {
            "encounterId": self.encounter_id,
            "patientId": self.patient_id,
            "conditions": [{"name": "Type 2 Diabetes", "status": "Controlled", "sourceDocumentId": "DOC-1", "sourceSnippet": "T2DM", "provenance": "OCR_EXTRACTED_ENTITY"}],
            "medications": [{"medicationName": "Metformin", "dose": "500mg", "frequency": "BD", "sourceDocumentId": "DOC-1", "sourceSnippet": "Tab Metformin 500mg BD", "provenance": "OCR_EXTRACTED_ENTITY"}],
            "allergies": [], "symptoms": [], "procedures": [],
            "investigations": [{"testName": "HbA1c", "resultValue": "7.1", "unit": "%", "referenceRange": "< 5.7%", "date": "10/09/2026", "sourceDocumentId": "DOC-1", "sourceSnippet": "HbA1c: 7.1%", "provenance": "OCR_EXTRACTED_ENTITY"}],
            "vitals": [{"type": "Blood Pressure", "value": "130/80", "unit": "mmHg", "date": "10/09/2026", "sourceDocumentId": "DOC-1", "sourceSnippet": "BP 130/80", "provenance": "OCR_EXTRACTED_ENTITY"}],
            "totalEntities": 4,
            "extractedAt": "2026-09-12T10:20:00"
        })

        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        data = res.json()

        self.assertTrue(any("Metformin" in m["name"] for m in data["currentMedications"]))
        self.assertTrue(len(data["investigationsVitals"]["investigations"]) > 0)
        self.assertEqual(data["investigationsVitals"]["investigations"][0]["testName"], "HbA1c")

    def test_5_phase9_timeline_represented(self):
        """Test 5: Timeline summary section includes total event count & recent events."""
        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        data = res.json()
        self.assertIn("timelineSummary", data)
        self.assertGreaterEqual(data["timelineSummary"]["totalEvents"], 1)

    def test_6_documents_represented(self):
        """Test 6: Uploaded documents appear under documentDerivedInfo."""
        store.save_document({
            "documentId": "DOC-SUMMARY-1",
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "documentType": "LAB_REPORT",
            "fileName": "lab_results.pdf",
            "mimeType": "application/pdf",
            "status": "OCR_COMPLETE",
            "extractedText": "Blood Glucose: 140 mg/dL",
            "ocrConfidence": 0.96,
            "createdAt": "2026-09-12T10:15:00",
            "updatedAt": "2026-09-12T10:15:00"
        })

        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        data = res.json()

        self.assertEqual(data["documentDerivedInfo"]["documentCount"], 1)
        self.assertEqual(data["documentDerivedInfo"]["documents"][0]["fileName"], "lab_results.pdf")

    def test_7_safety_assessment_preserved(self):
        """Test 7: Phase 6 safety assessment is preserved with exact status."""
        store.save_safety_assessment(self.encounter_id, {
            "safetyAssessmentId": "SAF-SUMM-1",
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "status": "NO_IMMEDIATE_FLAG",
            "ruleIds": [],
            "triggeredFindings": [],
            "patientGuidance": "Standard OPD review.",
            "clinicianGuidance": "Deterministic check complete.",
            "ruleVersion": "1.0",
            "createdAt": "2026-09-12T10:10:00"
        })

        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        data = res.json()
        self.assertEqual(data["safetyAssessment"]["status"], "NO_IMMEDIATE_FLAG")

    def test_8_emergency_safety_status_not_downgraded(self):
        """Test 8: EMERGENCY safety status is preserved strictly without modification or downgrade."""
        store.save_safety_assessment(self.encounter_id, {
            "safetyAssessmentId": "SAF-EMERGENCY-99",
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "status": "EMERGENCY",
            "ruleIds": ["RULE-RED-CHEST-PAIN-01"],
            "triggeredFindings": [{"ruleId": "RULE-RED-CHEST-PAIN-01", "finding": "Severe crushing chest pain", "field": "primarySymptom", "value": "Chest Pain"}],
            "patientGuidance": "EMERGENCY: Immediate medical triage required.",
            "clinicianGuidance": "CRITICAL: Patient reported severe red flag chest pain.",
            "ruleVersion": "1.0",
            "createdAt": "2026-09-12T10:10:00"
        })

        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        data = res.json()

        self.assertEqual(data["safetyAssessment"]["status"], "EMERGENCY")
        self.assertEqual(len(data["safetyAssessment"]["triggeredFindings"]), 1)

    def test_9_missing_fields_represented_correctly(self):
        """Test 9: Missing fields explicitly list unreported sections."""
        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        data = res.json()
        self.assertTrue(len(data["missingInformation"]) > 0)
        self.assertIn("Chief Complaint", data["missingInformation"])

    def test_10_no_hallucinated_clinical_information(self):
        """Test 10: Summary does not invent diagnoses, medications, or prescriptions."""
        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        data = res.json()

        self.assertNotIn("pneumonia", str(data).lower())
        self.assertNotIn("prescribed antibiotics", str(data).lower())
        self.assertIn("physicianVerificationNotice", data)

    def test_11_provenance_preserved(self):
        """Test 11: Explicit provenance tags exist across summary sections."""
        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        data = res.json()

        self.assertEqual(data["patientHeader"]["provenance"], "SYSTEM_RECORDED")
        self.assertEqual(data["safetyAssessment"]["provenance"], "SAFETY_ENGINE")

    def test_12_patient_isolation(self):
        """Test 12: Requesting summary with wrong patient_id returns 403 Forbidden."""
        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id=PAT-WRONG-999")
        self.assertEqual(res.status_code, 403)

    def test_13_cross_patient_access_rejected(self):
        """Test 13: GET endpoint with mismatched patient_id returns 403 Forbidden."""
        res = self.client.get(f"/api/encounters/{self.encounter_id}/summary?patient_id=PAT-WRONG-999")
        self.assertEqual(res.status_code, 403)

    def test_14_multiple_documents(self):
        """Test 14: Multiple documents for single encounter are aggregated into summary."""
        for idx in range(2):
            store.save_document({
                "documentId": f"DOC-MULTI-{idx}",
                "patientId": self.patient_id,
                "encounterId": self.encounter_id,
                "documentType": "LAB_REPORT",
                "fileName": f"report_{idx}.pdf",
                "mimeType": "application/pdf",
                "status": "OCR_COMPLETE",
                "extractedText": f"Result {idx}: Normal",
                "ocrConfidence": 0.95,
                "createdAt": f"2026-09-12T10:{idx+10}:00",
                "updatedAt": f"2026-09-12T10:{idx+10}:00"
            })

        res = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        data = res.json()
        self.assertEqual(data["documentDerivedInfo"]["documentCount"], 2)

    def test_15_empty_minimal_encounter_handling(self):
        """Test 15: Minimal encounter handles generation cleanly."""
        empty_enc = "ENC-EMPTY-99"
        empty_pat = "PAT-EMPTY-99"
        store.save_encounter({
            "id": empty_enc, "patientId": empty_pat, "createdAt": "2026-09-12T11:00:00",
            "status": "In-Progress", "source": "MediKiosk", "workflowStatus": "IDENTITY_VERIFIED"
        })

        res = self.client.post(f"/api/encounters/{empty_enc}/summary?patient_id={empty_pat}")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["encounterId"], empty_enc)

    def test_16_summary_retrieval(self):
        """Test 16: GET endpoint retrieves previously generated summary."""
        self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        res = self.client.get(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["encounterId"], self.encounter_id)

    def test_17_summary_regeneration_update_behavior(self):
        """Test 17: Re-posting to summary endpoint refreshes and updates payload."""
        res1 = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        gen_time1 = res1.json()["generatedAt"]

        # Add new medication to history
        store.save_clinical_history(self.encounter_id, self.patient_id, {
            "medications": [{"name": "Amlodipine", "dose": "5mg"}]
        })

        res2 = self.client.post(f"/api/encounters/{self.encounter_id}/summary?patient_id={self.patient_id}")
        data2 = res2.json()

        self.assertEqual(len(data2["currentMedications"]), 1)
        self.assertEqual(data2["currentMedications"][0]["name"], "Amlodipine")


if __name__ == "__main__":
    unittest.main()
