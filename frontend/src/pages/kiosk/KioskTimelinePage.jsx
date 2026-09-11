import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KioskHeader } from '../../components/kiosk/KioskComponents';
import { ApiService } from '../../services/api';
import { useAccessibility } from '../../context/AccessibilityContext';
import { TTS } from '../../utils/tts';
import {
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Pill,
  ShieldAlert,
  Activity,
  ArrowRight,
  ArrowLeft,
  Building2,
  HelpCircle,
  FlaskConical,
  Heart,
  FileCheck2,
  Tag
} from 'lucide-react';

export function KioskTimelinePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { voiceGuidance } = useAccessibility();

  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState(null);
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

    fetchTimeline(encounterId, patientId, sessionId);
  }, []);

  const fetchTimeline = async (encounterId, patientId, sessionId) => {
    setLoading(true);
    const res = await ApiService.getTimeline(encounterId, patientId, sessionId);
    if (res.ok && res.data) {
      setTimeline(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (voiceGuidance) {
      TTS.speak('Here is your longitudinal health timeline summarizing your intake records and documents.', i18n.language);
    }
  }, [voiceGuidance, i18n.language]);

  const getEventBadge = (eventType, provenance) => {
    switch (eventType) {
      case 'ENCOUNTER':
        return { label: 'Check-in', bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: Building2 };
      case 'CHIEF_COMPLAINT':
        return { label: 'Chief Complaint', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: Stethoscope };
      case 'CLINICAL_HISTORY':
        return { label: 'Past History', bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: Activity };
      case 'AI_CLARIFICATION':
        return { label: 'AI Clarification', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200', icon: HelpCircle };
      case 'SAFETY_ASSESSMENT':
        return { label: 'Safety Triage', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: ShieldAlert };
      case 'DOCUMENT':
        return { label: 'Scanned Document', bg: 'bg-slate-100 text-slate-800 border-slate-300', icon: FileText };
      case 'CONDITION':
        return { label: 'Extracted Diagnosis', bg: 'bg-amber-50 text-amber-900 border-amber-200', icon: Activity };
      case 'MEDICATION':
        return { label: 'Medication', bg: 'bg-sky-50 text-sky-800 border-sky-200', icon: Pill };
      case 'ALLERGY':
        return { label: 'Allergy', bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: ShieldAlert };
      case 'SYMPTOM':
        return { label: 'Symptom', bg: 'bg-orange-50 text-orange-800 border-orange-200', icon: Stethoscope };
      case 'PROCEDURE':
        return { label: 'Procedure', bg: 'bg-teal-50 text-teal-800 border-teal-200', icon: Stethoscope };
      case 'INVESTIGATION':
        return { label: 'Lab Investigation', bg: 'bg-blue-50 text-blue-900 border-blue-200', icon: FlaskConical };
      case 'VITAL':
        return { label: 'Vital Sign', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: Heart };
      default:
        return { label: eventType, bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: Tag };
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'System Log Time';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between select-none font-sans">
      {/* Kiosk Header */}
      <KioskHeader showBack={true} onBack={() => navigate('/kiosk/review')} />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left space-y-6"
        >
          {/* Header Banner */}
          <div className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                Phase 9 • Longitudinal Patient Record
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Your Health Timeline
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Structured chronological record of your intake history, uploaded medical documents, and extracted entities.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const encId = activeSession?.encounterId || activeSession?.encounter?.id || 'ENC-2026-DEMO';
                const patId = activeSession?.patientId || activeSession?.patient?.id || 'PAT-10928';
                fetchTimeline(encId, patId, activeSession?.sessionId);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Refresh Timeline
            </button>
          </div>

          {/* Timeline Body */}
          <div className="px-5 sm:px-7 space-y-4">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm font-medium space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p>Aggregating patient records &amp; building timeline...</p>
              </div>
            ) : timeline?.items?.length > 0 ? (
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
                {timeline.items.map((item, idx) => {
                  const badge = getEventBadge(item.eventType, item.provenance);
                  const Icon = badge.icon;
                  const isOcrEntity = item.provenance === 'OCR_EXTRACTED_ENTITY';

                  return (
                    <div key={item.id || idx} className="relative pl-6 sm:pl-8">
                      {/* Timeline Bullet Node */}
                      <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-2xs">
                        <Icon className="w-4 h-4 text-slate-700" />
                      </div>

                      {/* Timeline Card */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {item.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                            {item.clinicalDate && (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-sans font-semibold">
                                Event Date: {item.clinicalDate}
                              </span>
                            )}
                            <span>{formatTimestamp(item.systemTimestamp)}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                          {item.description}
                        </p>

                        {/* Provenance & Disclaimer Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span>Source: <strong className="text-slate-700 font-semibold">{item.source}</strong></span>
                            {item.sourceDocumentId && (
                              <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                                Doc #{item.sourceDocumentId}
                              </span>
                            )}
                          </div>

                          {isOcrEntity && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              Extracted from uploaded document — Requires physician verification
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">
                No timeline records available for this encounter.
              </div>
            )}

            {/* Non-Diagnostic Clinical Timeline Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Notice:</strong> This timeline aggregates patient-reported information, AI clarification responses, and document text extracted by OCR. Extracted findings require physician verification and do not constitute confirmed medical diagnoses.
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="p-5 sm:p-7 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
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
              onClick={() => navigate('/kiosk/session')}
              className="flex-1 py-4 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-base transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>RETURN TO KIOSK SESSION</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium">
        MediKiosk Medical Timeline Engine • Longitudinal Patient Record Integration (Phase 9)
      </footer>
    </div>
  );
}
