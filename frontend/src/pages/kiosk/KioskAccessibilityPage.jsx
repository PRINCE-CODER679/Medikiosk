import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KioskHeader, KioskStepIndicator } from '../../components/kiosk/KioskComponents';
import { ApiService } from '../../services/api';
import { useAccessibility } from '../../context/AccessibilityContext';
import { TTS } from '../../utils/tts';
import {
  Accessibility,
  Type,
  Eye,
  Volume2,
  VolumeX,
  Zap,
  ZapOff,
  ArrowRight,
  Check,
  Building2
} from 'lucide-react';

export function KioskAccessibilityPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    textSize,
    highContrast,
    voiceGuidance,
    reduceMotion,
    updateAccessibility
  } = useAccessibility();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (voiceGuidance) {
      TTS.speak(t('kiosk_access_title', 'Accessibility and display settings.'), i18n.language);
    }
  }, [voiceGuidance, t, i18n.language]);

  const handleProceed = async () => {
    setLoading(true);
    const activeSession = JSON.parse(sessionStorage.getItem('activeSession') || '{}');

    const accessibilityPreferences = {
      textSize,
      highContrast,
      voiceGuidance,
      reduceMotion
    };

    activeSession.accessibilityPreferences = accessibilityPreferences;
    sessionStorage.setItem('activeSession', JSON.stringify(activeSession));

    if (activeSession.sessionId) {
      await ApiService.updateSession(activeSession.sessionId, {
        accessibilityPreferences,
        currentWorkflowStep: 'ACCESSIBILITY'
      });
    }

    setLoading(false);
    navigate('/kiosk/consent');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between select-none font-sans">
      {/* Kiosk Header */}
      <KioskHeader showBack={true} onBack={() => navigate('/kiosk/language')} />

      {/* Progress Stepper */}
      <KioskStepIndicator currentStep={2} />

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
                  <Accessibility className="w-3.5 h-3.5 text-teal-600" />
                  Inclusive Patient UX
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {t('kiosk_access_title')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {t('kiosk_access_subtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Body: Accessibility Settings Matrix */}
          <div className="p-5 sm:p-7 space-y-6">
            
            {/* 1. Text Size Scaling */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Type className="w-4 h-4 text-[#1E56A0]" />
                <span>{t('text_size_label')}</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'normal', label: t('text_size_normal', 'Standard A') },
                  { key: 'large', label: t('text_size_large', 'Large A+') },
                  { key: 'xlarge', label: t('text_size_xlarge', 'Extra Large A++') }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => updateAccessibility({ textSize: opt.key })}
                    className={`py-3 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      textSize === opt.key
                        ? 'bg-[#1E56A0] text-white border-[#1E56A0] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {textSize === opt.key && <Check className="w-4 h-4" />}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. High Contrast Toggle */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-teal-600" />
                <span>{t('high_contrast_label')}</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateAccessibility({ highContrast: false })}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    !highContrast
                      ? 'bg-[#1E56A0] text-white border-[#1E56A0] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {!highContrast && <Check className="w-4 h-4" />}
                  <span>{t('high_contrast_off', 'Standard Colors')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateAccessibility({ highContrast: true })}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    highContrast
                      ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {highContrast && <Check className="w-4 h-4 text-amber-300" />}
                  <span>{t('high_contrast_on', 'High Contrast (Dark)')}</span>
                </button>
              </div>
            </div>

            {/* 3. Voice Guidance Toggle */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>{t('voice_guidance_label')}</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    updateAccessibility({ voiceGuidance: false });
                    TTS.stop();
                  }}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    !voiceGuidance
                      ? 'bg-[#1E56A0] text-white border-[#1E56A0] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <VolumeX className="w-4 h-4 shrink-0" />
                  <span>{t('voice_guidance_off', 'Voice Off')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateAccessibility({ voiceGuidance: true });
                    TTS.speak('Voice guidance active.', i18n.language);
                  }}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    voiceGuidance
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Volume2 className="w-4 h-4 shrink-0" />
                  <span>{t('voice_guidance_on', 'Voice Read Aloud On')}</span>
                </button>
              </div>
            </div>

            {/* 4. Motion Toggle */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>{t('reduce_motion_label')}</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateAccessibility({ reduceMotion: false })}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    !reduceMotion
                      ? 'bg-[#1E56A0] text-white border-[#1E56A0] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>{t('reduce_motion_off', 'Standard Motion')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateAccessibility({ reduceMotion: true })}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    reduceMotion
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ZapOff className="w-4 h-4 shrink-0" />
                  <span>{t('reduce_motion_on', 'Reduced Motion')}</span>
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleProceed}
                disabled={loading}
                className="w-full py-4 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-base transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>{t('save_access_continue', 'Save Preferences & Proceed to Consent')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium">
        MediKiosk Accessibility Core • High-Contrast &amp; Voice Assistance
      </footer>
    </div>
  );
}
