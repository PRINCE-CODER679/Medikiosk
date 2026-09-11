"""
MediKiosk Phase 9 Backend Test Suite — Medical Timeline & Patient Record
Comprehensive test suite verifying timeline aggregation, provenance preservation,
date distinction (clinicalDate vs systemTimestamp), deduplication, and strict patient isolation.
"""

import sys
import os
import unittest

# Ensure app module can be imported
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.services.store import store
from app.services.timeline import TimelineBuilder
from app.services.entity_extraction import ClinicalEntityExtractor

class TestPhase9MedicalTimeline(unittest.TestCase):

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

        self.client = TestClient(app)

        # Setup standard patient & encounter
        self.patient_id = "PAT-TEST-001"
        self.encounter_id = "ENC-TEST-001"
        self.session_id = "SES-TEST-001"

        store.save_patient({
            "id": self.patient_id,
            "name": "Rajesh Sharma",
            "age": 48,
            "gender": "Male",
            "phone": "+91 98765 43210",
            "abhaId": "14-9988-7766-5544",
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

        store.save_session({
            "sessionId": self.session_id,
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "languagePreference": "en",
            "accessibilityPreferences": {},
            "consentStatus": "granted",
            "consentTimestamp": "2026-09-12T10:02:00",
            "createdTimestamp": "2026-09-12T10:01:00",
            "lastActivityTimestamp": "2026-09-12T10:05:00",
            "currentWorkflowStep": "HISTORY_REVIEW",
            "status": "ACTIVE"
        })

    def test_1_timeline_creation_and_build(self):
        """Test 1: Timeline creation & API build endpoint returns valid schema."""
        response = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["encounterId"], self.encounter_id)
        self.assertEqual(data["patientId"], self.patient_id)
        self.assertIn("items", data)
        self.assertGreaterEqual(data["totalItems"], 1)
        self.assertEqual(data["items"][0]["eventType"], "ENCOUNTER")

    def test_2_structured_history_appears(self):
        """Test 2: Phase 4 structured history items appear with STRUCTURED_HISTORY provenance."""
        store.save_clinical_history(self.encounter_id, {
            "encounterId": self.encounter_id,
            "patientId": self.patient_id,
            "chiefComplaint": {
                "primarySymptom": "Persistent Dry Cough",
                "onset": "5 days ago",
                "duration": "5 days",
                "description": "Worse at night"
            },
            "pastMedicalHistory": {
                "conditions": ["Type 2 Diabetes", "Asthma"]
            },
            "updatedAt": "2026-09-12T10:10:00"
        })

        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data = res.json()
        items = data["items"]

        cc_items = [i for i in items if i["eventType"] == "CHIEF_COMPLAINT"]
        hist_items = [i for i in items if i["eventType"] == "CLINICAL_HISTORY"]

        self.assertTrue(len(cc_items) > 0)
        self.assertIn("Persistent Dry Cough", cc_items[0]["title"])
        self.assertEqual(cc_items[0]["source"], "STRUCTURED_HISTORY")
        self.assertEqual(cc_items[0]["provenance"], "PATIENT_REPORTED")

        self.assertTrue(len(hist_items) >= 2)
        cond_titles = [h["title"] for h in hist_items]
        self.assertTrue(any("Diabetes" in t for t in cond_titles))

    def test_3_ai_clarification_appears(self):
        """Test 3: Phase 5 AI clarification questions & answers appear in timeline."""
        conv_id = "CONV-TEST-99"
        store.conversations[conv_id] = {
            "conversationId": conv_id,
            "encounterId": self.encounter_id,
            "patientId": self.patient_id,
            "messages": [
                {
                    "questionId": "Q1",
                    "question": "Is your cough dry or productive?",
                    "targetSection": "hpi",
                    "targetField": "sputumType",
                    "answer": "Dry Cough without phlegm",
                    "timestamp": "2026-09-12T10:12:00"
                }
            ]
        }

        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data = res.json()

        ai_items = [i for i in data["items"] if i["eventType"] == "AI_CLARIFICATION"]
        self.assertTrue(len(ai_items) > 0)
        self.assertEqual(ai_items[0]["source"], "AI_CLARIFICATION")
        self.assertIn("Dry Cough without phlegm", ai_items[0]["description"])

    def test_4_safety_assessment_appears(self):
        """Test 4: Phase 6 safety assessment appears with SAFETY_ENGINE provenance."""
        store.save_safety_assessment(self.encounter_id, {
            "safetyAssessmentId": "SAF-9901",
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "status": "NO_IMMEDIATE_FLAG",
            "ruleIds": [],
            "triggeredFindings": [],
            "patientGuidance": "No immediate red flags detected.",
            "clinicianGuidance": "Standard OPD review.",
            "ruleVersion": "1.0",
            "createdAt": "2026-09-12T10:15:00"
        })

        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data = res.json()

        saf_items = [i for i in data["items"] if i["eventType"] == "SAFETY_ASSESSMENT"]
        self.assertTrue(len(saf_items) > 0)
        self.assertEqual(saf_items[0]["source"], "SAFETY_ENGINE")
        self.assertEqual(saf_items[0]["provenance"], "SAFETY_ENGINE_RULE")

    def test_5_medical_documents_appear(self):
        """Test 5: Phase 7 uploaded medical documents appear with MEDICAL_DOCUMENT provenance."""
        doc_id = "DOC-LAB-101"
        store.save_document(self.encounter_id, {
            "documentId": doc_id,
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "documentType": "LAB_REPORT",
            "fileName": "blood_report.pdf",
            "mimeType": "application/pdf",
            "status": "OCR_COMPLETE",
            "extractedText": "Hemoglobin: 14.2 g/dL",
            "ocrConfidence": 0.98,
            "createdAt": "2026-09-12T10:18:00",
            "updatedAt": "2026-09-12T10:18:00"
        })

        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data = res.json()

        doc_items = [i for i in data["items"] if i["eventType"] == "DOCUMENT"]
        self.assertTrue(len(doc_items) > 0)
        self.assertEqual(doc_items[0]["source"], "MEDICAL_DOCUMENT")
        self.assertEqual(doc_items[0]["sourceDocumentId"], doc_id)

    def test_6_extracted_entities_appear(self):
        """Test 6: Phase 8 clinical entities extracted from documents appear in timeline."""
        doc_id = "DOC-MED-202"
        store.save_document(self.encounter_id, {
            "documentId": doc_id,
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "documentType": "PRESCRIPTION",
            "fileName": "rx.pdf",
            "mimeType": "application/pdf",
            "status": "OCR_COMPLETE",
            "extractedText": "Tab. Metformin 500mg — 1 tab twice daily. Diagnosis: Type 2 Diabetes Mellitus. BP: 128/82 mmHg.",
            "ocrConfidence": 0.97,
            "createdAt": "2026-09-12T10:20:00",
            "updatedAt": "2026-09-12T10:20:00"
        })

        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data = res.json()

        med_items = [i for i in data["items"] if i["eventType"] == "MEDICATION"]
        cond_items = [i for i in data["items"] if i["eventType"] == "CONDITION"]
        vital_items = [i for i in data["items"] if i["eventType"] == "VITAL"]

        self.assertTrue(len(med_items) > 0)
        self.assertIn("Metformin", med_items[0]["title"])
        self.assertTrue(len(cond_items) > 0)
        self.assertTrue(len(vital_items) > 0)

    def test_7_correct_provenance_preserved(self):
        """Test 7: Extracted OCR entities explicitly retain OCR_EXTRACTED_ENTITY provenance."""
        doc_id = "DOC-PROV-1"
        store.save_document(self.encounter_id, {
            "documentId": doc_id,
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "documentType": "LAB_REPORT",
            "fileName": "lab.pdf",
            "mimeType": "application/pdf",
            "status": "OCR_COMPLETE",
            "extractedText": "Hemoglobin (Hb): 13.5 g/dL",
            "ocrConfidence": 0.95,
            "createdAt": "2026-09-12T10:22:00",
            "updatedAt": "2026-09-12T10:22:00"
        })

        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data = res.json()

        inv_items = [i for i in data["items"] if i["eventType"] == "INVESTIGATION"]
        self.assertTrue(len(inv_items) > 0)
        self.assertEqual(inv_items[0]["source"], "OCR_EXTRACTED_ENTITY")
        self.assertEqual(inv_items[0]["provenance"], "OCR_EXTRACTED_ENTITY")

    def test_8_known_dates_handled_correctly(self):
        """Test 8: Known explicit clinical dates are stored in clinicalDate."""
        doc_id = "DOC-DATE-1"
        store.save_document(self.encounter_id, {
            "documentId": doc_id,
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "documentType": "LAB_REPORT",
            "fileName": "dated_report.pdf",
            "mimeType": "application/pdf",
            "status": "OCR_COMPLETE",
            "extractedText": "Date: 10/09/2026\nFasting Blood Sugar: 110 mg/dL",
            "ocrConfidence": 0.95,
            "createdAt": "2026-09-12T10:25:00",
            "updatedAt": "2026-09-12T10:25:00"
        })

        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data = res.json()

        inv_items = [i for i in data["items"] if i["eventType"] == "INVESTIGATION"]
        self.assertTrue(len(inv_items) > 0)
        self.assertEqual(inv_items[0]["clinicalDate"], "10/09/2026")
        self.assertIsNotNone(inv_items[0]["systemTimestamp"])

    def test_9_missing_dates_not_invented(self):
        """Test 9: When clinical date is unavailable, clinicalDate is None rather than fake date."""
        doc_id = "DOC-NODATE-1"
        store.save_document(self.encounter_id, {
            "documentId": doc_id,
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "documentType": "PRESCRIPTION",
            "fileName": "nodate.pdf",
            "mimeType": "application/pdf",
            "status": "OCR_COMPLETE",
            "extractedText": "Tab. Aspirin 75mg once daily",
            "ocrConfidence": 0.95,
            "createdAt": "2026-09-12T10:28:00",
            "updatedAt": "2026-09-12T10:28:00"
        })

        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data = res.json()

        med_items = [i for i in data["items"] if i["eventType"] == "MEDICATION"]
        self.assertTrue(len(med_items) > 0)
        self.assertIsNone(med_items[0]["clinicalDate"])

    def test_10_timeline_ordering(self):
        """Test 10: Timeline items are ordered chronologically by systemTimestamp."""
        store.save_clinical_history(self.encounter_id, {
            "encounterId": self.encounter_id,
            "patientId": self.patient_id,
            "chiefComplaint": {"primarySymptom": "Fever", "onset": "Yesterday"},
            "updatedAt": "2026-09-12T10:10:00"
        })
        store.save_safety_assessment(self.encounter_id, {
            "safetyAssessmentId": "SAF-ORD-1",
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "status": "NO_IMMEDIATE_FLAG",
            "patientGuidance": "OK",
            "clinicianGuidance": "OK",
            "createdAt": "2026-09-12T10:30:00"
        })

        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data = res.json()
        items = data["items"]

        timestamps = [i.get("systemTimestamp") for i in items if i.get("systemTimestamp")]
        self.assertEqual(timestamps, sorted(timestamps))

    def test_11_duplicate_handling(self):
        """Test 11: Identical clinical entities extracted across multiple docs are deduplicated."""
        doc1 = "DOC-DUP-1"
        doc2 = "DOC-DUP-2"
        store.save_document(self.encounter_id, {
            "documentId": doc1, "patientId": self.patient_id, "encounterId": self.encounter_id,
            "documentType": "LAB_REPORT", "fileName": "rep1.pdf", "mimeType": "application/pdf",
            "status": "OCR_COMPLETE", "extractedText": "Diagnosis: Hypertension Stage 1",
            "ocrConfidence": 0.95, "createdAt": "2026-09-12T10:00:00", "updatedAt": "2026-09-12T10:00:00"
        })
        store.save_document(self.encounter_id, {
            "documentId": doc2, "patientId": self.patient_id, "encounterId": self.encounter_id,
            "documentType": "DISCHARGE_SUMMARY", "fileName": "rep2.pdf", "mimeType": "application/pdf",
            "status": "OCR_COMPLETE", "extractedText": "Diagnosis: Hypertension Stage 1",
            "ocrConfidence": 0.95, "createdAt": "2026-09-12T10:05:00", "updatedAt": "2026-09-12T10:05:00"
        })

        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data = res.json()

        cond_items = [i for i in data["items"] if i["eventType"] == "CONDITION" and "Hypertension" in i["title"]]
        self.assertEqual(len(cond_items), 1)

    def test_12_patient_isolation(self):
        """Test 12: Requesting timeline with wrong patient_id returns 403 Forbidden."""
        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id=PAT-OTHER-999")
        self.assertEqual(res.status_code, 403)
        self.assertIn("mismatch", res.json()["detail"].lower())

    def test_13_empty_minimal_encounter_handling(self):
        """Test 13: Minimal encounter with no history or documents builds basic check-in timeline item."""
        empty_enc = "ENC-EMPTY-001"
        empty_pat = "PAT-EMPTY-001"
        store.save_encounter({
            "id": empty_enc,
            "patientId": empty_pat,
            "createdAt": "2026-09-12T11:00:00",
            "status": "In-Progress",
            "source": "MediKiosk",
            "workflowStatus": "IDENTITY_VERIFIED"
        })

        res = self.client.get(f"/api/encounters/{empty_enc}/timeline?patient_id={empty_pat}")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["totalItems"], 1)
        self.assertEqual(data["items"][0]["eventType"], "ENCOUNTER")

    def test_14_multiple_documents(self):
        """Test 14: Multiple documents for single encounter are aggregated properly."""
        for idx in range(3):
            d_id = f"DOC-MULTI-{idx}"
            store.save_document(self.encounter_id, {
                "documentId": d_id, "patientId": self.patient_id, "encounterId": self.encounter_id,
                "documentType": "LAB_REPORT", "fileName": f"doc_{idx}.pdf", "mimeType": "application/pdf",
                "status": "OCR_COMPLETE", "extractedText": f"WBC Count {idx+4},000 /uL",
                "ocrConfidence": 0.95, "createdAt": f"2026-09-12T10:{idx+10}:00", "updatedAt": f"2026-09-12T10:{idx+10}:00"
            })

        res = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data = res.json()

        doc_items = [i for i in data["items"] if i["eventType"] == "DOCUMENT"]
        self.assertEqual(len(doc_items), 3)

    def test_15_no_cross_patient_leakage(self):
        """Test 15: Cross-patient data isolation — Patient A items never bleed into Patient B timeline."""
        pat_a = "PAT-AAA-111"
        enc_a = "ENC-AAA-111"
        store.save_encounter({
            "id": enc_a, "patientId": pat_a, "createdAt": "2026-09-12T10:00:00",
            "status": "In-Progress", "source": "MediKiosk", "workflowStatus": "IDENTITY_VERIFIED"
        })
        store.save_clinical_history(enc_a, {
            "encounterId": enc_a, "patientId": pat_a,
            "chiefComplaint": {"primarySymptom": "PATIENT A SECRET SYMPTOM"},
            "updatedAt": "2026-09-12T10:00:00"
        })

        # Request Patient B's timeline
        res_b = self.client.get(f"/api/encounters/{self.encounter_id}/timeline?patient_id={self.patient_id}")
        data_b = res_b.json()

        for item in data_b["items"]:
            self.assertEqual(item["patientId"], self.patient_id)
            self.assertNotIn("PATIENT A SECRET SYMPTOM", item.get("description", ""))


if __name__ == "__main__":
    unittest.main()
