import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KioskHeader } from '../../components/kiosk/KioskComponents';
import { ApiService } from '../../services/api';
import { useAccessibility } from '../../context/AccessibilityContext';
import { TTS } from '../../utils/tts';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Pill,
  ShieldAlert,
  Activity,
  ArrowRight,
  ArrowLeft,
  Users,
  User,
  FlaskConical,
  Heart,
  FileCheck,
  Tag,
  Download,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export function KioskSummaryPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { voiceGuidance } = useAccessibility();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    const rawSession = sessionStorage.getItem('activeSession') || sessionStorage.getItem('activeKioskSession');
    let sessionObj = null;
    if (rawSession) {
      try {
        sessionObj = JSON.parse(rawSession);
        setActiveSession(sessionObj);
      } catch (e) {}
    }

    const encounterId = sessionObj?.encounterId || sessionObj?.encounter?.id || 'ENC-2026-DEMO';
    const patientId = sessionObj?.patientId || sessionObj?.patient?.id || 'PAT-10928';
    const sessionId = sessionObj?.sessionId || sessionObj?.session?.sessionId || null;

    fetchSummary(encounterId, patientId, sessionId);
  }, []);

  const fetchSummary = async (encounterId, patientId, sessionId) => {
    setLoading(true);
    const res = await ApiService.generateSummary(encounterId, patientId, sessionId);
    if (res.ok && res.data) {
      setSummary(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (voiceGuidance) {
      TTS.speak('Here is your generated Clinical Intake Summary for physician review.', i18n.language);
    }
  }, [voiceGuidance, i18n.language]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between select-none font-sans print:bg-white print:text-black">
      {/* Kiosk Header */}
      <div className="print:hidden">
        <KioskHeader showBack={true} onBack={() => navigate('/kiosk/review')} />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center print:max-w-full print:p-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left space-y-6 print:border-none print:shadow-none"
        >
          {/* Header Banner */}
          <div className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 flex items-center justify-between print:bg-none print:border-b-2 print:border-slate-800">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 print:hidden">
                <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                Phase 10 • Clinical Intake Summary Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Clinical Intake Summary
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium print:text-slate-800">
                Aggregated intake report compiled for physician review prior to consultation.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer print:hidden"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Print / Save PDF
            </button>
          </div>

          {/* Summary Body */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm font-medium space-y-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Compiling structured clinical intake summary...</p>
            </div>
          ) : summary ? (
            <div className="px-5 sm:px-7 space-y-6 pb-6">

              {/* 1. Patient Demographics & Header Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Patient Name:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{summary.patientHeader?.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Patient ID:</span>
                  <span className="font-mono font-bold text-slate-900">{summary.patientHeader?.patientId}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Age / Gender:</span>
                  <span className="font-bold text-slate-900">{summary.patientHeader?.age} Yrs / {summary.patientHeader?.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">ABHA ID / ABDM:</span>
                  <span className="font-mono font-bold text-slate-900">{summary.patientHeader?.abhaId}</span>
                </div>
              </div>

              {/* 2. Authoritative Safety Assessment Badge */}
              {(() => {
                const status = summary.safetyAssessment?.status || 'NO_IMMEDIATE_FLAG';
                return (
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    status === 'EMERGENCY'
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : status === 'URGENT'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-current">
                          Safety Assessment Status: {status}
                        </span>
                        <span className="text-xs font-mono font-bold">
                          {summary.safetyAssessment?.safetyAssessmentId}
                        </span>
                      </div>
                      <p className="text-xs font-semibold">
                        {summary.safetyAssessment?.patientGuidance}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 bg-white/80 px-2 py-1 rounded border border-current">
                      Source: SAFETY_ENGINE (v{summary.safetyAssessment?.ruleVersion})
                    </span>
                  </div>
                );
              })()}

              {/* 3. Chief Complaint & History of Present Illness (HPI) */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Stethoscope className="w-4 h-4 text-[#1E56A0]" />
                    Chief Complaint &amp; HPI
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">Source: PATIENT_REPORTED</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block">Primary Symptom:</span>
                    <span className="font-bold text-slate-900">{summary.chiefComplaint?.primarySymptom}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Onset &amp; Duration:</span>
                    <span className="font-bold text-slate-900">{summary.chiefComplaint?.onset} ({summary.chiefComplaint?.duration})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Reported Severity:</span>
                    <span className="font-bold text-slate-900">{summary.hpi?.severity}</span>
                  </div>
                </div>

                {summary.hpi?.aiClarifications?.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-xs">
                    <span className="text-slate-600 font-bold flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
                      AI Follow-up Clarifications (Phase 5):
                    </span>
                    {summary.hpi.aiClarifications.map((item, idx) => (
                      <div key={idx} className="p-2 rounded bg-white border border-slate-200 flex justify-between">
                        <span className="font-medium text-slate-700">• {item.questionField}:</span>
                        <span className="font-bold text-slate-900">{item.answer}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Past Medical History */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Activity className="w-4 h-4 text-purple-600" />
                    Relevant Medical History
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">Source: STRUCTURED_HISTORY</span>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <span className="text-slate-500 font-medium block">Past Conditions:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {summary.pastMedicalHistory?.conditions?.map((c, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-white border border-slate-200 font-bold text-slate-800">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Current Medications & Allergies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Current Medications */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                      <Pill className="w-4 h-4 text-sky-600" />
                      Current Medications
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5">
                    {summary.currentMedications?.length > 0 ? (
                      summary.currentMedications.map((m, idx) => (
                        <div key={idx} className="p-2 rounded bg-white border border-slate-200 space-y-0.5">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{m.name}</span>
                            <span className="font-mono text-[11px] text-slate-500">{m.dose}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 flex justify-between">
                            <span>Freq: {m.frequency}</span>
                            <span className="font-mono text-[10px] text-slate-400">[{m.provenance}]</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 font-medium">No current medications reported.</span>
                    )}
                  </div>
                </div>

                {/* Allergies */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Reported Allergies
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5">
                    {summary.allergies?.length > 0 ? (
                      summary.allergies.map((a, idx) => (
                        <div key={idx} className="p-2 rounded bg-white border border-rose-200 text-rose-900 flex justify-between font-bold">
                          <span>• {a.allergen}</span>
                          <span className="font-normal text-slate-600">{a.reaction}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 font-medium">No known allergies reported.</span>
                    )}
                  </div>
                </div>

              </div>

              {/* 6. Investigations & Document Extracted Entities */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <FlaskConical className="w-4 h-4 text-blue-600" />
                    Document-Derived Investigations &amp; Vitals (Phase 8 OCR)
                  </span>
                  <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    OCR Parsed — Requires Verification
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Lab Investigations */}
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold block">Lab Investigations:</span>
                    {summary.investigationsVitals?.investigations?.length > 0 ? (
                      summary.investigationsVitals.investigations.map((inv, idx) => (
                        <div key={idx} className="p-2 rounded bg-white border border-slate-200 flex justify-between">
                          <span className="font-semibold text-slate-800">{inv.testName}</span>
                          <span className="font-bold text-blue-900">{inv.resultValue} {inv.unit}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 font-medium">No lab investigations extracted.</span>
                    )}
                  </div>

                  {/* Vitals */}
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold block">Vital Signs:</span>
                    {summary.investigationsVitals?.vitals?.length > 0 ? (
                      summary.investigationsVitals.vitals.map((v, idx) => (
                        <div key={idx} className="p-2 rounded bg-white border border-slate-200 flex justify-between">
                          <span className="font-semibold text-slate-800">{v.type}</span>
                          <span className="font-bold text-rose-800">{v.value} {v.unit}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 font-medium">No vitals extracted from documents.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 7. Missing / Unreported Information */}
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                  Missing / Unreported Sections:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {summary.missingInformation?.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded bg-white border border-slate-300 font-medium text-slate-600">
                      • {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* 8. Mandatory Physician Verification Disclaimer */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold block text-amber-950 uppercase tracking-wide">Physician Verification Notice</span>
                  <p className="font-medium leading-relaxed">
                    {summary.physicianVerificationNotice}
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              Failed to load clinical summary. Please try refreshing.
            </div>
          )}

          {/* Action Row */}
          <div className="p-5 sm:p-7 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 print:hidden">
            <button
              type="button"
              onClick={() => navigate('/kiosk/review')}
              className="py-3.5 px-5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Intake Review</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/kiosk/timeline')}
              className="py-3.5 px-5 bg-white border border-blue-200 hover:bg-blue-50 text-[#1E56A0] rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>View Timeline (Phase 9)</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/kiosk/session')}
              className="flex-1 py-4 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-base transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>FINISH KIOSK INTAKE SESSION</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium print:hidden">
        MediKiosk Clinical Summary Engine • Intake Summary Verification (Phase 10)
      </footer>
    </div>
  );
}
