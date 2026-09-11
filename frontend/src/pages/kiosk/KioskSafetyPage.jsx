import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { KioskHeader, KioskStepIndicator } from '../../components/kiosk/KioskComponents';
import { useAccessibility } from '../../context/AccessibilityContext';
import { TTS } from '../../utils/tts';
import { ApiService } from '../../services/api';

export function KioskSafetyPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isHighContrast, getTextSizeClass, voiceGuidance } = useAccessibility();

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [notifiedStaff, setNotifiedStaff] = useState(false);

  const activeEncounter = JSON.parse(sessionStorage.getItem('activeEncounter') || '{}');
  const activeSession = JSON.parse(sessionStorage.getItem('activeSession') || '{}');
  const activePatient = JSON.parse(sessionStorage.getItem('activePatient') || '{}');

  const encounterId = activeEncounter.id || 'ENC-DEMO-999';
  const patientId = activePatient.id || 'PAT-10928';
  const sessionId = activeSession.sessionId || null;

  useEffect(() => {
    async function loadSafetyAssessment() {
      setLoading(true);
      const res = await ApiService.evaluateSafetyAssessment(encounterId, patientId, sessionId);
      if (res.ok && res.data) {
        setAssessment(res.data);
        sessionStorage.setItem('activeSafetyAssessment', JSON.stringify(res.data));

        if (voiceGuidance) {
          const speakMsg = `${t('safety_title')}. ${res.data.patientGuidance}`;
          TTS.speak(speakMsg, i18n.language);
        }
      }
      setLoading(false);
    }
    loadSafetyAssessment();
  }, [encounterId, patientId, sessionId, voiceGuidance, i18n.language, t]);

  const handleNotifyStaff = () => {
    setNotifiedStaff(true);
    if (voiceGuidance) {
      TTS.speak('Nursing staff has been alerted. Please wait near the triage station.', i18n.language);
    }
  };

  const handleProceed = () => {
    navigate('/kiosk/history/documents');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'EMERGENCY':
        return {
          bg: isHighContrast ? 'bg-red-950 border-red-500 text-red-100' : 'bg-rose-50 border-rose-200 text-rose-800',
          indicator: 'bg-rose-600 text-white',
          label: t('status_emergency'),
          icon: '🚨'
        };
      case 'URGENT':
        return {
          bg: isHighContrast ? 'bg-amber-950 border-amber-500 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-900',
          indicator: 'bg-amber-600 text-white',
          label: t('status_urgent'),
          icon: '⚠️'
        };
      case 'INSUFFICIENT_INFORMATION':
        return {
          bg: isHighContrast ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-slate-100 border-slate-300 text-slate-800',
          indicator: 'bg-slate-600 text-white',
          label: t('status_insufficient'),
          icon: 'ℹ️'
        };
      case 'NO_IMMEDIATE_FLAG':
      default:
        return {
          bg: isHighContrast ? 'bg-teal-950 border-teal-500 text-teal-100' : 'bg-teal-50 border-teal-200 text-teal-900',
          indicator: 'bg-teal-700 text-white',
          label: t('status_no_flag'),
          icon: '🛡️'
        };
    }
  };

  const statusInfo = assessment ? getStatusBadge(assessment.status) : getStatusBadge('NO_IMMEDIATE_FLAG');

  return (
    <div className={`min-h-screen flex flex-col ${isHighContrast ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <KioskHeader currentStepTitle={t('safety_title')} onBack={() => navigate('/kiosk/ai-conversation')} showBack={true} />
      <KioskStepIndicator currentStep={5} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <div className={`space-y-6 ${getTextSizeClass()}`}>
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>Clinical Safety Engine</span>
              <span>•</span>
              <span>Version 1.0</span>
            </div>
            <h1 className={`text-2xl font-bold ${isHighContrast ? 'text-white' : 'text-slate-900'}`}>
              {t('safety_title')}
            </h1>
            <p className={`text-sm ${isHighContrast ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('safety_subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-slate-300 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-600 font-medium">Evaluating predefined safety warning patterns...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Guidance Card */}
              <div className={`p-6 rounded-xl border ${statusInfo.bg} shadow-sm space-y-4 transition-all`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{statusInfo.icon}</span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-md tracking-wide ${statusInfo.indicator}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold leading-snug">
                    {assessment.patientGuidance}
                  </h3>
                  {assessment.status === 'EMERGENCY' && (
                    <p className="text-xs font-medium text-rose-700 underline">
                      Immediate action: Alert a nurse or front-desk reception staff at this terminal.
                    </p>
                  )}
                </div>
              </div>

              {/* Triggered Findings (if any) */}
              {assessment.triggeredFindings && assessment.triggeredFindings.length > 0 && (
                <div className={`p-5 rounded-lg border ${isHighContrast ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'} space-y-3`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Identified Safety Findings ({assessment.triggeredFindings.length})
                  </h4>
                  <div className="space-y-2">
                    {assessment.triggeredFindings.map((finding, idx) => (
                      <div key={idx} className="flex items-start justify-between text-sm p-3 rounded bg-slate-50 border border-slate-100">
                        <div>
                          <span className="font-semibold text-slate-900">{finding.finding}</span>
                          <span className="block text-xs text-slate-500 mt-0.5">Source: {finding.field} ({finding.source})</span>
                        </div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">{finding.ruleId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                {(assessment.status === 'EMERGENCY' || assessment.status === 'URGENT') && (
                  <button
                    onClick={handleNotifyStaff}
                    disabled={notifiedStaff}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-base shadow-sm transition-all flex items-center justify-center space-x-2 ${
                      notifiedStaff
                        ? 'bg-emerald-800 text-white cursor-default'
                        : assessment.status === 'EMERGENCY'
                        ? 'bg-rose-700 hover:bg-rose-800 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    <span>{notifiedStaff ? '✓ Nursing Staff Notified' : `🔔 ${t('btn_notify_nurse')}`}</span>
                  </button>
                )}

                <button
                  onClick={handleProceed}
                  className="w-full py-4 px-6 rounded-xl font-bold text-base border-2 border-slate-800 text-slate-900 hover:bg-slate-900 hover:text-white transition-all text-center cursor-pointer"
                >
                  {t('btn_next_documents') || 'Next: Scan / Upload Medical Documents'} →
                </button>
              </div>

              {/* Clinical Disclaimer */}
              <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800">Clinical Boundary Notice:</span>
                <p>{t('disclaimer_safety')}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
