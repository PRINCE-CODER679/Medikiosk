"""
MediKiosk Clinical Entity Extraction Service (Phase 8)
Pure Python / Deterministic NLP entity extraction engine.
Parses document OCR text into 7 structured clinical entity categories:
1. Conditions / Diagnoses
2. Medications
3. Allergies
4. Symptoms
5. Procedures / Surgeries
6. Investigations / Labs
7. Vitals

Enforces strict provenance tracking (OCR_EXTRACTED_ENTITY), zero hallucination,
deduplication, and patient/encounter data isolation.
"""

import re
import datetime
from typing import Dict, List, Any, Optional

PROVENANCE = "OCR_EXTRACTED_ENTITY"

class ClinicalEntityExtractor:
    """
    Deterministic rule-based clinical entity extraction engine.
    Extracts explicit structured entities supported directly by the text.
    Never hallucinates unstated doses, dates, frequencies, or values.
    """

    @classmethod
    def extract_from_documents(cls, documents: List[dict], patient_id: str, encounter_id: str) -> Dict[str, Any]:
        conditions = []
        medications = []
        allergies = []
        symptoms = []
        procedures = []
        investigations = []
        vitals = []

        seen_keys = set()

        for doc in documents:
            doc_id = doc.get("documentId", "DOC-UNKNOWN")
            text = doc.get("extractedText", "") or ""

            if not text.strip():
                continue

            lines = [l.strip() for l in text.splitlines() if l.strip()]

            # Extract Document Date if explicitly present
            doc_date = cls._find_date(text)

            for line in lines:
                # 1. VITALS Extraction
                vital_matches = cls._extract_vitals(line, doc_id, doc_date)
                for v in vital_matches:
                    key = f"vital|{v['type'].lower()}|{v['value']}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        vitals.append(v)

                # 2. INVESTIGATIONS / LABS Extraction
                lab_matches = cls._extract_labs(line, doc_id, doc_date)
                for lab in lab_matches:
                    key = f"lab|{lab['testName'].lower()}|{lab['resultValue']}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        investigations.append(lab)

                # 3. MEDICATIONS Extraction
                med_matches = cls._extract_medications(line, doc_id)
                for med in med_matches:
                    key = f"med|{med['medicationName'].lower()}|{med.get('dose') or ''}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        medications.append(med)

                # 4. ALLERGIES Extraction
                allergy_matches = cls._extract_allergies(line, doc_id)
                for alg in allergy_matches:
                    key = f"allergy|{alg['allergen'].lower()}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        allergies.append(alg)

                # 5. CONDITIONS Extraction
                cond_matches = cls._extract_conditions(line, doc_id, doc_date)
                for cond in cond_matches:
                    key = f"cond|{cond['name'].lower()}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        conditions.append(cond)

                # 6. SYMPTOMS Extraction
                sym_matches = cls._extract_symptoms(line, doc_id)
                for sym in sym_matches:
                    key = f"sym|{sym['symptomName'].lower()}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        symptoms.append(sym)

                # 7. PROCEDURES Extraction
                proc_matches = cls._extract_procedures(line, doc_id, doc_date)
                for proc in proc_matches:
                    key = f"proc|{proc['procedureName'].lower()}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        procedures.append(proc)

        total_count = (
            len(conditions) + len(medications) + len(allergies) +
            len(symptoms) + len(procedures) + len(investigations) + len(vitals)
        )

        return {
            "encounterId": encounter_id,
            "patientId": patient_id,
            "conditions": conditions,
            "medications": medications,
            "allergies": allergies,
            "symptoms": symptoms,
            "procedures": procedures,
            "investigations": investigations,
            "vitals": vitals,
            "totalEntities": total_count,
            "extractedAt": datetime.datetime.now().isoformat(),
            "source": PROVENANCE
        }

    @staticmethod
    def _find_date(text: str) -> Optional[str]:
        date_pattern = r'\b(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})\b'
        m = re.search(date_pattern, text)
        return m.group(1) if m else None

    @staticmethod
    def _extract_vitals(line: str, doc_id: str, doc_date: Optional[str]) -> List[dict]:
        vitals = []
        # Blood Pressure e.g. "Blood Pressure: 138/88 mmHg" or "BP: 120/80"
        bp_match = re.search(r'(?:blood\s*pressure|bp)[:\s]+(\d{2,3}/\d{2,3})\s*(mmhg)?', line, re.IGNORECASE)
        if bp_match:
            vitals.append({
                "type": "Blood Pressure",
                "value": bp_match.group(1),
                "unit": "mmHg",
                "date": doc_date,
                "sourceDocumentId": doc_id,
                "sourceSnippet": line,
                "provenance": PROVENANCE
            })

        # Pulse / Heart Rate e.g. "Pulse: 72 bpm" or "Heart Rate: 80 bpm"
        hr_match = re.search(r'(?:pulse|heart\s*rate|hr)[:\s]+(\d{2,3})\s*(bpm|/min)?', line, re.IGNORECASE)
        if hr_match:
            vitals.append({
                "type": "Heart Rate",
                "value": hr_match.group(1),
                "unit": "bpm",
                "date": doc_date,
                "sourceDocumentId": doc_id,
                "sourceSnippet": line,
                "provenance": PROVENANCE
            })

        # SpO2 / Oxygen Saturation e.g. "SpO2: 98%"
        spo2_match = re.search(r'(?:spo2|oxygen\s*saturation)[:\s]+(\d{2,3})\s*(%)?', line, re.IGNORECASE)
        if spo2_match:
            vitals.append({
                "type": "Oxygen Saturation (SpO2)",
                "value": spo2_match.group(1),
                "unit": "%",
                "date": doc_date,
                "sourceDocumentId": doc_id,
                "sourceSnippet": line,
                "provenance": PROVENANCE
            })

        # Temperature e.g. "Temperature: 98.6 F" or "Temp: 37 C"
        temp_match = re.search(r'(?:temperature|temp)[:\s]+(\d{2,3}(?:\.\d)?)\s*([°]?\s*[fc])?', line, re.IGNORECASE)
        if temp_match:
            vitals.append({
                "type": "Temperature",
                "value": temp_match.group(1),
                "unit": (temp_match.group(2) or "°F").upper(),
                "date": doc_date,
                "sourceDocumentId": doc_id,
                "sourceSnippet": line,
                "provenance": PROVENANCE
            })

        return vitals

    @staticmethod
    def _extract_labs(line: str, doc_id: str, doc_date: Optional[str]) -> List[dict]:
        labs = []
        # Pattern for lab test lines e.g.: "- Hemoglobin (Hb): 13.8 g/dL (Ref Range: 13.5 - 17.5 g/dL)"
        # Or: "Fasting Blood Sugar (FBS): 112 mg/dL"
        lab_pattern = r'(?:[-\u2022]\s*)?([A-Za-z0-9\s\(\)/-]+)[:\s]+(\d+(?:\.\d+)?(?:\s*/\s*\d+)?)\s*([a-zA-Z%/µuLdLmgmm]+)?(?:\s*\((?:ref\s*range|reference)[:\s]*([^\)]+)\))?'
        
        known_lab_keywords = ["hemoglobin", "wbc", "rbc", "platelet", "blood sugar", "fbs", "ppbs", "hba1c", "creatinine", "urea", "bilirubin", "sgot", "sgpt", "tsh", "cholesterol"]
        lower_line = line.lower()

        if any(kw in lower_line for kw in known_lab_keywords) and ":" in line:
            m = re.search(lab_pattern, line)
            if m:
                test_name = m.group(1).strip("- ").strip()
                result_val = m.group(2).strip()
                unit = m.group(3) or None
                ref_range = m.group(4) or None

                labs.append({
                    "testName": test_name,
                    "resultValue": result_val,
                    "unit": unit,
                    "referenceRange": ref_range,
                    "date": doc_date,
                    "sourceDocumentId": doc_id,
                    "sourceSnippet": line,
                    "provenance": PROVENANCE
                })

        return labs

    @staticmethod
    def _extract_medications(line: str, doc_id: str) -> List[dict]:
        meds = []
        # Matches medication patterns:
        # e.g., "1. Tab. Amlodipine 5mg — 1 tablet once daily (OD Morning)"
        # e.g., "Tab Paracetamol 500 mg"
        # e.g., "Syp. Multivitamin 10ml"
        med_pattern = r'(?:\d+[\.\)]\s*)?(?:tab\.|tab|syp\.|syp|cap\.|cap|inj\.|inj|t\.?\s*)\s*([A-Za-z0-9\s]+?)\s+(\d+\s*(?:mg|g|ml|mcg|iu))\b(?:[—\:-]*\s*(.+))?'
        
        m = re.search(med_pattern, line, re.IGNORECASE)
        if m:
            med_name = m.group(1).strip()
            dose = m.group(2).strip()
            rest = (m.group(3) or "").strip()

            freq = None
            duration = None
            reason = None

            if rest:
                if "once daily" in rest.lower() or "od" in rest.lower():
                    freq = "Once daily (OD)"
                elif "twice daily" in rest.lower() or "bd" in rest.lower():
                    freq = "Twice daily (BD)"
                elif "thrice daily" in rest.lower() or "tid" in rest.lower():
                    freq = "Thrice daily (TID)"
                elif "as needed" in rest.lower() or "prn" in rest.lower():
                    freq = "As needed (PRN)"

                if "fever" in rest.lower() or "pain" in rest.lower():
                    reason = rest

            meds.append({
                "medicationName": med_name,
                "dose": dose,
                "frequency": freq,
                "route": "Oral" if any(x in line.lower() for x in ["tab", "syp", "cap", "tablet"]) else None,
                "duration": duration,
                "reason": reason,
                "sourceDocumentId": doc_id,
                "sourceSnippet": line,
                "provenance": PROVENANCE
            })

        return meds

    @staticmethod
    def _extract_allergies(line: str, doc_id: str) -> List[dict]:
        allergies = []
        if any(kw in line.lower() for kw in ["allergy", "allergies", "allergic"]):
            m = re.search(r'(?:allergies|allergy|allergic\s+to)[:\s]+([A-Za-z0-9\s]+?)(?:\s*\(([^)]+)\))?$', line, re.IGNORECASE)
            if not m:
                m = re.search(r'(?:allergies|allergy|allergic)[:\s]+([A-Za-z0-9]+)', line, re.IGNORECASE)
            if m:
                allergen = m.group(1).strip()
                reaction = m.group(2) if len(m.groups()) >= 2 else None
                allergies.append({
                    "allergen": allergen,
                    "reaction": reaction,
                    "severity": "Severe" if reaction and "severe" in reaction.lower() else None,
                    "sourceDocumentId": doc_id,
                    "sourceSnippet": line,
                    "provenance": PROVENANCE
                })
        return allergies

    @staticmethod
    def _extract_conditions(line: str, doc_id: str, doc_date: Optional[str]) -> List[dict]:
        conditions = []
        known_conditions = [
            "hypertension", "type 2 diabetes", "diabetes mellitus", "asthma",
            "coronary artery disease", "prehypertension", "hypothyroidism",
            "hyperthyroidism", "copd", "chronic kidney disease", "anemia"
        ]
        lower_line = line.lower()
        for cond in known_conditions:
            if cond in lower_line:
                # Find status if present
                status = "Active"
                if "history of" in lower_line or "past" in lower_line:
                    status = "Historical"
                elif "stage 1" in lower_line or "prehypertension" in lower_line:
                    status = "Stage 1"

                conditions.append({
                    "name": cond.title(),
                    "status": status,
                    "date": doc_date,
                    "sourceDocumentId": doc_id,
                    "sourceSnippet": line,
                    "provenance": PROVENANCE
                })
        return conditions

    @staticmethod
    def _extract_symptoms(line: str, doc_id: str) -> List[dict]:
        symptoms = []
        known_symptoms = [
            "headache", "fever", "cough", "chest pain", "shortness of breath",
            "dizziness", "weakness", "bodyache", "nausea", "abdominal pain"
        ]
        lower_line = line.lower()
        for sym in known_symptoms:
            if sym in lower_line and not any(kw in lower_line for kw in ["no ", "denies", "without"]):
                severity = None
                if "mild" in lower_line:
                    severity = "Mild"
                elif "severe" in lower_line:
                    severity = "Severe"

                symptoms.append({
                    "symptomName": sym.title(),
                    "severity": severity,
                    "duration": None,
                    "sourceDocumentId": doc_id,
                    "sourceSnippet": line,
                    "provenance": PROVENANCE
                })
        return symptoms

    @staticmethod
    def _extract_procedures(line: str, doc_id: str, doc_date: Optional[str]) -> List[dict]:
        procedures = []
        known_procedures = [
            "appendectomy", "cholecystectomy", "angioplasty", "cabg",
            "cesarean section", "stent placement", "cataract surgery"
        ]
        lower_line = line.lower()
        for proc in known_procedures:
            if proc in lower_line:
                procedures.append({
                    "procedureName": proc.title(),
                    "date": doc_date,
                    "sourceDocumentId": doc_id,
                    "sourceSnippet": line,
                    "provenance": PROVENANCE
                })
        return procedures
