import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Volume2, Mic, Globe, Accessibility, ChevronRight, HelpCircle, ArrowLeft, Check, Sparkles, Scan, FileSearch, ShieldCheck, Zap } from 'lucide-react';
import { StatusIndicator } from '../ui/OverlayAndFeedback';

export function KioskHeader({
  currentStepTitle = 'Welcome / Start Intake',
  onBack,
  showBack = false
}) {
  const { t } = useTranslation();
  return (
    <header className="w-full bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between shadow-lg border-b border-slate-800">
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex items-center gap-2 font-bold text-base transition-colors border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('back')}</span>
          </button>
        )}
        <div className="flex items-center gap-3 bg-transparent">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E56A0] to-[#0D9488] flex items-center justify-center font-black text-xl shadow-md border border-white/20">
            <HeartPulse className="w-5 h-5 animate-pulse text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">{t('medikiosk')}</h1>
            <p className="text-xs text-teal-400 font-semibold mt-1">{t('sih_title')}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <StatusIndicator status="operational" text={t('dash_operational_badge')} />
        <div className="h-6 w-px bg-slate-700 hidden sm:block" />
        <button
          type="button"
          onClick={() => alert('Assistance Alert Triggered: A hospital staff member has been notified.')}
          className="hidden sm:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <span>{t('help')}?</span>
        </button>
      </div>
    </header>
  );
}

// Global heart pulse helper to ensure correct rendering without missing imports
function HeartPulse({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h4.78" />
    </svg>
  );
}

