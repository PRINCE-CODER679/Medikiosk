import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { KioskHeader, KioskStepIndicator } from '../../components/kiosk/KioskComponents';
import { useAccessibility } from '../../context/AccessibilityContext';
import { TTS } from '../../utils/tts';
import { ApiService } from '../../services/api';

export function KioskDocumentPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isHighContrast, getTextSizeClass, voiceGuidance } = useAccessibility();

  const [docType, setDocType] = useState('LAB_REPORT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const activeEncounter = JSON.parse(sessionStorage.getItem('activeEncounter') || '{}');
  const activeSession = JSON.parse(sessionStorage.getItem('activeSession') || '{}');
  const activePatient = JSON.parse(sessionStorage.getItem('activePatient') || '{}');

  const encounterId = activeEncounter.id || 'ENC-DEMO-999';
  const patientId = activePatient.id || 'PAT-10928';
  const sessionId = activeSession.sessionId || null;

  // Load existing uploaded documents on mount
  useEffect(() => {
    async function loadDocuments() {
      const res = await ApiService.getEncounterDocuments(encounterId, patientId, sessionId);
      if (res.ok && res.data && res.data.documents) {
        setDocuments(res.data.documents);
        if (res.data.documents.length > 0) {
          setSelectedDoc(res.data.documents[res.data.documents.length - 1]);
        }
      }
    }
    loadDocuments();
  }, [encounterId, patientId, sessionId]);

  const handleProcessDocument = async (formData, isSample = false) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStep(t('kiosk_scan_detected') || 'Document Detected...');

    if (voiceGuidance) {
      TTS.speak(t('kiosk_scan_enhancing') || 'Processing medical document OCR...', i18n.language);
    }

    setTimeout(() => setProcessingStep(t('kiosk_scan_enhancing') || 'Enhancing Image Quality & Formatting...'), 600);
    setTimeout(() => setProcessingStep(t('kiosk_scan_extracting') || 'Extracting Text & Provenance OCR_EXTRACTED...'), 1200);

    const res = await ApiService.uploadEncounterDocument(encounterId, formData, sessionId);

    if (res.ok && res.data) {
      const newDoc = res.data;
      setDocuments(prev => [...prev, newDoc]);
      setSelectedDoc(newDoc);

      // Save active documents array to sessionStorage for downstream pages
      const existingDocs = JSON.parse(sessionStorage.getItem('activeDocuments') || '[]');
      sessionStorage.setItem('activeDocuments', JSON.stringify([...existingDocs, newDoc]));

      if (voiceGuidance) {
        TTS.speak(`${t('kiosk_scan_completed')} ${newDoc.fileName}`, i18n.language);
      }
    } else {
      setErrorMessage(res.error || 'Failed to process document OCR. Please check file type or try another file.');
    }

    setIsProcessing(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size client-side (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('document_type', docType);
    formData.append('file', file);

    handleProcessDocument(formData, false);
  };

  const handleSampleDemoUpload = () => {
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('document_type', docType);
    formData.append('is_sample_demo', 'true');

    handleProcessDocument(formData, true);
  };

  const handleProceed = () => {
    navigate('/kiosk/history/review');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isHighContrast ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <KioskHeader currentStepTitle={t('kiosk_scanner_title')} onBack={() => navigate('/kiosk/history/safety')} showBack={true} />
      <KioskStepIndicator currentStep={5} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Phase 7 — Document Intelligence & OCR</span>
            <span>•</span>
            <span>Provenance: OCR_EXTRACTED</span>
          </div>
          <h1 className={`text-2xl font-bold ${isHighContrast ? 'text-white' : 'text-slate-900'}`}>
            {t('kiosk_scanner_title')}
          </h1>
          <p className={`text-sm ${isHighContrast ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('kiosk_scanner_sub')}
          </p>
        </div>

        {/* Upload Controls Box */}
        <div className={`p-6 rounded-xl border ${isHighContrast ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} space-y-5`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload or Scan Medical Document</h3>
              <p className="text-xs text-slate-500 mt-0.5">Supports PDF, PNG, JPG up to 10MB. OCR extracts text without diagnosis.</p>
            </div>

            {/* Document Type Selector */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-600">Category:</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-slate-50 text-slate-800 cursor-pointer"
              >
                <option value="LAB_REPORT">Lab Report</option>
                <option value="PRESCRIPTION">Prescription</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                <option value="MEDICAL_REPORT">Medical Report</option>
                <option value="OTHER">Other Document</option>
              </select>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* File Upload Input Button */}
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-xl bg-slate-50 hover:bg-teal-50/50 cursor-pointer transition-all text-center">
              <span className="text-2xl mb-1">📁</span>
              <span className="text-sm font-bold text-slate-800">Select File from Device</span>
              <span className="text-xs text-slate-500">PNG, JPG, PDF (Max 10MB)</span>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.txt"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
            </label>

            {/* SIH Sample Demo Trigger Button */}
            <button
              onClick={handleSampleDemoUpload}
              disabled={isProcessing}
              className="flex flex-col items-center justify-center p-4 border-2 border-teal-600 rounded-xl bg-teal-50 hover:bg-teal-100/80 cursor-pointer transition-all text-center"
            >
              <span className="text-2xl mb-1">⚡</span>
              <span className="text-sm font-bold text-teal-900">{t('kiosk_btn_scan_sample') || 'Scan Sample Demo Report'}</span>
              <span className="text-xs text-teal-700">Simulate SIH 2026 Sample Lab & Prescription OCR</span>
            </button>
          </div>

          {/* Processing Status Banner */}
          {isProcessing && (
            <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-teal-900">{processingStep}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
              ⚠️ {errorMessage}
            </div>
          )}
        </div>

        {/* OCR Result Preview */}
        {selectedDoc && (
          <div className={`p-6 rounded-xl border ${isHighContrast ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📄</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedDoc.fileName}</h3>
                  <span className="text-xs text-slate-500">Category: {selectedDoc.documentType} • Mime: {selectedDoc.mimeType}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-teal-100 text-teal-800 font-mono text-xs font-bold">
                  {selectedDoc.status}
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                  Confidence: {Math.round((selectedDoc.ocrConfidence || 0.95) * 100)}%
                </span>
              </div>
            </div>

            {/* Extracted Text Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Extracted Text Content</span>
                <span className="text-teal-700 font-mono">Source: {selectedDoc.source || 'OCR_EXTRACTED'}</span>
              </div>
              <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 text-xs font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
                {selectedDoc.extractedText || 'No text extracted.'}
              </pre>
            </div>

            {/* Patient Verification Disclaimer */}
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold">⚠️ Patient Review Notice:</span>
              <p>
                The information above was extracted from your document using automated OCR and may contain formatting errors.
                This content has been tagged as <span className="font-semibold underline">OCR_EXTRACTED</span> and must be verified by a healthcare professional during your consultation.
              </p>
            </div>
          </div>
        )}

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Uploaded Encounter Documents ({documents.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc, idx) => (
                <div
                  key={doc.documentId || idx}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedDoc?.documentId === doc.documentId
                      ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="truncate">
                    <span className="block truncate">{doc.fileName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{doc.documentType} • {doc.source}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-700">View →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleProceed}
            className="w-full py-4 px-6 rounded-xl font-bold text-base bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all text-center cursor-pointer"
          >
            {t('btn_continue_review') || 'Proceed to Final Health Summary Review'} →
          </button>
        </div>
      </main>
    </div>
  );
}
