import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KioskHeader, KioskStepIndicator } from '../../components/kiosk/KioskComponents';
import { ApiService } from '../../services/api';
import { useAccessibility } from '../../context/AccessibilityContext';
import { TTS } from '../../utils/tts';
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Volume2,
  AlertCircle,
  Check,
  Send,
  Building2,
  Bot
} from 'lucide-react';

export function KioskAiConversationPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { voiceGuidance } = useAccessibility();

  const [conversation, setConversation] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Initialize Conversation
  useEffect(() => {
    async function initConversation() {
      const activeSession = JSON.parse(
        sessionStorage.getItem('activeSession') || sessionStorage.getItem('activeKioskSession') || '{}'
      );

      const encounterId = activeSession.encounterId || activeSession.encounter?.id || 'ENC-2026-DEMO';
      const patientId = activeSession.patientId || activeSession.patient?.id || 'PAT-10928';
      const lang = activeSession.languagePreference || i18n.language || 'en';

      setLoading(true);
      const res = await ApiService.createConversation({
        encounterId,
        patientId,
        sessionId: activeSession.sessionId,
        languagePreference: lang
      });

      if (res.ok) {
        setConversation(res.data);
        await loadNextQuestion(res.data.conversationId);
      } else {
        setErrorMessage('Could not connect to conversation service. Switching to summary review.');
        setTimeout(() => navigate('/kiosk/history/review'), 2000);
      }
      setLoading(false);
    }

    initConversation();
  }, [i18n.language, navigate]);

  // 2. Fetch Next Question
  const loadNextQuestion = async (convId) => {
    setLoading(true);
    setSelectedOption('');
    setCustomAnswer('');
    setErrorMessage('');

    console.log('[KioskAI] Fetching next question for conversationId:', convId);
    const res = await ApiService.getNextQuestion(convId);
    if (res.ok) {
      console.log('[KioskAI] Next question received:', res.data?.questionId, res.data?.question);
      setCurrentQuestion(res.data);
      if (voiceGuidance && res.data.question) {
        TTS.speak(res.data.question, i18n.language);
      }
      if (!res.data.shouldContinue) {
        console.log('[KioskAI] Conversation completed. Navigating to safety assessment.');
        setTimeout(() => navigate('/kiosk/history/safety'), 1000);
      }
    } else {
      console.warn('[KioskAI] Failed to fetch next question, navigating to safety assessment:', res.error);
      navigate('/kiosk/history/safety');
    }
    setLoading(false);
  };

  // 3. Submit Answer
  const handleAnswerSubmit = async (answerVal) => {
    const finalAnswer = (answerVal || selectedOption || customAnswer).trim();
    if (!finalAnswer) {
      setErrorMessage('Please select or type an answer to continue.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const convId = conversation?.conversationId;
    console.log('[KioskAI] Submitting answer for convId:', convId, 'questionId:', currentQuestion?.questionId, 'answer:', finalAnswer);
    const res = await ApiService.submitAnswer(convId, {
      questionId: currentQuestion.questionId,
      targetSection: currentQuestion.targetSection,
      targetField: currentQuestion.targetField,
      answerValue: finalAnswer
    });

    // Update local sessionStorage clinical history
    const history = JSON.parse(sessionStorage.getItem('clinicalHistory') || '{}');
    const sec = (currentQuestion.targetSection || 'hpi').toLowerCase();
    if (!history[sec]) history[sec] = {};
    history[sec][currentQuestion.targetField] = finalAnswer;
    sessionStorage.setItem('clinicalHistory', JSON.stringify(history));

    if (res.ok) {
      console.log('[KioskAI] Answer submit succeeded. Loading next question...');
      await loadNextQuestion(convId);
    } else {
      console.error('[KioskAI] Answer submit failed, navigating to review:', res.error);
      navigate('/kiosk/history/review');
    }
  };

  const handleSkip = () => {
    handleAnswerSubmit('Skipped by patient');
  };

  const handleDontKnow = () => {
    handleAnswerSubmit('Not sure');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between select-none font-sans">
      {/* Kiosk Header */}
      <KioskHeader showBack={true} onBack={() => navigate('/kiosk/history/review')} />

      {/* Stepper (Step 4) */}
      <KioskStepIndicator currentStep={4} />

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left"
        >
          {/* Banner */}
          <div className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1E56A0] border border-blue-200">
                <Bot className="w-3.5 h-3.5 text-[#1E56A0]" />
                Guided Symptom Clarification
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                Adaptive Follow-Up Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Clarifying symptom details to prepare a complete clinical history for your doctor.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 shrink-0 hidden sm:inline">
              Mode: Fallback Engine
            </span>
          </div>

          {/* Body: Question Area */}
          <div className="p-5 sm:p-7 space-y-6">
            
            {loading && !currentQuestion ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-[#1E56A0] animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700">Preparing next follow-up question...</p>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-5">
                
                {/* Question Bubble */}
                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E56A0]">
                      Follow-up Question
                    </span>
                    {voiceGuidance && (
                      <button
                        type="button"
                        onClick={() => TTS.speak(currentQuestion.question, i18n.language)}
                        className="text-xs font-bold text-[#1E56A0] flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-blue-200"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    "{currentQuestion.question}"
                  </h3>
                </div>

                {/* Touch Options */}
                {currentQuestion.options && currentQuestion.options.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select your answer:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQuestion.options.map((opt, idx) => {
                        const isSelected = selectedOption === opt;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedOption(opt);
                              setCustomAnswer('');
                              setErrorMessage('');
                            }}
                            className={`p-4 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer text-left flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-50 text-[#1E56A0] border-[#1E56A0] shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1E56A0]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Answer Input */}
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Or type specific details:
                  </label>
                  <input
                    type="text"
                    value={customAnswer}
                    onChange={(e) => {
                      setCustomAnswer(e.target.value);
                      setSelectedOption('');
                      setErrorMessage('');
                    }}
                    placeholder="Type additional details..."
                    className="w-full bg-white border border-slate-200 focus:border-[#1E56A0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none transition-all"
                  />
                </div>

              </div>
            ) : null}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-bold text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions Row */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDontKnow}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  I Don't Know
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Skip Question
                </button>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate('/kiosk/history/safety')}
                  className="py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-100"
                >
                  Finish &amp; Review Summary
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswerSubmit()}
                  disabled={loading}
                  className="flex-1 sm:flex-none py-3.5 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>Submit Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium">
        MediKiosk Adaptive AI Engine • Non-Diagnostic Symptom Clarification
      </footer>
    </div>
  );
}
