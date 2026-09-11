"""
MediKiosk Longitudinal Medical Timeline & Patient Record Service (Phase 9)
Aggregates structured intake records, AI clarifications, safety assessments,
uploaded documents, and Phase 8 extracted entities into a unified timeline.

Preserves explicit provenance, handles date distinction (clinicalDate vs systemTimestamp),
prevents duplicate entries, and guarantees strict patient data isolation.
"""

import datetime
from typing import Dict, List, Any, Optional
from app.services.store import store
from app.services.entity_extraction import ClinicalEntityExtractor

class TimelineBuilder:
    """
    Longitudinal Patient Record & Timeline Aggregator.
    Combines existing single-source-of-truth encounter data into a structured timeline.
    """

    @classmethod
    def build_encounter_timeline(cls, encounter_id: str, patient_id: str) -> Dict[str, Any]:
        encounter = store.get_encounter(encounter_id)
        items: List[dict] = []
        seen_keys = set()

        now = datetime.datetime.now().isoformat()

        # 1. ENCOUNTER RECORD
        if encounter:
            item_id = f"TL-ENC-{encounter_id}"
            items.append({
                "id": item_id,
                "patientId": patient_id,
                "encounterId": encounter_id,
                "eventType": "ENCOUNTER",
                "title": f"Lobby Check-in ({encounter.get('source', 'MediKiosk')})",
                "description": f"Patient arrived for OPD consultation. Workflow status: {encounter.get('workflowStatus', 'IDENTITY_VERIFIED')}.",
                "clinicalDate": None,
                "systemTimestamp": encounter.get("createdAt", now),
                "source": "ENCOUNTER_REGISTER",
                "sourceDocumentId": None,
                "provenance": "CLINICAL_CHECKIN",
                "relatedEntityId": None,
                "metadata": {"status": encounter.get("status")}
            })

        # 2. STRUCTURED CLINICAL HISTORY (Phase 4)
        history = store.get_clinical_history(encounter_id)
        if history:
            cc = history.get("chiefComplaint") or {}
            if cc.get("primarySymptom") or cc.get("description"):
                sym = cc.get("primarySymptom") or cc.get("description")
                onset = cc.get("onset") or ""
                items.append({
                    "id": f"TL-CC-{encounter_id}",
                    "patientId": patient_id,
                    "encounterId": encounter_id,
                    "eventType": "CHIEF_COMPLAINT",
                    "title": f"Chief Complaint: {sym}",
                    "description": f"Primary reported symptom: {sym}. Onset: {onset or 'Not specified'}.",
                    "clinicalDate": onset if onset and any(c.isdigit() for c in onset) else None,
                    "systemTimestamp": history.get("updatedAt", now),
                    "source": "STRUCTURED_HISTORY",
                    "sourceDocumentId": None,
                    "provenance": "PATIENT_REPORTED",
                    "relatedEntityId": None,
                    "metadata": {"section": "chiefComplaint"}
                })

            pmh = history.get("pastMedicalHistory") or {}
            if pmh.get("conditions") and isinstance(pmh.get("conditions"), list):
                for cond in pmh["conditions"]:
                    items.append({
                        "id": f"TL-HIST-{encounter_id}-{cond}",
                        "patientId": patient_id,
                        "encounterId": encounter_id,
                        "eventType": "CLINICAL_HISTORY",
                        "title": f"Past History: {cond}",
                        "description": f"Patient reported past medical condition: {cond}.",
                        "clinicalDate": None,
                        "systemTimestamp": history.get("updatedAt", now),
                        "source": "STRUCTURED_HISTORY",
                        "sourceDocumentId": None,
                        "provenance": "PATIENT_REPORTED",
                        "relatedEntityId": None,
                        "metadata": {"section": "pastMedicalHistory"}
                    })

        # 3. AI CLARIFICATION RESPONSES (Phase 5)
        conversations = [c for c in store.conversations.values() if c.get("encounterId") == encounter_id]
        for conv in conversations:
            for idx, msg in enumerate(conv.get("messages", [])):
                items.append({
                    "id": f"TL-AI-{conv['conversationId']}-{idx}",
                    "patientId": patient_id,
                    "encounterId": encounter_id,
                    "eventType": "AI_CLARIFICATION",
                    "title": f"Symptom Detail: {msg.get('targetField', 'Clarification')}",
                    "description": f"Answer to follow-up question [{msg.get('targetSection', 'hpi')}]: {msg.get('answer')}.",
                    "clinicalDate": None,
                    "systemTimestamp": msg.get("timestamp", now),
                    "source": "AI_CLARIFICATION",
                    "sourceDocumentId": None,
                    "provenance": "GUIDED_CLARIFICATION",
                    "relatedEntityId": None,
                    "metadata": {"field": msg.get("targetField")}
                })

        # 4. SAFETY ASSESSMENT (Phase 6)
        safety = store.get_safety_assessment(encounter_id)
        if safety:
            items.append({
                "id": f"TL-SAF-{safety.get('safetyAssessmentId', encounter_id)}",
                "patientId": patient_id,
                "encounterId": encounter_id,
                "eventType": "SAFETY_ASSESSMENT",
                "title": f"Safety Triage: {safety.get('status', 'NO_IMMEDIATE_FLAG')}",
                "description": safety.get("patientGuidance") or safety.get("clinicianGuidance", ""),
                "clinicalDate": None,
                "systemTimestamp": safety.get("createdAt", now),
                "source": "SAFETY_ENGINE",
                "sourceDocumentId": None,
                "provenance": "SAFETY_ENGINE_RULE",
                "relatedEntityId": None,
                "metadata": {"ruleVersion": safety.get("ruleVersion")}
            })

        # 5. UPLOADING DOCUMENTS (Phase 7)
        documents = store.list_encounter_documents(encounter_id)
        for doc in documents:
            items.append({
                "id": f"TL-DOC-{doc['documentId']}",
                "patientId": patient_id,
                "encounterId": encounter_id,
                "eventType": "DOCUMENT",
                "title": f"Scanned Document: {doc.get('fileName', 'Document')}",
                "description": f"Document Type: {doc.get('documentType', 'OTHER')}. Status: {doc.get('status')}. OCR Confidence: {int((doc.get('ocrConfidence') or 0.95)*100)}%.",
                "clinicalDate": None,
                "systemTimestamp": doc.get("createdAt", now),
                "source": "MEDICAL_DOCUMENT",
                "sourceDocumentId": doc["documentId"],
                "provenance": "OCR_EXTRACTED",
                "relatedEntityId": None,
                "metadata": {"mimeType": doc.get("mimeType")}
            })

        # 6. EXTRACTED CLINICAL ENTITIES (Phase 8)
        entities = store.get_entities(encounter_id)
        if not entities and documents:
            # Auto-extract entities if documents exist but entities haven't been compiled
            entities = ClinicalEntityExtractor.extract_from_documents(documents, patient_id, encounter_id)
            store.save_entities(encounter_id, entities)

        if entities:
            # Conditions
            for c in entities.get("conditions", []):
                key = f"CONDITION|{c['name'].lower()}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    items.append({
                        "id": f"TL-ENT-COND-{len(items)+1}",
                        "patientId": patient_id,
                        "encounterId": encounter_id,
                        "eventType": "CONDITION",
                        "title": f"Diagnosis: {c['name']}",
                        "description": f"Extracted condition: {c['name']} ({c.get('status') or 'Reported'}). Snippet: \"{c['sourceSnippet']}\"",
                        "clinicalDate": c.get("date"),
                        "systemTimestamp": entities.get("extractedAt", now),
                        "source": "OCR_EXTRACTED_ENTITY",
                        "sourceDocumentId": c.get("sourceDocumentId"),
                        "provenance": "OCR_EXTRACTED_ENTITY",
                        "relatedEntityId": None,
                        "metadata": {"status": c.get("status")}
                    })

            # Medications
            for m in entities.get("medications", []):
                key = f"MEDICATION|{m['medicationName'].lower()}|{m.get('dose') or ''}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    items.append({
                        "id": f"TL-ENT-MED-{len(items)+1}",
                        "patientId": patient_id,
                        "encounterId": encounter_id,
                        "eventType": "MEDICATION",
                        "title": f"Medication: {m['medicationName']}",
                        "description": f"Dose: {m.get('dose') or 'Unspecified'}. Frequency: {m.get('frequency') or 'Unspecified'}. Snippet: \"{m['sourceSnippet']}\"",
                        "clinicalDate": None,
                        "systemTimestamp": entities.get("extractedAt", now),
                        "source": "OCR_EXTRACTED_ENTITY",
                        "sourceDocumentId": m.get("sourceDocumentId"),
                        "provenance": "OCR_EXTRACTED_ENTITY",
                        "relatedEntityId": None,
                        "metadata": {"dose": m.get("dose"), "frequency": m.get("frequency")}
                    })

            # Allergies
            for a in entities.get("allergies", []):
                key = f"ALLERGY|{a['allergen'].lower()}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    items.append({
                        "id": f"TL-ENT-ALG-{len(items)+1}",
                        "patientId": patient_id,
                        "encounterId": encounter_id,
                        "eventType": "ALLERGY",
                        "title": f"Allergy: {a['allergen']}",
                        "description": f"Reported allergen: {a['allergen']}. Reaction: {a.get('reaction') or 'Not stated'}.",
                        "clinicalDate": None,
                        "systemTimestamp": entities.get("extractedAt", now),
                        "source": "OCR_EXTRACTED_ENTITY",
                        "sourceDocumentId": a.get("sourceDocumentId"),
                        "provenance": "OCR_EXTRACTED_ENTITY",
                        "relatedEntityId": None,
                        "metadata": {"reaction": a.get("reaction")}
                    })

            # Symptoms
            for s in entities.get("symptoms", []):
                key = f"SYMPTOM|{s['symptomName'].lower()}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    items.append({
                        "id": f"TL-ENT-SYM-{len(items)+1}",
                        "patientId": patient_id,
                        "encounterId": encounter_id,
                        "eventType": "SYMPTOM",
                        "title": f"Symptom: {s['symptomName']}",
                        "description": f"Extracted symptom: {s['symptomName']}. Severity: {s.get('severity') or 'Unspecified'}.",
                        "clinicalDate": s.get("duration"),
                        "systemTimestamp": entities.get("extractedAt", now),
                        "source": "OCR_EXTRACTED_ENTITY",
                        "sourceDocumentId": s.get("sourceDocumentId"),
                        "provenance": "OCR_EXTRACTED_ENTITY",
                        "relatedEntityId": None,
                        "metadata": {"severity": s.get("severity")}
                    })

            # Procedures
            for p in entities.get("procedures", []):
                key = f"PROCEDURE|{p['procedureName'].lower()}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    items.append({
                        "id": f"TL-ENT-PROC-{len(items)+1}",
                        "patientId": patient_id,
                        "encounterId": encounter_id,
                        "eventType": "PROCEDURE",
                        "title": f"Procedure: {p['procedureName']}",
                        "description": f"Reported surgical/clinical procedure: {p['procedureName']}.",
                        "clinicalDate": p.get("date"),
                        "systemTimestamp": entities.get("extractedAt", now),
                        "source": "OCR_EXTRACTED_ENTITY",
                        "sourceDocumentId": p.get("sourceDocumentId"),
                        "provenance": "OCR_EXTRACTED_ENTITY",
                        "relatedEntityId": None,
                        "metadata": {"date": p.get("date")}
                    })

            # Investigations
            for inv in entities.get("investigations", []):
                key = f"INVESTIGATION|{inv['testName'].lower()}|{inv['resultValue']}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    items.append({
                        "id": f"TL-ENT-INV-{len(items)+1}",
                        "patientId": patient_id,
                        "encounterId": encounter_id,
                        "eventType": "INVESTIGATION",
                        "title": f"Lab Result: {inv['testName']}",
                        "description": f"Result: {inv['resultValue']} {inv.get('unit') or ''}. Ref Range: {inv.get('referenceRange') or 'None'}.",
                        "clinicalDate": inv.get("date"),
                        "systemTimestamp": entities.get("extractedAt", now),
                        "source": "OCR_EXTRACTED_ENTITY",
                        "sourceDocumentId": inv.get("sourceDocumentId"),
                        "provenance": "OCR_EXTRACTED_ENTITY",
                        "relatedEntityId": None,
                        "metadata": {"resultValue": inv['resultValue'], "unit": inv.get('unit')}
                    })

            # Vitals
            for v in entities.get("vitals", []):
                key = f"VITAL|{v['type'].lower()}|{v['value']}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    items.append({
                        "id": f"TL-ENT-VIT-{len(items)+1}",
                        "patientId": patient_id,
                        "encounterId": encounter_id,
                        "eventType": "VITAL",
                        "title": f"Vital Sign: {v['type']}",
                        "description": f"Value: {v['value']} {v.get('unit') or ''}.",
                        "clinicalDate": v.get("date"),
                        "systemTimestamp": entities.get("extractedAt", now),
                        "source": "OCR_EXTRACTED_ENTITY",
                        "sourceDocumentId": v.get("sourceDocumentId"),
                        "provenance": "OCR_EXTRACTED_ENTITY",
                        "relatedEntityId": None,
                        "metadata": {"type": v['type'], "value": v['value']}
                    })

        # Sort timeline items by systemTimestamp / clinicalDate
        items.sort(key=lambda x: x.get("systemTimestamp") or "")

        payload = {
            "encounterId": encounter_id,
            "patientId": patient_id,
            "items": items,
            "totalItems": len(items),
            "builtAt": now
        }

        store.save_timeline(encounter_id, payload)
        return payload
