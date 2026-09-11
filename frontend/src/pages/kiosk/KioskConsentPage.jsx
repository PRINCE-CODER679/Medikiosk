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
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  Info,
  Lock,
  UserCheck
} from 'lucide-react';

export function KioskConsentPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { voiceGuidance } = useAccessibility();

  const [loading, setLoading] = useState(false);
  const [showDeclinedModal, setShowDeclinedModal] = useState(false);

  useEffect(() => {
    if (voiceGuidance) {
      TTS.speak(t('kiosk_consent_title', 'Patient information and consent terms.'), i18n.language);
    }
  }, [voiceGuidance, t, i18n.language]);

  const handleAgree = async () => {
    setLoading(true);
    const activeSession = JSON.parse(sessionStorage.getItem('activeSession') || '{}');
    const nowIso = new Date().toISOString();

    activeSession.consentStatus = 'accepted';
    activeSession.consentTimestamp = nowIso;
    sessionStorage.setItem('activeSession', JSON.stringify(activeSession));

    if (activeSession.sessionId) {
      await ApiService.updateSession(activeSession.sessionId, {
        consentStatus: 'accepted',
        consentTimestamp: nowIso,
        currentWorkflowStep: 'CONSENT'
      });
    }

    setLoading(false);
    navigate('/kiosk/session');
  };

  const handleDecline = async () => {
    const activeSession = JSON.parse(sessionStorage.getItem('activeSession') || '{}');
    const nowIso = new Date().toISOString();

    activeSession.consentStatus = 'rejected';
    activeSession.consentTimestamp = nowIso;
    sessionStorage.setItem('activeSession', JSON.stringify(activeSession));

    if (activeSession.sessionId) {
      await ApiService.updateSession(activeSession.sessionId, {
        consentStatus: 'rejected',
        consentTimestamp: nowIso,
        currentWorkflowStep: 'CONSENT_REJECTED'
      });
    }

    setShowDeclinedModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between select-none font-sans relative">
      {/* Kiosk Header */}
      <KioskHeader showBack={true} onBack={() => navigate('/kiosk/accessibility')} />

      {/* Progress Stepper */}
      <KioskStepIndicator currentStep={3} />

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Header Banner */}
          <div className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Patient Privacy &amp; Consent
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {t('kiosk_consent_title')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {t('kiosk_consent_subtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Body: Plain Low-Literacy Points */}
          <div className="p-5 sm:p-7 space-y-4">
            
            <div className="space-y-3">
              
              {/* Point 1: Purpose */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm">
                <Info className="w-5 h-5 text-[#1E56A0] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">1. Clinical History Purpose</span>
                  <p className="text-slate-600 leading-relaxed">
                    {t('consent_point_1')}
                  </p>
                </div>
              </div>

              {/* Point 2: Privacy */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm">
                <Lock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">2. Privacy &amp; Confidentiality</span>
                  <p className="text-slate-600 leading-relaxed">
                    {t('consent_point_2')}
                  </p>
                </div>
              </div>

              {/* Point 3: Accuracy */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm">
                <UserCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">3. Accurate Reporting</span>
                  <p className="text-slate-600 leading-relaxed">
                    {t('consent_point_3')}
                  </p>
                </div>
              </div>

              {/* Point 4: Doctor-Led Diagnosis */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">4. Doctor-Led Medical Care</span>
                  <p className="text-slate-600 leading-relaxed">
                    {t('consent_point_4')}
                  </p>
                </div>
              </div>

              {/* Point 5: Voluntary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm">
                <Building2 className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">5. Voluntary Check-In</span>
                  <p className="text-slate-600 leading-relaxed">
                    {t('consent_point_5')}
                  </p>
                </div>
              </div>

            </div>

            {/* Prototype UX Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-[11px] text-amber-900 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('consent_disclaimer')}</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAgree}
                disabled={loading}
                className="flex-1 py-4 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-base transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('i_agree_continue', 'I AGREE & CONTINUE')}</span>
              </button>

              <button
                type="button"
                onClick={handleDecline}
                className="py-4 px-6 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded-xl font-bold text-sm transition-all cursor-pointer border border-slate-200 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>{t('i_dont_agree', "I DON'T AGREE")}</span>
              </button>
            </div>

          </div>
        </motion.div>
      </main>

      {/* Consent Declined Modal */}
      {showDeclinedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {t('consent_declined_title', 'Manual Reception Intake')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('consent_declined_desc', 'No problem! You can proceed directly to the triage desk for manual check-in with the staff nurse.')}
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowDeclinedModal(false)}
                className="w-full py-3 bg-[#1E56A0] text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-[#16427D] transition-colors"
              >
                {t('return_to_kiosk', 'Return to Language & Consent Setup')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/kiosk')}
                className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-200 transition-colors"
              >
                Return to Welcome Lobby
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium">
        MediKiosk Consent Framework • Prototype Non-Legal UX Demo
      </footer>
    </div>
  );
}
