import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KioskHeader, KioskStepIndicator } from '../../components/kiosk/KioskComponents';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  RefreshCw,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Globe,
  Accessibility,
  Lock
} from 'lucide-react';

export function KioskSessionPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [sessionData, setSessionData] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    const rawData = sessionStorage.getItem('activeKioskSession');
    const rawSession = sessionStorage.getItem('activeSession');

    if (!rawData) {
      navigate('/kiosk');
      return;
    }

    try {
      setSessionData(JSON.parse(rawData));
      if (rawSession) {
        setActiveSession(JSON.parse(rawSession));
      }
    } catch (e) {
      navigate('/kiosk');
    }
  }, [navigate]);

  if (!sessionData) return null;

  const { patient, encounter, session } = sessionData;
  const isConsentAccepted = activeSession?.consentStatus === 'accepted';
  const selectedLang = activeSession?.languagePreference || i18n.language || 'en';
  const langLabel = selectedLang === 'hi' ? 'हिंदी (Hindi)' : selectedLang === 'mr' ? 'मराठी (Marathi)' : 'English';

  const handleResetSession = () => {
    sessionStorage.removeItem('pendingPatient');
    sessionStorage.removeItem('activeKioskSession');
    sessionStorage.removeItem('activeSession');
    navigate('/kiosk');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between select-none font-sans">
      {/* Kiosk Header */}
      <KioskHeader showBack={true} onBack={handleResetSession} />

      {/* Progress Stepper */}
      <KioskStepIndicator currentStep={isConsentAccepted ? 4 : 1} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left space-y-6 p-6 sm:p-8"
        >
          {/* Header Banner */}
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Session Established
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                {isConsentAccepted ? 'Session & Consent Ready' : 'Patient Session Established'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {isConsentAccepted
                  ? 'Language, accessibility, and consent verified. Ready for clinical history taking.'
                  : 'Patient identity confirmed. Proceed to language and consent setup.'}
              </p>
            </div>
          </div>

          {/* Session Metadata Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#1E56A0]" />
                Encounter &amp; Session Context
              </span>
              <span className="font-mono text-emerald-700 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                STATUS: {session.status || 'ACTIVE'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-sans font-bold text-slate-500 uppercase block">Session ID</span>
                <span className="font-bold text-[#1E56A0] mt-0.5 block truncate">{activeSession?.sessionId || session.sessionId}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-sans font-bold text-slate-500 uppercase block">Encounter ID</span>
                <span className="font-bold text-teal-700 mt-0.5 block truncate">{encounter.id}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-sans font-bold text-slate-500 uppercase block">Patient ID</span>
                <span className="font-bold text-slate-900 mt-0.5 block truncate">{patient.id}</span>
              </div>
            </div>
          </div>

          {/* Phase 3 Config Summary Pill */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
              <span>{patient.name}</span>
              <span className="text-xs text-slate-500 font-normal">{patient.age}y • {patient.gender}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                <Globe className="w-3.5 h-3.5 text-[#1E56A0]" />
                <span>{langLabel}</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                <Accessibility className="w-3.5 h-3.5 text-teal-600" />
                <span>Text: {activeSession?.accessibilityPreferences?.textSize || 'normal'}</span>
              </div>

              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className={isConsentAccepted ? 'text-emerald-700' : 'text-amber-700'}>
                  Consent: {isConsentAccepted ? 'Accepted' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            {!isConsentAccepted ? (
              <button
                type="button"
                onClick={() => navigate('/kiosk/language')}
                className="w-full py-4 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-sm sm:text-base transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Language &amp; Consent Setup</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/kiosk/history')}
                className="w-full py-4 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-sm sm:text-base transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-teal-300" />
                <span>Start Clinical History Check (Phase 4)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleResetSession}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              End Session &amp; Return to Kiosk Lobby
            </button>
          </div>

        </motion.div>
      </main>

      {/* Footer Branding */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium">
        MediKiosk Clinical Core v2.4 • Multilingual &amp; Consent Session Context
      </footer>
    </div>
  );
}
