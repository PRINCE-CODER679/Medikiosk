import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KioskHeader, KioskStepIndicator } from '../../components/kiosk/KioskComponents';
import { ApiService } from '../../services/api';
import { useAccessibility } from '../../context/AccessibilityContext';
import { TTS } from '../../utils/tts';
import {
  Globe,
  CheckCircle2,
  Volume2,
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react';

export function KioskLanguagePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { voiceGuidance } = useAccessibility();

  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');
  const [loading, setLoading] = useState(false);

  const languages = [
    {
      code: 'en',
      nativeName: 'English',
      englishName: 'English',
      sampleText: 'Welcome to MediKiosk health check-in.',
      region: 'Universal / Standard'
    },
    {
      code: 'hi',
      nativeName: 'हिंदी',
      englishName: 'Hindi',
      sampleText: 'मेडीकियोस्क स्वास्थ्य जांच में आपका स्वागत है।',
      region: 'भारत / National'
    },
    {
      code: 'mr',
      nativeName: 'मराठी',
      englishName: 'Marathi',
      sampleText: 'मेडीकियोस्क आरोग्य तपासणीमध्ये आपले स्वागत आहे.',
      region: 'महाराष्ट्र / State'
    }
  ];

  // Auto read instruction if voice guidance is active
  useEffect(() => {
    if (voiceGuidance) {
      TTS.speak(t('kiosk_lang_title', 'Please select your preferred language.'), selectedLang);
    }
  }, [voiceGuidance, selectedLang, t]);

  const handleSelectLanguage = (code) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('lng', code);

    // Save pending language in session storage
    const activeSession = JSON.parse(sessionStorage.getItem('activeSession') || '{}');
    activeSession.languagePreference = code;
    sessionStorage.setItem('activeSession', JSON.stringify(activeSession));

    if (voiceGuidance) {
      const langObj = languages.find(l => l.code === code);
      if (langObj) TTS.speak(langObj.sampleText, code);
    }
  };

  const handleProceed = async () => {
    setLoading(true);
    const activeSession = JSON.parse(sessionStorage.getItem('activeSession') || '{}');

    if (activeSession.sessionId) {
      await ApiService.updateSession(activeSession.sessionId, {
        languagePreference: selectedLang,
        currentWorkflowStep: 'LANGUAGE'
      });
    }

    setLoading(false);
    navigate('/kiosk/accessibility');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between select-none font-sans">
      {/* Kiosk Header */}
      <KioskHeader showBack={true} onBack={() => navigate('/kiosk/confirmation')} />

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
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1E56A0] border border-blue-200">
                  <Globe className="w-3.5 h-3.5" />
                  Language &amp; Region
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {t('kiosk_lang_title')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {t('kiosk_lang_subtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Body: Touch Cards */}
          <div className="p-5 sm:p-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {languages.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#1E56A0] shadow-md ring-2 ring-[#1E56A0]/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {lang.region}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-[#1E56A0]" />
                        )}
                      </div>
                      <h3 className="text-2xl font-extrabold text-slate-900 mt-2 font-heading">
                        {lang.nativeName}
                      </h3>
                      <p className="text-xs font-medium text-slate-500">
                        {lang.englishName}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          TTS.speak(lang.sampleText, lang.code);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E56A0] hover:text-[#16427D] py-1 px-2 rounded-lg bg-white border border-slate-200 shadow-2xs cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{t('lang_listen_sample', 'Listen Sample')}</span>
                      </button>

                      {isSelected && (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit CTA Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleProceed}
                disabled={loading}
                className="w-full py-4 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-base transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>{t('lang_confirm_continue', 'Confirm Language & Proceed')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium">
        MediKiosk Multilingual Engine • English • हिंदी • मराठी
      </footer>
    </div>
  );
}
