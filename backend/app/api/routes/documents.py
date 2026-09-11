import random
import datetime
from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form, Query
from typing import Optional
from app.services.store import store
from app.services.ocr_service import DocumentOCRService
from app.schemas.patient import DocumentResponse, DocumentListResponse

router = APIRouter()

@router.post("/encounters/{encounter_id}/documents", response_model=DocumentResponse)
async def upload_encounter_document(
    encounter_id: str,
    patient_id: str = Form(...),
    document_type: Optional[str] = Form("OTHER"),
    is_sample_demo: Optional[bool] = Form(False),
    file: Optional[UploadFile] = File(None),
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Uploads a medical document (Lab report, Prescription, Discharge summary),
    runs OCR text extraction, and stores the document record with provenance OCR_EXTRACTED.
    """
    # 1. Validate encounter existence
    encounter = store.get_encounter(encounter_id)
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found.")

    # 2. Patient / Encounter Isolation Check
    if encounter["patientId"] != patient_id:
        raise HTTPException(status_code=403, detail="Patient ID does not match encounter record.")

    # 3. Session Validation Check if provided
    if x_session_id:
        session = store.get_session(x_session_id)
        if session and session["patientId"] != patient_id:
            raise HTTPException(status_code=403, detail="Session patient mismatch.")

    # Read uploaded file content or handle sample demo mode
    file_name = "sample_medical_report.pdf"
    mime_type = "application/pdf"
    file_bytes = b""

    if is_sample_demo or (file is None and not is_sample_demo):
        file_name = "sample_lab_prescription.pdf"
        mime_type = "application/pdf"
        file_bytes = b""  # Handled by OCR service sample demo engine
    else:
        file_name = file.filename or "uploaded_document.png"
        mime_type = file.content_type or "image/png"
        file_bytes = await file.read()

    # Run DocumentOCRService
    ocr_result = DocumentOCRService.extract_text(file_bytes, file_name, mime_type)

    if ocr_result["status"] == "FAILED":
        raise HTTPException(status_code=400, detail=ocr_result["error"])

    doc_id = f"DOC-{random.randint(10000, 99999)}"
    now = datetime.datetime.now().isoformat()

    doc_record = {
        "documentId": doc_id,
        "patientId": patient_id,
        "encounterId": encounter_id,
        "sessionId": x_session_id,
        "documentType": ocr_result.get("documentType", document_type or "OTHER"),
        "fileName": file_name,
        "mimeType": mime_type,
        "status": ocr_result["status"],
        "extractedText": ocr_result["extractedText"],
        "ocrConfidence": ocr_result["ocrConfidence"],
        "source": "OCR_EXTRACTED",
        "createdAt": now,
        "updatedAt": now
    }

    store.save_document(doc_record)

    # Append to clinical history investigations metadata as reference
    history = store.get_clinical_history(encounter_id)
    if history:
        if "investigations" not in history or not isinstance(history["investigations"], list):
            history["investigations"] = []
        history["investigations"].append({
            "documentId": doc_id,
            "title": file_name,
            "type": doc_record["documentType"],
            "source": "OCR_EXTRACTED",
            "uploadedAt": now
        })
        store.save_clinical_history(encounter_id, history)

    return doc_record


@router.get("/encounters/{encounter_id}/documents", response_model=DocumentListResponse)
def list_encounter_documents(
    encounter_id: str,
    patient_id: str = Query(...),
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Lists all medical documents uploaded for a specific encounter.
    """
    encounter = store.get_encounter(encounter_id)
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found.")

    if encounter["patientId"] != patient_id:
        raise HTTPException(status_code=403, detail="Patient ID does not match encounter record.")

    docs = store.list_encounter_documents(encounter_id)

    return {
        "encounterId": encounter_id,
        "patientId": patient_id,
        "documents": docs,
        "totalCount": len(docs)
    }


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document_details(document_id: str):
    """
    Retrieves a single medical document's metadata and OCR extracted text.
    """
    doc = store.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    return doc
