import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KioskHeader, KioskProgressStepper, KioskButton, VoiceButton, LanguageButton, AccessibilityControls } from '../../components/kiosk/KioskComponents';
import { Modal } from '../../components/ui/OverlayAndFeedback';
import { Play, Globe, Mic, Shield, Sparkles, Check, ArrowRight, HeartPulse, Scan, FileSearch, CheckCircle2, ChevronRight } from 'lucide-react';

export function KioskWelcomePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0..4
  const [selectedEntity, setSelectedEntity] = useState(null);

  const currentLang = i18n.language === 'hi' ? 'हिंदी (Hindi)' : i18n.language === 'mr' ? 'मराठी (Marathi)' : 'English';

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' }
  ];

  const ocrEntities = [
    { entity: 'Medicine', value: 'Amlodipine 5mg', confidence: '96%', location: 'Prescription Header (Line 3)', details: 'Oral antihypertensive medication prescribed once daily.' },
    { entity: 'Diagnosis', value: 'Essential Hypertension', confidence: '95%', location: 'Clinical Impression (Line 7)', details: 'Stage-1 elevated blood pressure documented.' },
    { entity: 'Lab Test', value: 'Complete Blood Count (CBC)', confidence: '92%', location: 'Lab Order Box (Line 12)', details: 'Full blood cell investigation ordered.' }
  ];

  const triggerScanProcess = () => {
    setScanning(true);
    setScanStep(1); // Document Detected
    setTimeout(() => setScanStep(2), 1200); // Enhancing image
    setTimeout(() => setScanStep(3), 2400); // Reading text & extracting
    setTimeout(() => setScanStep(4), 3600); // Complete
  };

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('lng', langCode);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between select-none">
      {/* High-contrast Kiosk Header */}
      <KioskHeader
        onBack={() => {
          if (currentStep > 1) setCurrentStep(currentStep - 1);
          else setStarted(false);
        }}
        showBack={started}
      />

      {/* Progress Stepper Bar */}
      {started && <KioskProgressStepper currentStep={currentStep} />}

      {/* Main Kiosk Center Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col justify-center space-y-6 sm:space-y-8">
        {!started ? (
          /* Welcome Screen State */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-950/80 border-2 border-blue-500/40 text-blue-300 text-sm font-bold shadow-lg">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span>{t('medikiosk')} • {t('cap_ai_struct')}</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight font-heading">
                {t('kiosk_journey_starts')}
              </h2>
              <p className="text-base sm:text-xl text-slate-300 font-medium max-w-xl mx-auto">
                {t('kiosk_lobby_sub')}
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-5 pt-4">
              <KioskButton
                variant="primary"
                onClick={() => {
                  setStarted(true);
                  setCurrentStep(3); // Go straight to AI Interview
                }}
                icon={Play}
                subtext={t('kiosk_start_subtext')}
                className="border-4 border-blue-400/50 shadow-2xl"
              >
                {t('kiosk_start_button')}
              </KioskButton>

              <LanguageButton
                currentLang={currentLang}
                onClick={() => setShowLanguageModal(true)}
              />
            </div>
          </motion.div>
        ) : (
          /* Intake Session Steps */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Step 3: Voice AI Interview */}
            {currentStep === 3 && (
              <div className="p-5 sm:p-8 bg-slate-900/90 rounded-3xl border-2 border-slate-800 space-y-5 sm:space-y-6 shadow-2xl">
                <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
                  <div className="p-3 bg-blue-950 text-blue-400 rounded-2xl border border-blue-800">
                    <Mic className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-extrabold text-white font-heading">{t('kiosk_ai_assistant')}</h3>
                    <p className="text-xs text-teal-400 font-semibold">{t('kiosk_conversational_intake')}</p>
                  </div>
                </div>

                {/* AI Question Box */}
                <div className="p-6 bg-slate-950 rounded-2xl border border-blue-500/30 text-left space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">{t('kiosk_intake_question')}</p>
                  <p className="text-xl md:text-2xl font-bold text-white leading-snug font-heading">
                    {t('kiosk_question_text')}
                  </p>
                </div>

                {/* Voice Interaction & Quick Option Taps */}
                <div className="space-y-4">
                  <VoiceButton
                    isListening={isListening}
                    onClick={() => setIsListening(!isListening)}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-left">
                    {[
                      { label: t('kiosk_opt_today'), step: 4 },
                      { label: t('kiosk_opt_days'), step: 4 },
                      { label: t('kiosk_opt_week'), step: 4 }
                    ].map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="p-4 bg-slate-800 hover:bg-blue-900/80 border border-slate-700 hover:border-blue-400 rounded-2xl text-sm font-bold text-white transition-all cursor-pointer flex items-center justify-between"
                      >
                        <span>{opt.label}</span>
                        <ChevronRight className="w-4 h-4 text-teal-400" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 font-medium font-mono text-center sm:text-left">{t('kiosk_question_progress')}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 bg-[#2563EB] hover:bg-[#1E56A0] text-white rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>{t('kiosk_btn_next')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Medical Document Scanner */}
            {currentStep === 4 && (
              <div className="p-5 sm:p-8 bg-slate-900/90 rounded-3xl border-2 border-slate-800 space-y-5 sm:space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-950 text-teal-400 rounded-2xl border border-teal-800">
                      <Scan className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-extrabold text-white font-heading">{t('kiosk_scanner_title')}</h3>
                      <p className="text-xs text-slate-400 font-medium">{t('kiosk_scanner_sub')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={triggerScanProcess}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{t('kiosk_btn_scan_sample')}</span>
                  </button>
                </div>

                {/* Animated Scanner Viewfinder */}
                <div className="relative w-full h-48 sm:h-64 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
                  {/* Viewfinder Corners */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-teal-400" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-teal-400" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-teal-400" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-teal-400" />

                  {scanning && scanStep < 4 && (
                    <motion.div
                      initial={{ y: 0 }}
                      animate={{ y: [0, 200, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_rgba(20,184,166,0.8)]"
                    />
                  )}

                  {!scanning ? (
                    <div className="text-center space-y-2">
                      <FileSearch className="w-12 h-12 text-slate-600 mx-auto" />
                      <p className="text-sm font-bold text-slate-300">{t('kiosk_position_viewfinder')}</p>
                      <p className="text-xs text-slate-500">{t('kiosk_tap_simulate')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-teal-400 uppercase tracking-widest font-mono">
                          {scanStep === 1 && t('kiosk_scan_detected')}
                          {scanStep === 2 && t('kiosk_scan_enhancing')}
                          {scanStep === 3 && t('kiosk_scan_extracting')}
                          {scanStep === 4 && t('kiosk_scan_completed')}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">{t('kiosk_scan_confidence')}</p>
                      </div>

                      {/* Extracted Entity Highlight Chips */}
                      {scanStep >= 3 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          {ocrEntities.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedEntity(item)}
                              className="px-3 py-1.5 bg-blue-900/80 hover:bg-blue-800 border border-blue-500/50 rounded-xl text-xs font-mono font-bold text-blue-200 cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{item.value}</span>
                              <span className="text-[10px] bg-blue-950 px-1.5 py-0.2 rounded text-teal-300">{item.confidence}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-3 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer transition-colors text-center"
                  >
                    {t('kiosk_btn_back_interview')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-3 bg-[#2563EB] hover:bg-[#1E56A0] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>{t('kiosk_btn_submit_intake')}</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Summary Completion */}
            {currentStep === 5 && (
              <div className="p-8 bg-slate-900/90 rounded-3xl border-2 border-slate-800 text-center space-y-6 shadow-2xl">
                <div className="w-20 h-20 rounded-3xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white font-heading">{t('kiosk_completed_title')}</h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto font-medium leading-relaxed">
                    {t('kiosk_completed_desc')}
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setStarted(false)}
                    className="px-8 py-4 bg-[#2563EB] hover:bg-[#1E56A0] text-white rounded-2xl text-base font-bold transition-all shadow-xl cursor-pointer"
                  >
                    {t('kiosk_btn_return_home')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Accessibility Toolbar Footer */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <AccessibilityControls />
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer self-end sm:self-auto"
        >
          {t('kiosk_physician_dashboard_link')}
        </button>
      </footer>

      {/* OCR Entity Verification Drawer Modal */}
      <Modal
        isOpen={!!selectedEntity}
        onClose={() => setSelectedEntity(null)}
        title={`${t('ocr_entity_title')}: ${selectedEntity?.value}`}
        subtitle={`${t('ocr_extracted_from')} ${selectedEntity?.location}`}
      >
        {selectedEntity && (
          <div className="space-y-4 text-slate-900 bg-white">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs space-y-1">
              <p className="font-bold text-[#1E56A0]">{t('ocr_category')}: {selectedEntity.entity}</p>
              <p className="text-slate-700">{selectedEntity.details}</p>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span>{t('ocr_confidence')}: <strong>{selectedEntity.confidence}</strong></span>
              <span className="text-emerald-700 font-bold">✓ {t('ocr_verified')}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title={t('kiosk_choose_lang_title')}
        subtitle={t('kiosk_choose_lang_sub')}
      >
        <div className="space-y-3 bg-white">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                changeLanguage(lang.code);
                setShowLanguageModal(false);
              }}
              className="w-full p-4 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl flex items-center justify-between transition-colors font-bold text-slate-900 text-base cursor-pointer"
            >
              <span>{lang.label}</span>
              {i18n.language === lang.code && (
                <Check className="w-5 h-5 text-[#1E56A0]" />
              )}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
