from fastapi import APIRouter, HTTPException, status
from app.schemas.patient import (
    ConversationCreateRequest,
    ConversationResponse,
    QuestionResponse,
    AnswerSubmitRequest
)
from app.services.store import store
from app.services.ai_orchestrator import orchestrator

router = APIRouter()

@router.post("/conversations", response_model=ConversationResponse, summary="Initialize Kiosk AI Conversation")
def create_conversation(req: ConversationCreateRequest):
    encounter = store.encounters.get(req.encounterId)
    if not encounter:
        encounter = store.create_encounter(patient_id=req.patientId, source="MediKiosk")
        encounter["id"] = req.encounterId
        store.encounters[req.encounterId] = encounter

    conv = store.create_conversation(
        encounter_id=req.encounterId,
        patient_id=req.patientId,
        session_id=req.sessionId,
        language_preference=req.languagePreference or "en"
    )
    return conv

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse, summary="Get Conversation Status")
def get_conversation(conversation_id: str):
    conv = store.get_conversation(conversation_id)
    if not conv:
        conv = store.create_conversation(
            encounter_id="ENC-2026-DEMO",
            patient_id="PAT-10928",
            session_id=None,
            language_preference="en"
        )
        conv["conversationId"] = conversation_id
        store.conversations[conversation_id] = conv
    return conv

@router.post("/conversations/{conversation_id}/next-question", response_model=QuestionResponse, summary="Generate Next Follow-Up Question")
def get_next_question(conversation_id: str):
    conv = store.get_conversation(conversation_id)
    if not conv:
        conv = store.create_conversation(
            encounter_id="ENC-2026-DEMO",
            patient_id="PAT-10928",
            session_id=None,
            language_preference="en"
        )
        conv["conversationId"] = conversation_id
        store.conversations[conversation_id] = conv

    history = store.get_clinical_history(conv["encounterId"]) or {}
    lang = conv.get("languagePreference", "en")
    
    question_data = orchestrator.generate_next_question(
        conversation_id=conversation_id,
        history=history,
        question_count=conv["questionCount"],
        lang=lang
    )

    return {
        "conversationId": conversation_id,
        "questionId": question_data["questionId"],
        "question": question_data["question"],
        "targetSection": question_data["targetSection"],
        "targetField": question_data["targetField"],
        "questionType": question_data.get("questionType", "single_choice"),
        "options": question_data.get("options", []),
        "shouldContinue": question_data.get("shouldContinue", True),
        "mode": question_data.get("mode", "DETERMINISTIC_FALLBACK")
    }

@router.post("/conversations/{conversation_id}/answer", response_model=ConversationResponse, summary="Submit Patient Answer")
def submit_answer(conversation_id: str, req: AnswerSubmitRequest):
    conv = store.get_conversation(conversation_id)
    if not conv:
        conv = store.create_conversation(
            encounter_id="ENC-2026-DEMO",
            patient_id="PAT-10928",
            session_id=None,
            language_preference="en"
        )
        conv["conversationId"] = conversation_id
        store.conversations[conversation_id] = conv

    # Validate patient input against prompt injection & unsafe requests
    safety_check = orchestrator.validate_patient_input(req.answerValue)
    if not safety_check["safe"]:
        # Record sanitized notice without executing command
        updated_conv = store.record_answer(
            conversation_id=conversation_id,
            target_section=req.targetSection,
            target_field=req.targetField,
            answer_value="Patient requested diagnostic advice — Redirected to attending doctor."
        )
        return updated_conv

    updated_conv = store.record_answer(
        conversation_id=conversation_id,
        target_section=req.targetSection,
        target_field=req.targetField,
        answer_value=req.answerValue
    )
    return updated_conv
