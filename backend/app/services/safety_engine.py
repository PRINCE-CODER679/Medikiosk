import datetime
import random
from typing import Dict, List, Optional

class SafetyEngine:
    RULE_VERSION = "1.0"

    PROTOTYPE_RULES = [
        {
            "rule_id": "RF_RESP_001",
            "rule_version": "1.0",
            "severity": "EMERGENCY",
            "description": "Acute severe shortness of breath or respiratory distress.",
            "source_fields": ["chiefComplaint.primarySymptom", "hpi.associatedSymptoms", "reviewOfSystems.respiratory"],
            "patient_guidance": "Please alert a healthcare professional or nurse immediately for priority breathing assessment.",
            "clinician_guidance": "Patient reported acute severe dyspnea/breathing difficulty. Immediate vital sign check (SpO2, RR) and priority triage recommended."
        },
        {
            "rule_id": "RF_CARD_001",
            "rule_version": "1.0",
            "severity": "EMERGENCY",
            "description": "Chest pain associated with severe distress, dyspnea, or syncope.",
            "source_fields": ["chiefComplaint.primarySymptom", "hpi.severity", "hpi.character", "reviewOfSystems.cardiovascular"],
            "patient_guidance": "Please alert a healthcare professional immediately regarding chest discomfort.",
            "clinician_guidance": "High-priority alert: Reported acute chest pain/tightness with associated distress. STAT ECG and clinical evaluation indicated."
        },
        {
            "rule_id": "RF_NEURO_001",
            "rule_version": "1.0",
            "severity": "EMERGENCY",
            "description": "Sudden focal neurological deficit (one-sided weakness, facial drooping, speech difficulty).",
            "source_fields": ["chiefComplaint.description", "hpi.character", "reviewOfSystems.neurological"],
            "patient_guidance": "Please inform emergency nursing staff immediately about sudden weakness or speech changes.",
            "clinician_guidance": "Potential acute neurological warning: Reported focal weakness/speech change. Urgent stroke triage protocol recommended."
        },
        {
            "rule_id": "RF_NEURO_002",
            "rule_version": "1.0",
            "severity": "EMERGENCY",
            "description": "Loss of consciousness, fainting episode, or unresponsiveness.",
            "source_fields": ["chiefComplaint.primarySymptom", "hpi.character", "reviewOfSystems.neurological"],
            "patient_guidance": "Please alert hospital staff immediately regarding fainting or loss of consciousness.",
            "clinician_guidance": "Reported recent syncope / loss of consciousness. Priority cardiovascular and neurological evaluation recommended."
        },
        {
            "rule_id": "RF_HEM_001",
            "rule_version": "1.0",
            "severity": "EMERGENCY",
            "description": "Severe or uncontrolled active bleeding.",
            "source_fields": ["chiefComplaint.primarySymptom", "chiefComplaint.description", "hpi.character"],
            "patient_guidance": "Please alert a healthcare professional immediately for urgent bleeding control.",
            "clinician_guidance": "Reported acute uncontrolled bleeding / hemoptysis / hematemesis. Immediate hemodynamic stabilization check required."
        },
        {
            "rule_id": "RF_ALLERGY_001",
            "rule_version": "1.0",
            "severity": "EMERGENCY",
            "description": "Signs suggestive of severe allergic reaction / anaphylaxis (facial/airway swelling).",
            "source_fields": ["allergies", "reviewOfSystems.skin", "reviewOfSystems.respiratory"],
            "patient_guidance": "Please inform nursing staff immediately if you experience swelling or breathing tightness.",
            "clinician_guidance": "Possible acute hypersensitivity / anaphylactic pattern. Immediate airway and allergic evaluation recommended."
        },
        {
            "rule_id": "RF_SEIZ_001",
            "rule_version": "1.0",
            "severity": "EMERGENCY",
            "description": "Active or recent seizure-like activity.",
            "source_fields": ["chiefComplaint.primarySymptom", "pastMedicalHistory.conditions", "reviewOfSystems.neurological"],
            "patient_guidance": "Please inform healthcare staff immediately regarding seizure history or symptoms.",
            "clinician_guidance": "Reported active or recent seizure activity. Urgent neurological safety precautions advised."
        },
        {
            "rule_id": "RF_INF_001",
            "rule_version": "1.0",
            "severity": "URGENT",
            "description": "High fever accompanied by neck stiffness or severe disorientation.",
            "source_fields": ["chiefComplaint.primarySymptom", "hpi.severity", "reviewOfSystems.neurological"],
            "patient_guidance": "Your symptoms indicate priority clinical review is recommended. Please inform nursing staff.",
            "clinician_guidance": "Urgent flag: High fever with neurological signs (stiff neck / confusion). Meningeal / systemic infection screen recommended."
        },
        {
            "rule_id": "RF_PAIN_001",
            "rule_version": "1.0",
            "severity": "URGENT",
            "description": "Severe pain (Severity >= 8/10).",
            "source_fields": ["hpi.severity", "chiefComplaint.primarySymptom"],
            "patient_guidance": "Your symptoms indicate priority clinical review may be needed. Please inform a healthcare professional.",
            "clinician_guidance": "Priority flag: High severity pain reported (>= 8/10). Timely clinical assessment and pain management recommended."
        }
    ]

    @staticmethod
    def evaluate(clinical_history: Optional[dict], patient_id: str, encounter_id: str, session_id: Optional[str] = None) -> dict:
        now = datetime.datetime.now().isoformat()
        safety_id = f"SAF-{random.randint(10000, 99999)}"

        if not clinical_history or not isinstance(clinical_history, dict):
            return {
                "safetyAssessmentId": safety_id,
                "patientId": patient_id,
                "encounterId": encounter_id,
                "sessionId": session_id,
                "status": "INSUFFICIENT_INFORMATION",
                "ruleIds": [],
                "triggeredFindings": [],
                "patientGuidance": "We could not determine whether certain warning signs are present because clinical history is incomplete. Please discuss your symptoms with a healthcare professional.",
                "clinicianGuidance": "Insufficient clinical history collected to run safety warning rules.",
                "ruleVersion": SafetyEngine.RULE_VERSION,
                "source": "DETERMINISTIC_RULE",
                "createdAt": now
            }

        chief_complaint = clinical_history.get("chiefComplaint") or {}
        hpi = clinical_history.get("hpi") or {}
        past_history = clinical_history.get("pastMedicalHistory") or {}
        allergies = clinical_history.get("allergies") or []
        ros = clinical_history.get("reviewOfSystems") or {}

        # Check if basic info is completely empty
        has_primary = bool(chief_complaint.get("primarySymptom"))
        has_description = bool(chief_complaint.get("description"))
        has_hpi = bool(hpi.get("location") or hpi.get("severity") or hpi.get("character"))
        
        if not (has_primary or has_description or has_hpi):
            return {
                "safetyAssessmentId": safety_id,
                "patientId": patient_id,
                "encounterId": encounter_id,
                "sessionId": session_id,
                "status": "INSUFFICIENT_INFORMATION",
                "ruleIds": [],
                "triggeredFindings": [],
                "patientGuidance": "We could not determine whether certain warning signs are present from the information provided. Please discuss your symptoms with a healthcare professional.",
                "clinicianGuidance": "Chief complaint and HPI fields are incomplete. Safety engine returned INSUFFICIENT_INFORMATION.",
                "ruleVersion": SafetyEngine.RULE_VERSION,
                "source": "DETERMINISTIC_RULE",
                "createdAt": now
            }

        triggered_rules = []
        triggered_findings = []

        # Convert text for safe deterministic checking
        primary_sym = str(chief_complaint.get("primarySymptom", "")).lower()
        cc_desc = str(chief_complaint.get("description", "")).lower()
        hpi_char = str(hpi.get("character", "")).lower()
        hpi_sev = hpi.get("severity", 0) or 0
        ros_resp = [str(x).lower() for x in ros.get("respiratory", [])] if isinstance(ros.get("respiratory"), list) else []
        ros_card = [str(x).lower() for x in ros.get("cardiovascular", [])] if isinstance(ros.get("cardiovascular"), list) else []
        ros_neuro = [str(x).lower() for x in ros.get("neurological", [])] if isinstance(ros.get("neurological"), list) else []
        ros_skin = [str(x).lower() for x in ros.get("skin", [])] if isinstance(ros.get("skin"), list) else []
        ros_gen = [str(x).lower() for x in ros.get("general", [])] if isinstance(ros.get("general"), list) else []

        # 1. RF_RESP_001: Shortness of breath
        if ("shortness of breath" in primary_sym or "breath" in primary_sym or "dyspnea" in primary_sym or
            any("shortness of breath" in x or "struggling to breathe" in x or "breathless" in x for x in ros_resp) or
            ("cough" in primary_sym and hpi_sev >= 8)):
            triggered_rules.append("RF_RESP_001")
            triggered_findings.append({
                "ruleId": "RF_RESP_001",
                "finding": "Acute shortness of breath / severe dyspnea reported",
                "field": "chiefComplaint.primarySymptom",
                "value": chief_complaint.get("primarySymptom") or "Shortness of Breath",
                "source": "PATIENT"
            })

        # 2. RF_CARD_001: Chest Pain with distress
        if ("chest pain" in primary_sym or "chest tightness" in primary_sym or "chest" in primary_sym or
            any("chest pain" in x or "tightness" in x for x in ros_card)):
            if hpi_sev >= 6 or "dizziness" in primary_sym or any("shortness" in x for x in ros_resp) or "severe" in cc_desc or hpi_sev >= 7:
                triggered_rules.append("RF_CARD_001")
                triggered_findings.append({
                    "ruleId": "RF_CARD_001",
                    "finding": "Chest pain / tightness with distress reported",
                    "field": "chiefComplaint.primarySymptom",
                    "value": chief_complaint.get("primarySymptom") or "Chest Pain",
                    "source": "PATIENT"
                })

        # 3. RF_NEURO_001: Sudden focal weakness / speech difficulty
        neuro_text = " ".join([cc_desc, hpi_char] + ros_neuro)
        if any(term in neuro_text for term in ["weakness", "numbness", "paralysis", "slurred speech", "speech difficulty", "drooping"]):
            triggered_rules.append("RF_NEURO_001")
            triggered_findings.append({
                "ruleId": "RF_NEURO_001",
                "finding": "Sudden focal weakness, numbness, or speech difficulty reported",
                "field": "reviewOfSystems.neurological",
                "value": cc_desc or "Neurological symptoms reported",
                "source": "PATIENT"
            })

        # 4. RF_NEURO_002: Syncope / Fainting
        if any(term in primary_sym or term in neuro_text for term in ["faint", "fainting", "syncope", "unresponsive", "passed out", "blackout"]):
            triggered_rules.append("RF_NEURO_002")
            triggered_findings.append({
                "ruleId": "RF_NEURO_002",
                "finding": "Episode of fainting / syncope / loss of consciousness reported",
                "field": "chiefComplaint.primarySymptom",
                "value": chief_complaint.get("primarySymptom") or "Fainting",
                "source": "PATIENT"
            })

        # 5. RF_HEM_001: Uncontrolled bleeding
        if any(term in primary_sym or term in cc_desc or term in hpi_char for term in ["bleeding", "vomiting blood", "coughing up blood", "hemorrhage"]):
            triggered_rules.append("RF_HEM_001")
            triggered_findings.append({
                "ruleId": "RF_HEM_001",
                "finding": "Severe or active bleeding reported",
                "field": "chiefComplaint.description",
                "value": cc_desc or "Bleeding reported",
                "source": "PATIENT"
            })

        # 6. RF_ALLERGY_001: Anaphylaxis signs
        all_allergy_text = " ".join([str(a.get("reaction", "") if isinstance(a, dict) else a).lower() for a in allergies] + ros_skin + ros_resp)
        if any(term in all_allergy_text for term in ["swelling", "anaphylaxis", "lip swelling", "tongue swelling", "throat tightness"]):
            triggered_rules.append("RF_ALLERGY_001")
            triggered_findings.append({
                "ruleId": "RF_ALLERGY_001",
                "finding": "Facial/airway swelling or severe allergic reaction signs reported",
                "field": "allergies",
                "value": "Allergy reaction with swelling/tightness",
                "source": "PATIENT"
            })

        # 7. RF_SEIZ_001: Seizure activity
        if any(term in primary_sym or term in neuro_text for term in ["seizure", "convulsion", "fits"]):
            triggered_rules.append("RF_SEIZ_001")
            triggered_findings.append({
                "ruleId": "RF_SEIZ_001",
                "finding": "Seizure or convulsive activity reported",
                "field": "reviewOfSystems.neurological",
                "value": "Seizure activity reported",
                "source": "PATIENT"
            })

        # 8. RF_INF_001: Fever with neck stiffness / confusion
        if "fever" in primary_sym or any("fever" in x for x in ros_gen) or hpi_sev >= 8:
            if any(term in neuro_text for term in ["neck stiffness", "stiff neck", "confusion", "disorientation"]):
                triggered_rules.append("RF_INF_001")
                triggered_findings.append({
                    "ruleId": "RF_INF_001",
                    "finding": "High fever with neck stiffness or disorientation reported",
                    "field": "reviewOfSystems.neurological",
                    "value": "Fever with meningeal/neurological signs",
                    "source": "PATIENT"
                })

        # 9. RF_PAIN_001: High Pain (Severity >= 8)
        if hpi_sev >= 8 and "RF_CARD_001" not in triggered_rules:
            triggered_rules.append("RF_PAIN_001")
            triggered_findings.append({
                "ruleId": "RF_PAIN_001",
                "finding": f"High severity pain reported ({hpi_sev}/10)",
                "field": "hpi.severity",
                "value": f"{hpi_sev}/10 Severity",
                "source": "PATIENT"
            })

        # Also check AI Clarifications in ros or hpi for provenance
        if ros_gen:
            for item in ros_gen:
                if "ai_clarification" in item:
                    # Keep track of AI clarification source provenance
                    pass

        # Determine highest severity
        emergency_rules = [r for r in SafetyEngine.PROTOTYPE_RULES if r["rule_id"] in triggered_rules and r["severity"] == "EMERGENCY"]
        urgent_rules = [r for r in SafetyEngine.PROTOTYPE_RULES if r["rule_id"] in triggered_rules and r["severity"] == "URGENT"]

        if emergency_rules:
            final_status = "EMERGENCY"
            p_guidance = "Please alert a healthcare professional immediately. Based on the information you provided, the system identified a warning sign that requires immediate medical attention."
            c_guidance = " | ".join([r["clinician_guidance"] for r in emergency_rules])
        elif urgent_rules:
            final_status = "URGENT"
            p_guidance = "Your information indicates that priority clinical review may be needed. Please inform a healthcare professional."
            c_guidance = " | ".join([r["clinician_guidance"] for r in urgent_rules])
        else:
            final_status = "NO_IMMEDIATE_FLAG"
            p_guidance = "Your information has been reviewed for predefined immediate warning signs. No immediate warning pattern was identified from the information provided."
            c_guidance = "Deterministic safety check complete. No predefined emergency or urgent warning patterns triggered."

        return {
            "safetyAssessmentId": safety_id,
            "patientId": patient_id,
            "encounterId": encounter_id,
            "sessionId": session_id,
            "status": final_status,
            "ruleIds": list(set(triggered_rules)),
            "triggeredFindings": triggered_findings,
            "patientGuidance": p_guidance,
            "clinicianGuidance": c_guidance,
            "ruleVersion": SafetyEngine.RULE_VERSION,
            "source": "DETERMINISTIC_RULE",
            "createdAt": now
        }
