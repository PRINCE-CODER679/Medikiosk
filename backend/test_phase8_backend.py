import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.store import store
from app.services.entity_extraction import ClinicalEntityExtractor, PROVENANCE

class TestPhase8Backend(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_1_condition_extraction(self):
        doc = {
            "documentId": "DOC-101",
            "extractedText": "Patient has history of Stage 1 Prehypertension and Type 2 Diabetes."
        }
        res = ClinicalEntityExtractor.extract_from_documents([doc], "PAT-101", "ENC-101")
        self.assertTrue(len(res["conditions"]) >= 2)
        names = [c["name"].lower() for c in res["conditions"]]
        self.assertIn("prehypertension", names)
        self.assertIn("type 2 diabetes", names)
        self.assertEqual(res["conditions"][0]["provenance"], PROVENANCE)

    def test_2_medication_extraction(self):
        doc = {
            "documentId": "DOC-102",
            "extractedText": "Rx:\n1. Tab. Amlodipine 5mg — 1 tablet once daily (OD)\n2. Tab. Paracetamol 500mg — PRN for fever"
        }
        res = ClinicalEntityExtractor.extract_from_documents([doc], "PAT-101", "ENC-101")
        self.assertEqual(len(res["medications"]), 2)
        med_names = [m["medicationName"].lower() for m in res["medications"]]
        self.assertIn("amlodipine", med_names)
        self.assertIn("paracetamol", med_names)

        aml = next(m for m in res["medications"] if "amlodipine" in m["medicationName"].lower())
        self.assertEqual(aml["dose"], "5mg")
        self.assertEqual(aml["frequency"], "Once daily (OD)")

    def test_3_allergy_extraction(self):
        doc = {
            "documentId": "DOC-103",
            "extractedText": "Allergies: Penicillin (Severe rash)"
        }
        res = ClinicalEntityExtractor.extract_from_documents([doc], "PAT-101", "ENC-101")
        self.assertEqual(len(res["allergies"]), 1)
        self.assertEqual(res["allergies"][0]["allergen"].lower(), "penicillin")
        self.assertEqual(res["allergies"][0]["reaction"], "Severe rash")

    def test_4_symptom_extraction(self):
        doc = {
            "documentId": "DOC-104",
            "extractedText": "Patient complains of mild headache and severe fever."
        }
        res = ClinicalEntityExtractor.extract_from_documents([doc], "PAT-101", "ENC-101")
        self.assertTrue(len(res["symptoms"]) >= 2)
        s_names = [s["symptomName"].lower() for s in res["symptoms"]]
        self.assertIn("headache", s_names)
        self.assertIn("fever", s_names)

    def test_5_procedure_extraction(self):
        doc = {
            "documentId": "DOC-105",
            "extractedText": "Past Surgical History: Appendectomy in 2021."
        }
        res = ClinicalEntityExtractor.extract_from_documents([doc], "PAT-101", "ENC-101")
        self.assertEqual(len(res["procedures"]), 1)
        self.assertEqual(res["procedures"][0]["procedureName"].lower(), "appendectomy")

    def test_6_investigation_lab_extraction(self):
        doc = {
            "documentId": "DOC-106",
            "extractedText": "LABORATORY RESULTS:\n- Hemoglobin (Hb): 13.8 g/dL (Ref Range: 13.5 - 17.5 g/dL)\n- Fasting Blood Sugar (FBS): 112 mg/dL"
        }
        res = ClinicalEntityExtractor.extract_from_documents([doc], "PAT-101", "ENC-101")
        self.assertEqual(len(res["investigations"]), 2)
        hb = next(i for i in res["investigations"] if "hemoglobin" in i["testName"].lower())
        self.assertEqual(hb["resultValue"], "13.8")
        self.assertEqual(hb["unit"], "g/dL")

    def test_7_vital_extraction(self):
        doc = {
            "documentId": "DOC-107",
            "extractedText": "Vitals: Blood Pressure: 138/88 mmHg, Pulse: 72 bpm, SpO2: 98%"
        }
        res = ClinicalEntityExtractor.extract_from_documents([doc], "PAT-101", "ENC-101")
        self.assertTrue(len(res["vitals"]) >= 2)
        v_types = [v["type"].lower() for v in res["vitals"]]
        self.assertIn("blood pressure", v_types)

    def test_8_no_hallucination_of_missing_info(self):
        doc = {
            "documentId": "DOC-108",
            "extractedText": "Tab Paracetamol 500mg"
        }
        res = ClinicalEntityExtractor.extract_from_documents([doc], "PAT-101", "ENC-101")
        self.assertEqual(len(res["medications"]), 1)
        med = res["medications"][0]
        self.assertIsNone(med["frequency"])
        self.assertIsNone(med["duration"])
        self.assertIsNone(med["reason"])

    def test_9_duplicate_entity_handling(self):
        doc1 = {"documentId": "DOC-109A", "extractedText": "Blood Pressure: 120/80 mmHg"}
        doc2 = {"documentId": "DOC-109B", "extractedText": "Blood Pressure: 120/80 mmHg"}
        res = ClinicalEntityExtractor.extract_from_documents([doc1, doc2], "PAT-101", "ENC-101")
        # Identical vitals should be deduplicated
        self.assertEqual(len(res["vitals"]), 1)

    def test_10_patient_encounter_isolation(self):
        # Create Patient A & Encounter A
        p_a = store.register_patient(name="Phase 8 Patient A", age=35, gender="Male")
        enc_a = store.create_encounter(patient_id=p_a["id"])

        # Create Patient B & Encounter B
        p_b = store.register_patient(name="Phase 8 Patient B", age=42, gender="Female")
        enc_b = store.create_encounter(patient_id=p_b["id"])

        # Patient B trying to access Encounter A's entities should be rejected (403)
        resp = self.client.get(f"/api/encounters/{enc_a['id']}/entities?patient_id={p_b['id']}")
        self.assertEqual(resp.status_code, 403)

        resp_ext = self.client.post(f"/api/encounters/{enc_a['id']}/entities/extract?patient_id={p_b['id']}")
        self.assertEqual(resp_ext.status_code, 403)

    def test_11_empty_poor_ocr_text_handling(self):
        doc = {"documentId": "DOC-111", "extractedText": "--- ??? ---   \n   \n"}
        res = ClinicalEntityExtractor.extract_from_documents([doc], "PAT-101", "ENC-101")
        self.assertEqual(res["totalEntities"], 0)
        self.assertEqual(len(res["conditions"]), 0)

    def test_12_multiple_documents_for_one_encounter(self):
        p = store.register_patient(name="MultiDoc Patient", age=50, gender="Male")
        enc = store.create_encounter(patient_id=p["id"])

        doc1 = {
            "documentId": "DOC-MULTI-1",
            "patientId": p["id"],
            "encounterId": enc["id"],
            "documentType": "LAB_REPORT",
            "fileName": "lab.pdf",
            "mimeType": "application/pdf",
            "status": "OCR_COMPLETE",
            "extractedText": "Hemoglobin (Hb): 14.2 g/dL",
            "ocrConfidence": 0.95,
            "source": "OCR_EXTRACTED",
            "createdAt": "2026-09-12T00:00:00",
            "updatedAt": "2026-09-12T00:00:00"
        }

        doc2 = {
            "documentId": "DOC-MULTI-2",
            "patientId": p["id"],
            "encounterId": enc["id"],
            "documentType": "PRESCRIPTION",
            "fileName": "prescription.pdf",
            "mimeType": "application/pdf",
            "status": "OCR_COMPLETE",
            "extractedText": "Tab. Amlodipine 5mg — 1 tablet once daily",
            "ocrConfidence": 0.95,
            "source": "OCR_EXTRACTED",
            "createdAt": "2026-09-12T00:00:00",
            "updatedAt": "2026-09-12T00:00:00"
        }

        store.save_document(doc1)
        store.save_document(doc2)

        resp = self.client.post(f"/api/encounters/{enc['id']}/entities/extract?patient_id={p['id']}")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["totalEntities"] >= 2)
        self.assertTrue(len(data["investigations"]) >= 1)
        self.assertTrue(len(data["medications"]) >= 1)

if __name__ == "__main__":
    unittest.main()
