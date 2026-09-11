import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KioskHeader, KioskStepIndicator } from '../../components/kiosk/KioskComponents';
import { ApiService } from '../../services/api';
import { useAccessibility } from '../../context/AccessibilityContext';
import { TTS } from '../../utils/tts';
import {
  FileText,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Pill,
  ShieldAlert,
  Users,
  User,
  Activity,
  ArrowRight,
  ArrowLeft,
  Building2,
  Sparkles
} from 'lucide-react';

export function KioskHistoryReviewPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { voiceGuidance } = useAccessibility();

  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  const [historyData, setHistoryData] = useState(() => {
    const saved = sessionStorage.getItem('clinicalHistory');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      chiefComplaint: { primarySymptom: 'Fever and Cough', onset: '1-3 Days ago', duration: '3 days', description: 'Persistent fever' },
      hpi: { severity: 6, location: 'Chest', character: 'Dull ache', aggravatingFactors: 'Exertion', relievingFactors: 'Rest' },
      pastMedicalHistory: { conditions: ['Hypertension'], surgeries: [], hospitalizations: [] },
      medications: [{ name: 'Amlodipine', dose: '5mg', frequency: 'Once daily' }],
      allergies: [{ allergen: 'Penicillin', reaction: 'Rash' }],
      familyHistory: { conditions: ['Diabetes'] },
      personalHistory: { smoking: 'Never', alcohol: 'Never' },
      reviewOfSystems: { general: ['Chills / Sweat'] }
    };
  });

  useEffect(() => {
    const rawSession = sessionStorage.getItem('activeSession') || sessionStorage.getItem('activeKioskSession');
    if (rawSession) {
      try { setActiveSession(JSON.parse(rawSession)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (voiceGuidance) {
      TTS.speak(t('review_title', 'Review your health information before confirming.'), i18n.language);
    }
  }, [voiceGuidance, t, i18n.language]);

  const handleConfirm = async () => {
    setLoading(true);

    const encounterId = activeSession?.encounterId || activeSession?.encounter?.id || 'ENC-2026-DEMO';
    const patientId = activeSession?.patientId || activeSession?.patient?.id || 'PAT-10928';
    const sessionId = activeSession?.sessionId || activeSession?.session?.sessionId || null;

    if (encounterId) {
      await ApiService.saveClinicalHistory(encounterId, {
        ...historyData,
        completionStatus: 'COMPLETED'
      });
      await ApiService.generateSummary(encounterId, patientId, sessionId);
    }

    if (sessionId) {
      await ApiService.updateSession(sessionId, {
        currentWorkflowStep: 'SUMMARY_GENERATED'
      });
    }

    // Save final confirmed status in session storage
    const updatedSession = JSON.parse(sessionStorage.getItem('activeSession') || '{}');
    updatedSession.historyCompleted = true;
    updatedSession.summaryGenerated = true;
    sessionStorage.setItem('activeSession', JSON.stringify(updatedSession));

    setLoading(false);
    navigate('/kiosk/summary');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between select-none font-sans">
      {/* Kiosk Header */}
      <KioskHeader showBack={true} onBack={() => navigate('/kiosk/history/documents')} />

      {/* Progress Stepper (Overall Step 4) */}
      <KioskStepIndicator currentStep={4} />

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left space-y-6"
        >
          {/* Header Banner */}
          <div className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Final Step • Intake Review
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('review_title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {t('review_subtitle')}
              </p>
            </div>
          </div>

          {/* Structured History Cards */}
          <div className="px-5 sm:px-7 space-y-4">
            
            {/* Safety Assessment Summary Badge */}
            {(() => {
              const savedSafety = sessionStorage.getItem('activeSafetyAssessment');
              let safety = null;
              if (savedSafety) {
                try { safety = JSON.parse(savedSafety); } catch (e) {}
              }
              const status = safety?.status || 'NO_IMMEDIATE_FLAG';

              return (
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  status === 'EMERGENCY'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : status === 'URGENT'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-teal-50 border-teal-200 text-teal-900'
                }`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-current shadow-2xs">
                        Clinical Safety Status
                      </span>
                      <span className="text-xs font-mono font-bold">
                        {safety?.safetyAssessmentId || 'SAF-CHECKED'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold mt-1">
                      {safety?.patientGuidance || 'No predefined immediate warning pattern identified from reported history.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/kiosk/history/safety')}
                    className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border border-current hover:bg-white/60 transition-colors"
                  >
                    View Safety Details →
                  </button>
                </div>
              );
            })()}
            
            {/* 1. Chief Complaint & HPI */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                  <Stethoscope className="w-4 h-4 text-[#1E56A0]" />
                  Chief Complaint &amp; HPI
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/kiosk/history')}
                  className="text-xs font-bold text-[#1E56A0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t('edit_section')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Primary Symptom:</span>
                  <span className="font-bold text-slate-900">{historyData.chiefComplaint.primarySymptom || 'Not specified'}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Onset &amp; Severity:</span>
                  <span className="font-bold text-slate-900">{historyData.chiefComplaint.onset || '1-3 Days ago'} • Severity Level {historyData.hpi.severity}/10</span>
                </div>

                {historyData.chiefComplaint.description && (
                  <div className="col-span-1 sm:col-span-2 pt-1">
                    <span className="text-slate-500 font-medium block">Description:</span>
                    <span className="font-medium text-slate-800">"{historyData.chiefComplaint.description}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Past Medical History */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Past Medical History
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/kiosk/history')}
                  className="text-xs font-bold text-[#1E56A0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t('edit_section')}</span>
                </button>
              </div>

              <div className="text-xs">
                {historyData.pastMedicalHistory.conditions?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {historyData.pastMedicalHistory.conditions.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-bold text-slate-800">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 font-medium">No past medical conditions reported.</span>
                )}
              </div>
            </div>

            {/* 3. Medications & Allergies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Current Medications */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <Pill className="w-4 h-4 text-blue-600" />
                    Current Medications
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  {historyData.medications?.length > 0 ? (
                    historyData.medications.map((m, idx) => (
                      <div key={idx} className="font-semibold text-slate-800">
                        • {m.name} <span className="text-slate-500 font-mono">({m.dose || 'Standard'})</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500 font-medium">No current medications reported.</span>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    Reported Allergies
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  {historyData.allergies?.length > 0 ? (
                    historyData.allergies.map((a, idx) => (
                      <div key={idx} className="font-bold text-red-700">
                        • {a.allergen} {a.reaction ? `(${a.reaction})` : ''}
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500 font-medium">No known allergies.</span>
                  )}
                </div>
              </div>

            </div>

            {/* 4. Family & Personal History */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-600" />
                  Family &amp; Lifestyle History
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-medium block">Family History:</span>
                  <span className="font-bold text-slate-800">
                    {historyData.familyHistory.conditions?.join(', ') || 'No major conditions'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Smoking / Alcohol:</span>
                  <span className="font-bold text-slate-800">
                    {historyData.personalHistory.smoking} / {historyData.personalHistory.alcohol}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Scanned / Uploaded Medical Documents (OCR) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Scanned Medical Documents &amp; OCR
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/kiosk/history/documents')}
                  className="text-xs font-bold text-[#1E56A0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t('edit_section')}</span>
                </button>
              </div>
              <div className="text-xs">
                {(() => {
                  const docs = JSON.parse(sessionStorage.getItem('activeDocuments') || '[]');
                  if (docs.length === 0) {
                    return <span className="text-slate-500 font-medium">No medical documents scanned during intake.</span>;
                  }
                  return (
                    <div className="space-y-1.5">
                      {docs.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-800">{d.fileName}</span>
                            <span className="block text-[10px] text-slate-500">{d.documentType} • Source: {d.source || 'OCR_EXTRACTED'}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-mono text-[10px] font-bold">
                            {d.status} ({Math.round((d.ocrConfidence || 0.95)*100)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Non-Diagnostic Disclaimer Box */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{t('review_disclaimer')}</span>
            </div>

          </div>

          {/* Action Row */}
          <div className="p-5 sm:p-7 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/kiosk/history')}
              className="py-3.5 px-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Edit Responses</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/kiosk/timeline')}
              className="py-3.5 px-4 bg-white border border-blue-200 hover:bg-blue-50 text-[#1E56A0] rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>View Health Timeline</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-4 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-base transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>{t('generate_summary_btn', 'GENERATE CLINICAL SUMMARY')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium">
        MediKiosk Clinical History Engine • Structured Patient Summary Verification
      </footer>
    </div>
  );
}