export function KioskProgressStepper({ currentStep = 3 }) {
  const { t } = useTranslation();
  const steps = [
    { label: t('journey_identify'), key: 1 },
    { label: t('journey_consent', 'CONSENT'), key: 2 },
    { label: t('journey_converse'), key: 3 },
    { label: t('journey_scan'), key: 4 },
    { label: t('journey_review'), key: 5 }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-3 px-3 sm:px-4 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-[18px] left-6 right-6 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
        
        {steps.map((step) => {
          const isDone = currentStep > step.key;
          const isCurrent = currentStep === step.key;

          return (
            <div key={step.key} className="flex flex-col items-center space-y-1 relative z-10">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500 text-white border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : isCurrent
                    ? 'bg-blue-600 text-white border-2 border-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.5)] scale-105'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : step.key}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider text-center leading-tight max-w-[48px] sm:max-w-none ${
                  isDone ? 'text-emerald-400' : isCurrent ? 'text-blue-300' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function KioskButton({
  children,
  onClick,
  variant = 'primary',
  icon: Icon = ChevronRight,
  subtext,
  className = ''
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className={`w-full text-left p-6 md:p-8 rounded-3xl border-2 transition-all duration-150 flex items-center justify-between cursor-pointer ${
        variant === 'secondary'
          ? 'bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:from-[#0F766E] hover:to-[#0D9488] text-white border-teal-400/40 shadow-xl'
          : variant === 'outline'
          ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-md'
          : 'bg-gradient-to-r from-[#2563EB] to-[#1E56A0] hover:from-[#1E56A0] hover:to-[#16427D] text-white border-blue-400/40 shadow-xl'
      } ${className}`}
    >
      <div>
        <div className="text-2xl md:text-3xl font-black tracking-tight">{children}</div>
        {subtext && <p className="text-sm md:text-base opacity-90 mt-1 font-semibold">{subtext}</p>}
      </div>
      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 ml-4 border border-white/30">
        <Icon className="w-8 h-8" />
      </div>
    </motion.button>
  );
}

export function VoiceButton({ isListening = false, onClick }) {
  const { t } = useTranslation();
  const [stage, setStage] = useState('idle'); // idle | listening | processing | done
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (isListening) {
      setStage('listening');
      const timer1 = setTimeout(() => {
        setStage('processing');
        setTranscript("I've had fever and frontal headache for 3 days.");
      }, 3000);

      const timer2 = setTimeout(() => {
        setStage('done');
      }, 5500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setStage('idle');
      setTranscript('');
    }
  }, [isListening]);

  return (
    <div className="space-y-3 font-sans">
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={onClick}
        className={`w-full relative group p-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between cursor-pointer shadow-xl ${
          stage === 'listening'
            ? 'bg-red-950/90 text-white border-red-500 ring-4 ring-red-500/20'
            : stage === 'processing'
            ? 'bg-amber-950/90 text-white border-amber-500'
            : stage === 'done'
            ? 'bg-emerald-950/90 text-white border-emerald-500'
            : 'bg-gradient-to-r from-slate-900 to-blue-950 text-white border-blue-500/40 hover:border-blue-400'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 flex items-center justify-center shrink-0 border border-blue-400/40">
            <Mic className={`w-8 h-8 ${stage === 'listening' ? 'animate-bounce text-red-400' : 'text-teal-400'}`} />
          </div>
          <div className="text-left bg-transparent">
            <div className="text-xl font-extrabold">
              {stage === 'listening' && t('voice_listening')}
              {stage === 'processing' && t('voice_processing')}
              {stage === 'done' && t('voice_done')}
              {stage === 'idle' && t('voice_idle')}
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium leading-relaxed">
              {stage === 'listening'
                ? t('voice_instruction')
                : t('voice_subtext')}
            </p>
          </div>
        </div>

        {/* Animated Audio Equalizer Waveform */}
        {stage === 'listening' && (
          <div className="flex items-end gap-1 h-8 px-2 max-w-[80px] overflow-hidden shrink-0 bg-transparent">
            {[40, 80, 50, 100, 70, 30, 90, 60].map((h, idx) => (
              <span
                key={idx}
                className="w-1.5 bg-red-400 rounded-full animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${idx * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </motion.button>

      {/* Simulated Live Transcript Bubble */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-slate-900 border border-blue-500/30 text-xs font-mono text-teal-300 flex items-center gap-3"
        >
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-left bg-transparent">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">{t('voice_captured_speech')}</span>
            <span className="text-sm font-semibold text-white">"{transcript}"</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function LanguageButton({ onClick, currentLang = 'English' }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 bg-white border-2 border-slate-200 hover:border-[#1E56A0] rounded-3xl shadow-sm text-slate-900 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 bg-transparent">
        <div className="p-3 bg-teal-50 text-[#0D9488] rounded-2xl group-hover:scale-105 transition-transform">
          <Globe className="w-6 h-6" />
        </div>
        <div className="text-left bg-transparent">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase">{t('selected_language_kiosk')}</p>
          <p className="text-lg font-bold text-slate-900">{currentLang}</p>
        </div>
      </div>
      <span className="text-xs font-bold text-[#1E56A0] bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-100">
        {t('change_language')}
      </span>
    </button>
  );
}

export function AccessibilityControls() {
  const { t } = useTranslation();
  const [highContrast, setHighContrast] = useState(false);
  const [textScale, setTextScale] = useState(1);

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-900/90 text-white p-2.5 sm:p-3 rounded-2xl backdrop-blur-md border border-slate-700 shadow-xl">
      <div className="flex items-center gap-2 text-xs font-extrabold px-2 text-teal-400 bg-transparent">
        <Accessibility className="w-4 h-4" />
        <span className="hidden sm:inline">{t('accessibility')}</span>
      </div>
      <div className="h-4 w-px bg-slate-700 hidden sm:block" />
      <button
        type="button"
        onClick={() => setHighContrast(!highContrast)}
        className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
          highContrast ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
      >
        {highContrast ? 'HC: ON' : 'HC'}
      </button>
      <button
        type="button"
        onClick={() => setTextScale(textScale === 1 ? 1.25 : 1)}
        className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
          textScale > 1 ? 'bg-teal-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
      >
        {textScale > 1 ? 'A+' : 'A'}
      </button>
      <button
        type="button"
        className="text-xs px-2.5 sm:px-3 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
      >
        <Volume2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('screen_reader')}</span>
      </button>
    </div>
  );
}
