import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.store import store
from app.services.ocr_service import DocumentOCRService

client = TestClient(app)

class TestPhase7DocumentOCRBackend(unittest.TestCase):

    def setUp(self):
        # Setup demo patient, encounter, and session
        self.patient_id = "PAT-10928"
        self.encounter_id = "ENC-TEST-DOC-1"
        self.session_id = "SES-TEST-DOC-1"

        store.patients[self.patient_id] = {
            "id": self.patient_id,
            "name": "Ramesh Kumar",
            "age": 45,
            "gender": "Male",
            "abhaId": "14-8829-1029-4829",
            "verificationStatus": "Sandbox ABDM Verified",
            "identityMethod": "PATIENT_ID",
            "createdAt": "2026-09-11T10:00:00"
        }

        store.encounters[self.encounter_id] = {
            "id": self.encounter_id,
            "patientId": self.patient_id,
            "createdAt": "2026-09-11T10:05:00",
            "status": "active",
            "source": "MediKiosk",
            "workflowStatus": "IN_PROGRESS"
        }

        store.sessions[self.session_id] = {
            "sessionId": self.session_id,
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "languagePreference": "en",
            "consentStatus": "accepted",
            "currentWorkflowStep": "DOCUMENTS",
            "status": "active"
        }

    def test_01_valid_sample_demo_document_upload(self):
        """Test uploading a sample demo medical report and OCR text extraction."""
        response = client.post(
            f"/api/encounters/{self.encounter_id}/documents",
            data={
                "patient_id": self.patient_id,
                "document_type": "LAB_REPORT",
                "is_sample_demo": "true"
            },
            headers={"X-Session-ID": self.session_id}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["documentId"].startswith("DOC-"))
        self.assertEqual(data["patientId"], self.patient_id)
        self.assertEqual(data["encounterId"], self.encounter_id)
        self.assertEqual(data["source"], "OCR_EXTRACTED")
        self.assertEqual(data["status"], "OCR_COMPLETE")
        self.assertIn("Ramesh Kumar", data["extractedText"])
        self.assertIn("Hemoglobin", data["extractedText"])
        self.assertGreater(data["ocrConfidence"], 0.90)

    def test_02_custom_text_document_ocr_upload(self):
        """Test uploading a custom text document file."""
        file_content = b"Patient Lab Investigation\nHemoglobin: 14.2 g/dL\nWBC: 6,800 /uL\nBlood Pressure: 120/80 mmHg"
        response = client.post(
            f"/api/encounters/{self.encounter_id}/documents",
            data={
                "patient_id": self.patient_id,
                "document_type": "LAB_REPORT",
                "is_sample_demo": "false"
            },
            files={"file": ("lab_report.txt", file_content, "text/plain")},
            headers={"X-Session-ID": self.session_id}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["source"], "OCR_EXTRACTED")
        self.assertEqual(data["fileName"], "lab_report.txt")
        self.assertIn("Hemoglobin: 14.2 g/dL", data["extractedText"])

    def test_03_unsupported_file_extension_rejected(self):
        """Test that unsupported file extensions (.exe) are rejected with 400 Bad Request."""
        file_content = b"MZExecutableBinaryContent"
        response = client.post(
            f"/api/encounters/{self.encounter_id}/documents",
            data={
                "patient_id": self.patient_id,
                "document_type": "OTHER"
            },
            files={"file": ("malicious_script.exe", file_content, "application/octet-stream")},
            headers={"X-Session-ID": self.session_id}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Unsupported file extension", response.json()["detail"])

    def test_04_oversized_file_rejected(self):
        """Test that files exceeding 10MB limit are rejected."""
        large_bytes = b"0" * (11 * 1024 * 1024)  # 11 MB
        is_valid, msg = DocumentOCRService.validate_file("huge.png", "image/png", len(large_bytes))
        self.assertFalse(is_valid)
        self.assertIn("exceeds maximum allowed limit of 10 MB", msg)

    def test_05_list_encounter_documents(self):
        """Test retrieving all documents for a given encounter."""
        response = client.get(
            f"/api/encounters/{self.encounter_id}/documents?patient_id={self.patient_id}",
            headers={"X-Session-ID": self.session_id}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["encounterId"], self.encounter_id)
        self.assertEqual(data["patientId"], self.patient_id)
        self.assertGreaterEqual(len(data["documents"]), 1)

    def test_06_get_single_document_by_id(self):
        """Test fetching metadata & OCR extracted text for a specific document ID."""
        # Create a document first
        doc_data = {
            "documentId": "DOC-FETCH-999",
            "patientId": self.patient_id,
            "encounterId": self.encounter_id,
            "documentType": "PRESCRIPTION",
            "fileName": "prescription_test.jpg",
            "mimeType": "image/jpeg",
            "status": "OCR_COMPLETE",
            "extractedText": "Tab. Amlodipine 5mg OD",
            "ocrConfidence": 0.95,
            "source": "OCR_EXTRACTED",
            "createdAt": "2026-09-11T11:00:00",
            "updatedAt": "2026-09-11T11:00:00"
        }
        store.save_document(doc_data)

        response = client.get(f"/api/documents/DOC-FETCH-999")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["documentId"], "DOC-FETCH-999")
        self.assertEqual(data["source"], "OCR_EXTRACTED")
        self.assertEqual(data["extractedText"], "Tab. Amlodipine 5mg OD")

    def test_07_patient_isolation_enforced(self):
        """Test that requesting document upload for mismatched patient ID returns 403 Forbidden."""
        response = client.post(
            f"/api/encounters/{self.encounter_id}/documents",
            data={
                "patient_id": "PAT-HACKER-999",
                "is_sample_demo": "true"
            }
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("does not match encounter record", response.json()["detail"])

if __name__ == "__main__":
    unittest.main()
