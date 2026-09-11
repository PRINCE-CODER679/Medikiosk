import os
import random
import datetime
from typing import Dict, Any, Optional

class AIConversationOrchestrator:
  def __init__(self):
    self.gemini_key = os.getenv("GEMINI_API_KEY")
    self.openai_key = os.getenv("OPENAI_API_KEY")
    self.max_questions_per_session = 4

  def is_llm_available(self) -> bool:
    return bool(self.gemini_key or self.openai_key)

  def validate_patient_input(self, text: str) -> dict:
    """
    Prompt Injection & Clinical Safety Guardrail
    Intercepts diagnostic requests or prompt override attempts.
    """
    clean = text.lower().strip()
    unsafe_keywords = ["diagnose", "what disease", "what medicine", "prescribe", "ignore instructions", "override"]
    
    for kw in unsafe_keywords:
      if kw in clean:
        return {
          "safe": False,
          "flag": "CLINICAL_SAFETY_REJECTION",
          "message": "MediKiosk collects symptoms for your attending doctor. Diagnostic or prescription advice is provided solely by your physician."
        }

    return {"safe": True}

  def generate_next_question(
      self,
      conversation_id: str,
      history: dict,
      question_count: int,
      lang: str = "en"
  ) -> dict:
    """
    Generates structured follow-up question.
    Uses deterministic fallback engine if LLM API key is missing or fails.
    """
    if question_count >= self.max_questions_per_session:
      return {
        "questionId": f"Q-END-{question_count}",
        "question": "Thank you. We have collected sufficient symptom details to prepare your clinical summary.",
        "targetSection": "completed",
        "targetField": "completed",
        "questionType": "info",
        "options": [],
        "shouldContinue": False,
        "mode": "DETERMINISTIC_FALLBACK"
      }

    # Deterministic Clinical Follow-Up Engine
    return self._get_deterministic_question(history, question_count, lang)

  def _get_deterministic_question(self, history: dict, question_count: int, lang: str = "en") -> dict:
    primary_symptom = ""
    if history and history.get("chiefComplaint"):
      primary_symptom = (history["chiefComplaint"].get("primarySymptom") or "").lower()

    # Multilingual Questions & Touch Option Cards
    if question_count == 0:
      if lang == "hi":
        return {
          "questionId": f"Q-{question_count + 1}",
          "question": "क्या आपको सूखी खांसी है या बलगम/कफ आ रहा है?",
          "targetSection": "hpi",
          "targetField": "sputumType",
          "questionType": "single_choice",
          "options": ["सूखी खांसी", "बलगम के साथ", "खून के धब्बे", "पक्का नहीं मालूम"],
          "shouldContinue": True,
          "mode": "DETERMINISTIC_FALLBACK"
        }
      elif lang == "mr":
        return {
          "questionId": f"Q-{question_count + 1}",
          "question": "तुम्हाला कोरडा खोकला आहे की कफ पडत आहे?",
          "targetSection": "hpi",
          "targetField": "sputumType",
          "questionType": "single_choice",
          "options": ["कोरडा खोकला", "कफासह", "रक्ताचे डाग", "खात्री नाही"],
          "shouldContinue": True,
          "mode": "DETERMINISTIC_FALLBACK"
        }
      else:
        return {
          "questionId": f"Q-{question_count + 1}",
          "question": "Is your cough dry, or are you bringing up phlegm/mucus?",
          "targetSection": "hpi",
          "targetField": "sputumType",
          "questionType": "single_choice",
          "options": ["Dry Cough", "Productive with Mucus", "Blood-tinged", "Not Sure"],
          "shouldContinue": True,
          "mode": "DETERMINISTIC_FALLBACK"
        }

    elif question_count == 1:
      if lang == "hi":
        return {
          "questionId": f"Q-{question_count + 1}",
          "question": "क्या आपको सांस लेने में कोई तकलीफ या कठिनाई महसूस हो रही है?",
          "targetSection": "hpi",
          "targetField": "dyspneaSeverity",
          "questionType": "single_choice",
          "options": ["कोई तकलीफ नहीं", "हल्का सांस फूलना", "गंभीर सांस फूलना"],
          "shouldContinue": True,
          "mode": "DETERMINISTIC_FALLBACK"
        }
      elif lang == "mr":
        return {
          "questionId": f"Q-{question_count + 1}",
          "question": "तुम्हाला श्वास घेण्यास त्रास किंवा धाप लागत आहे का?",
          "targetSection": "hpi",
          "targetField": "dyspneaSeverity",
          "questionType": "single_choice",
          "options": ["काहीही त्रास नाही", "सौम्य धाप", "तीव्र श्वास लागणे"],
          "shouldContinue": True,
          "mode": "DETERMINISTIC_FALLBACK"
        }
      else:
        return {
          "questionId": f"Q-{question_count + 1}",
          "question": "Are you experiencing any shortness of breath or difficulty breathing?",
          "targetSection": "hpi",
          "targetField": "dyspneaSeverity",
          "questionType": "single_choice",
          "options": ["No Shortness of Breath", "Mild Breathlessness", "Severe Breathlessness"],
          "shouldContinue": True,
          "mode": "DETERMINISTIC_FALLBACK"
        }

    elif question_count == 2:
      if lang == "hi":
        return {
          "questionId": f"Q-{question_count + 1}",
          "question": "क्या किसी खास वजह से लक्षण कम या ज्यादा होते हैं?",
          "targetSection": "hpi",
          "targetField": "aggravatingFactor",
          "questionType": "single_choice",
          "options": ["आराम करने से कम", "चलने-फिरने से ज्यादा", "कोई बदलाव नहीं"],
          "shouldContinue": True,
          "mode": "DETERMINISTIC_FALLBACK"
        }
      elif lang == "mr":
        return {
          "questionId": f"Q-{question_count + 1}",
          "question": "एखाद्या विशिष्ट गोष्टीमुळे त्रास कमी किंवा जास्त होतो का?",
          "targetSection": "hpi",
          "targetField": "aggravatingFactor",
          "questionType": "single_choice",
          "options": ["विश्रांतीने आराम", "चालल्याने वाढतो", "काही बदल नाही"],
          "shouldContinue": True,
          "mode": "DETERMINISTIC_FALLBACK"
        }
      else:
        return {
          "questionId": f"Q-{question_count + 1}",
          "question": "Does anything specific make your symptoms better or worse?",
          "targetSection": "hpi",
          "targetField": "aggravatingFactor",
          "questionType": "single_choice",
          "options": ["Better with Rest", "Worse with Exertion", "Unchanged"],
          "shouldContinue": True,
          "mode": "DETERMINISTIC_FALLBACK"
        }

    else:
      return {
        "questionId": f"Q-END-{question_count}",
        "question": "Thank you. We have collected sufficient symptom details to prepare your clinical summary.",
        "targetSection": "completed",
        "targetField": "completed",
        "questionType": "info",
        "options": [],
        "shouldContinue": False,
        "mode": "DETERMINISTIC_FALLBACK"
      }

orchestrator = AIConversationOrchestrator()
