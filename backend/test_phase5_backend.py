import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.store import store

class TestPhase5Backend(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_phase5_full_flow_and_isolation(self):
        # 1. Create Patient A & Encounter A
        patient_a = store.register_patient(name="Patient A", age=30, gender="Male")
        enc_a = store.create_encounter(patient_id=patient_a["id"])

        # 2. Create Patient B & Encounter B
        patient_b = store.register_patient(name="Patient B", age=40, gender="Female")
        enc_b = store.create_encounter(patient_id=patient_b["id"])

        # 3. Initialize Conversation for Patient A
        resp_a = self.client.post("/api/conversations", json={
            "encounterId": enc_a["id"],
            "patientId": patient_a["id"],
            "languagePreference": "en"
        })
        self.assertEqual(resp_a.status_code, 200)
        conv_a_id = resp_a.json()["conversationId"]
        self.assertEqual(resp_a.json()["patientId"], patient_a["id"])

        # 4. Initialize Conversation for Patient B
        resp_b = self.client.post("/api/conversations", json={
            "encounterId": enc_b["id"],
            "patientId": patient_b["id"],
            "languagePreference": "en"
        })
        self.assertEqual(resp_b.status_code, 200)
        conv_b_id = resp_b.json()["conversationId"]
        self.assertEqual(resp_b.json()["patientId"], patient_b["id"])

        # 5. Verify Patient A Question 1
        q1_a = self.client.post(f"/api/conversations/{conv_a_id}/next-question")
        self.assertEqual(q1_a.status_code, 200)
        self.assertEqual(q1_a.json()["questionId"], "Q-1")
        self.assertTrue(q1_a.json()["shouldContinue"])

        # 6. Patient A Submits Answer to Q1
        ans1_a = self.client.post(f"/api/conversations/{conv_a_id}/answer", json={
            "questionId": "Q-1",
            "targetSection": "hpi",
            "targetField": "sputumType",
            "answerValue": "Dry Cough"
        })
        self.assertEqual(ans1_a.status_code, 200)

        # 7. Verify Patient A Question 2
        q2_a = self.client.post(f"/api/conversations/{conv_a_id}/next-question")
        self.assertEqual(q2_a.status_code, 200)
        self.assertEqual(q2_a.json()["questionId"], "Q-2")

        # 8. Patient A Submits Answer to Q2
        ans2_a = self.client.post(f"/api/conversations/{conv_a_id}/answer", json={
            "questionId": "Q-2",
            "targetSection": "hpi",
            "targetField": "dyspneaSeverity",
            "answerValue": "Mild Breathlessness"
        })
        self.assertEqual(ans2_a.status_code, 200)

        # 9. Verify Patient A Question 3
        q3_a = self.client.post(f"/api/conversations/{conv_a_id}/next-question")
        self.assertEqual(q3_a.status_code, 200)
        self.assertEqual(q3_a.json()["questionId"], "Q-3")

        # 10. Patient A Submits Answer to Q3
        ans3_a = self.client.post(f"/api/conversations/{conv_a_id}/answer", json={
            "questionId": "Q-3",
            "targetSection": "hpi",
            "targetField": "aggravatingFactor",
            "answerValue": "Worse with Exertion"
        })
        self.assertEqual(ans3_a.status_code, 200)

        # 11. Verify Patient A Question 4 (Completion)
        q4_a = self.client.post(f"/api/conversations/{conv_a_id}/next-question")
        self.assertEqual(q4_a.status_code, 200)
        self.assertFalse(q4_a.json()["shouldContinue"])

        # 12. Verify Patient Isolation: Patient B's history is unaffected by Patient A's answers
        hist_a = store.get_clinical_history(enc_a["id"])
        hist_b = store.get_clinical_history(enc_b["id"])

        self.assertIsNotNone(hist_a)
        self.assertEqual(hist_a["hpi"]["sputumType"], "Dry Cough")
        self.assertEqual(hist_a["hpi"]["dyspneaSeverity"], "Mild Breathlessness")

        # Patient B's history should be empty or not contain Patient A's answers
        if hist_b and "hpi" in hist_b and hist_b["hpi"]:
            self.assertNotIn("sputumType", hist_b["hpi"])

if __name__ == "__main__":
    unittest.main()
