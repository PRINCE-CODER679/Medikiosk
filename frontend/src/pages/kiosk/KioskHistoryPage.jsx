import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KioskHeader, KioskStepIndicator } from '../../components/kiosk/KioskComponents';
import { ApiService } from '../../services/api';
import { useAccessibility } from '../../context/AccessibilityContext';
import { TTS } from '../../utils/tts';
import {
  Stethoscope,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Activity,
  FileText,
  Pill,
  ShieldAlert,
  Users,
  User,
  Check,
  ChevronRight
} from 'lucide-react';

export function KioskHistoryPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { voiceGuidance } = useAccessibility();

  // Section step state: 1 to 8
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Active Session & Encounter
  const [activeSession, setActiveSession] = useState(null);

  // Form State for all 8 Sections
  const [historyData, setHistoryData] = useState(() => {
    const saved = sessionStorage.getItem('clinicalHistory');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      chiefComplaint: {
        primarySymptom: '',
        onset: '1-3 Days ago',
        duration: '3 days',
        description: ''
      },
      hpi: {
        onset: '3 days ago',
        location: 'Chest / Head',
        severity: 5,
        character: 'Dull ache',
        aggravatingFactors: 'Physical exertion',
        relievingFactors: 'Rest',
        associatedSymptoms: []
      },
      pastMedicalHistory: {
        conditions: [],
        surgeries: [],
        hospitalizations: [],
        notes: ''
      },
      medications: [],
      allergies: [],
      familyHistory: {
        conditions: [],
        notes: ''
      },
      personalHistory: {
        smoking: 'Never',
        alcohol: 'Never',
        occupation: 'Service / Desk Work',
        lifestyle: 'Moderate Active'
      },
      reviewOfSystems: {
        general: [],
        respiratory: [],
        cardiovascular: [],
        gastrointestinal: [],
        neurological: [],
        genitourinary: [],
        musculoskeletal: [],
        skin: []
      },
      investigations: []
    };
  });

  // State for adding new medication inline
  const [newMed, setNewMed] = useState({ name: '', dose: '', frequency: 'Once daily', reason: '' });
  // State for adding new allergy inline
  const [newAllergy, setNewAllergy] = useState({ allergen: '', category: 'Drug', reaction: '' });

  useEffect(() => {
    const rawSession = sessionStorage.getItem('activeSession') || sessionStorage.getItem('activeKioskSession');
    if (rawSession) {
      try {
        setActiveSession(JSON.parse(rawSession));
      } catch (e) {}
    }
  }, []);

  // Save history state to session storage
  useEffect(() => {
    sessionStorage.setItem('clinicalHistory', JSON.stringify(historyData));
  }, [historyData]);

  // Voice Guidance Trigger on Section Change
  useEffect(() => {
    if (voiceGuidance) {
      const sectionTitles = [
        t('sec_1_title', 'Chief Complaint'),
        t('sec_2_title', 'History of Present Illness'),
        t('sec_3_title', 'Past Medical History'),
        t('sec_4_title', 'Current Medications'),
        t('sec_5_title', 'Allergies'),
        t('sec_6_title', 'Family History'),
        t('sec_7_title', 'Personal History'),
        t('sec_8_title', 'Review of Systems')
      ];
      TTS.speak(sectionTitles[currentSection - 1] || 'Clinical History Section', i18n.language);
    }
  }, [currentSection, voiceGuidance, t, i18n.language]);

  // Auto-sync history with backend API
  const syncWithBackend = async (dataToSync, sectionNumber) => {
    const encounterId = activeSession?.encounterId || activeSession?.encounter?.id;
    if (encounterId) {
      await ApiService.saveClinicalHistory(encounterId, {
        ...dataToSync,
        currentSection: sectionNumber,
        completionStatus: sectionNumber === 8 ? 'COMPLETED' : 'IN_PROGRESS'
      });
    }
  };

  const handleNext = async () => {
    setErrorMessage('');

    // Validation for Section 1: Chief Complaint
    if (currentSection === 1) {
      if (!historyData.chiefComplaint.primarySymptom && !historyData.chiefComplaint.description.trim()) {
        setErrorMessage('Please select or describe your main health symptom to continue.');
        return;
      }
    }

    setLoading(true);
    await syncWithBackend(historyData, currentSection);
    setLoading(false);

    if (currentSection < 8) {
      setCurrentSection(prev => prev + 1);
    } else {
      navigate('/kiosk/history/ai-guidance');
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
    } else {
      navigate('/kiosk/consent');
    }
  };

  const quickSymptoms = [
    { label: t('symptom_fever', 'Fever'), val: 'Fever' },
    { label: t('symptom_cough', 'Cough & Cold'), val: 'Cough & Cold' },
    { label: t('symptom_chest_pain', 'Chest Tightness'), val: 'Chest Tightness' },
    { label: t('symptom_abdominal_pain', 'Abdominal Pain'), val: 'Abdominal Pain' },
    { label: t('symptom_headache', 'Headache'), val: 'Headache' },
    { label: t('symptom_shortness_breath', 'Shortness of Breath'), val: 'Shortness of Breath' },
    { label: t('symptom_dizziness', 'Dizziness / Weakness'), val: 'Dizziness' },
    { label: t('symptom_other', 'Other Issue'), val: 'Other Issue' }
  ];

  const commonConditions = [
    { label: t('cond_hypertension', 'Hypertension / High BP'), val: 'Hypertension' },
    { label: t('cond_diabetes', 'Type 2 Diabetes'), val: 'Diabetes' },
    { label: t('cond_asthma', 'Asthma / Respiratory'), val: 'Asthma' },
    { label: t('cond_heart', 'Heart Disease'), val: 'Heart Disease' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between select-none font-sans">
      {/* Kiosk Header */}
      <KioskHeader showBack={true} onBack={handleBack} />

      {/* Progress Stepper (Overall Step 4) */}
      <KioskStepIndicator currentStep={4} />

      {/* Clinical History Sub-Stepper Banner */}
      <div className="bg-[#0F172A] text-white py-3 px-4 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-2 text-teal-400 font-bold">
            <Stethoscope className="w-4 h-4" />
            Clinical History Intake — Section {currentSection} of 8
          </span>
          <span className="text-slate-400 font-mono">
            {Math.round((currentSection / 8) * 100)}% Complete
          </span>
        </div>
        {/* Progress Line */}
        <div className="max-w-3xl mx-auto h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-[#1E56A0] transition-all duration-300"
            style={{ width: `${(currentSection / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left"
          >
            {/* SECTION 1: CHIEF COMPLAINT */}
            {currentSection === 1 && (
              <div className="p-5 sm:p-7 space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#1E56A0] uppercase tracking-wider">Step 1 of 8</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                    {t('sec_1_title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t('sec_1_desc')}
                  </p>
                </div>

                {/* Touch Quick Select Chips */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tap your primary symptom (or select below):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {quickSymptoms.map((sym) => {
                      const isSelected = historyData.chiefComplaint.primarySymptom === sym.val;
                      return (
                        <button
                          key={sym.val}
                          type="button"
                          onClick={() => {
                            setHistoryData({
                              ...historyData,
                              chiefComplaint: {
                                ...historyData.chiefComplaint,
                                primarySymptom: sym.val
                              }
                            });
                            setErrorMessage('');
                          }}
                          className={`p-3 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 min-h-[64px] ${
                            isSelected
                              ? 'bg-blue-50 text-[#1E56A0] border-[#1E56A0] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-[#1E56A0]" />}
                          <span>{sym.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Free Text Symptom Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Additional Complaint Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={historyData.chiefComplaint.description}
                    onChange={(e) => {
                      setHistoryData({
                        ...historyData,
                        chiefComplaint: {
                          ...historyData.chiefComplaint,
                          description: e.target.value
                        }
                      });
                      setErrorMessage('');
                    }}
                    placeholder="e.g. Persistent fever up to 101.4°F with frontal headache for 3 days..."
                    className="w-full bg-white border border-slate-200 focus:border-[#1E56A0] rounded-xl p-3 text-sm font-medium text-slate-900 focus:outline-none transition-all"
                  />
                </div>

                {/* Onset Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t('onset_label', 'When did it start?')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'Today', label: t('onset_today', 'Today') },
                      { key: '1-3 Days ago', label: t('onset_few_days', '1-3 Days ago') },
                      { key: '1 Week ago', label: t('onset_week', '1 Week ago') },
                      { key: 'Over a Month ago', label: t('onset_month', 'Over a Month ago') }
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setHistoryData({
                            ...historyData,
                            chiefComplaint: {
                              ...historyData.chiefComplaint,
                              onset: opt.key
                            }
                          });
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          historyData.chiefComplaint.onset === opt.key
                            ? 'bg-[#1E56A0] text-white border-[#1E56A0]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: HISTORY OF PRESENT ILLNESS (HPI) */}
            {currentSection === 2 && (
              <div className="p-5 sm:p-7 space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#1E56A0] uppercase tracking-wider">Step 2 of 8</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                    {t('sec_2_title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t('sec_2_desc')}
                  </p>
                </div>

                {/* Symptom Severity Slider */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">{t('severity_label')}</span>
                    <span className="font-mono text-sm text-[#1E56A0] bg-white px-2 py-0.5 rounded border border-slate-200">
                      Level {historyData.hpi.severity} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={historyData.hpi.severity}
                    onChange={(e) => setHistoryData({
                      ...historyData,
                      hpi: { ...historyData.hpi, severity: Number(e.target.value) }
                    })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1E56A0]"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>1 (Mild)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Severe)</span>
                  </div>
                </div>

                {/* Location & Character */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Location / Body Area
                    </label>
                    <input
                      type="text"
                      value={historyData.hpi.location}
                      onChange={(e) => setHistoryData({
                        ...historyData,
                        hpi: { ...historyData.hpi, location: e.target.value }
                      })}
                      placeholder="e.g. Frontal Head / Lower Abdomen"
                      className="w-full bg-white border border-slate-200 focus:border-[#1E56A0] rounded-xl px-3 py-2 text-sm font-medium focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Pain Character / Type
                    </label>
                    <input
                      type="text"
                      value={historyData.hpi.character}
                      onChange={(e) => setHistoryData({
                        ...historyData,
                        hpi: { ...historyData.hpi, character: e.target.value }
                      })}
                      placeholder="e.g. Throbbing, Dull ache, Sharp, Burning"
                      className="w-full bg-white border border-slate-200 focus:border-[#1E56A0] rounded-xl px-3 py-2 text-sm font-medium focus:outline-none"
                    />
                  </div>
                </div>

                {/* Aggravating & Relieving Factors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Makes Pain Worse (Aggravating)
                    </label>
                    <input
                      type="text"
                      value={historyData.hpi.aggravatingFactors}
                      onChange={(e) => setHistoryData({
                        ...historyData,
                        hpi: { ...historyData.hpi, aggravatingFactors: e.target.value }
                      })}
                      placeholder="e.g. Walking, Bright light, Coughing"
                      className="w-full bg-white border border-slate-200 focus:border-[#1E56A0] rounded-xl px-3 py-2 text-sm font-medium focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Makes Pain Better (Relieving)
                    </label>
                    <input
                      type="text"
                      value={historyData.hpi.relievingFactors}
                      onChange={(e) => setHistoryData({
                        ...historyData,
                        hpi: { ...historyData.hpi, relievingFactors: e.target.value }
                      })}
                      placeholder="e.g. Rest, Warm water, Paracetamol"
                      className="w-full bg-white border border-slate-200 focus:border-[#1E56A0] rounded-xl px-3 py-2 text-sm font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: PAST MEDICAL HISTORY */}
            {currentSection === 3 && (
              <div className="p-5 sm:p-7 space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#1E56A0] uppercase tracking-wider">Step 3 of 8</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                    {t('sec_3_title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t('sec_3_desc')}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select existing medical conditions:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {commonConditions.map((cond) => {
                      const isChecked = historyData.pastMedicalHistory.conditions.includes(cond.val);
                      return (
                        <button
                          key={cond.val}
                          type="button"
                          onClick={() => {
                            let updated = [...historyData.pastMedicalHistory.conditions];
                            if (isChecked) {
                              updated = updated.filter(c => c !== cond.val);
                            } else {
                              updated.push(cond.val);
                            }
                            setHistoryData({
                              ...historyData,
                              pastMedicalHistory: { ...historyData.pastMedicalHistory, conditions: updated }
                            });
                          }}
                          className={`p-3.5 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer text-left flex items-center justify-between ${
                            isChecked
                              ? 'bg-blue-50 text-[#1E56A0] border-[#1E56A0]'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{cond.label}</span>
                          {isChecked ? <CheckCircle2 className="w-4 h-4 text-[#1E56A0]" /> : <span className="w-4 h-4 rounded-full border border-slate-300" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Past History Notes */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Past Surgeries or Hospitalizations (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={historyData.pastMedicalHistory.notes}
                    onChange={(e) => setHistoryData({
                      ...historyData,
                      pastMedicalHistory: { ...historyData.pastMedicalHistory, notes: e.target.value }
                    })}
                    placeholder="e.g. Appendectomy in 2020, hospitalized for Dengue in 2022..."
                    className="w-full bg-white border border-slate-200 focus:border-[#1E56A0] rounded-xl p-3 text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* SECTION 4: CURRENT MEDICATIONS */}
            {currentSection === 4 && (
              <div className="p-5 sm:p-7 space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#1E56A0] uppercase tracking-wider">Step 4 of 8</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                    {t('sec_4_title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t('sec_4_desc')}
                  </p>
                </div>

                {/* Add Medication Form */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add Medication</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      placeholder="Medication Name (e.g. Amlodipine)"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newMed.dose}
                      onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                      placeholder="Dose (e.g. 5mg)"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newMed.name.trim()) return;
                        setHistoryData({
                          ...historyData,
                          medications: [...historyData.medications, newMed]
                        });
                        setNewMed({ name: '', dose: '', frequency: 'Once daily', reason: '' });
                      }}
                      className="bg-[#1E56A0] text-white py-2 px-3 rounded-lg font-bold text-xs hover:bg-[#16427D] cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('add_medication')}</span>
                    </button>
                  </div>
                </div>

                {/* Current Medications List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span>Reported Medicines ({historyData.medications.length})</span>
                    <button
                      type="button"
                      onClick={() => setHistoryData({ ...historyData, medications: [] })}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {t('no_medications')}
                    </button>
                  </div>

                  {historyData.medications.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500 font-medium">
                      No current medications added yet. Tap "+ Add Medication" or continue if taking none.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {historyData.medications.map((m, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-blue-600 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900">{m.name}</span>
                              <span className="text-slate-500 font-mono ml-2">{m.dose || ''} {m.frequency || ''}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = historyData.medications.filter((_, i) => i !== idx);
                              setHistoryData({ ...historyData, medications: updated });
                            }}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 5: ALLERGIES */}
            {currentSection === 5 && (
              <div className="p-5 sm:p-7 space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#1E56A0] uppercase tracking-wider">Step 5 of 8</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                    {t('sec_5_title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t('sec_5_desc')}
                  </p>
                </div>

                {/* Add Allergy Form */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add Known Allergy</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newAllergy.allergen}
                      onChange={(e) => setNewAllergy({ ...newAllergy, allergen: e.target.value })}
                      placeholder="Allergen Name (e.g. Penicillin, Sulfa)"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newAllergy.reaction}
                      onChange={(e) => setNewAllergy({ ...newAllergy, reaction: e.target.value })}
                      placeholder="Reaction (e.g. Hives, Swelling)"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newAllergy.allergen.trim()) return;
                        setHistoryData({
                          ...historyData,
                          allergies: [...historyData.allergies, newAllergy]
                        });
                        setNewAllergy({ allergen: '', category: 'Drug', reaction: '' });
                      }}
                      className="bg-[#1E56A0] text-white py-2 px-3 rounded-lg font-bold text-xs hover:bg-[#16427D] cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Allergy</span>
                    </button>
                  </div>
                </div>

                {/* Allergies List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span>Reported Allergies ({historyData.allergies.length})</span>
                    <button
                      type="button"
                      onClick={() => setHistoryData({ ...historyData, allergies: [{ allergen: 'No Known Allergies', category: 'General' }] })}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                    >
                      {t('no_allergies')}
                    </button>
                  </div>

                  {historyData.allergies.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500 font-medium">
                      No allergies reported. Tap "No Known Allergies" or add above.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {historyData.allergies.map((a, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-red-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900">{a.allergen}</span>
                              {a.reaction && <span className="text-slate-500 font-mono ml-2">({a.reaction})</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = historyData.allergies.filter((_, i) => i !== idx);
                              setHistoryData({ ...historyData, allergies: updated });
                            }}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 6: FAMILY HISTORY */}
            {currentSection === 6 && (
              <div className="p-5 sm:p-7 space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#1E56A0] uppercase tracking-wider">Step 6 of 8</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                    {t('sec_6_title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t('sec_6_desc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Hypertension', 'Diabetes', 'Heart Disease', 'Asthma', 'Cancer'].map((cond) => {
                    const isChecked = historyData.familyHistory.conditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => {
                          let updated = [...historyData.familyHistory.conditions];
                          if (isChecked) updated = updated.filter(c => c !== cond);
                          else updated.push(cond);
                          setHistoryData({
                            ...historyData,
                            familyHistory: { ...historyData.familyHistory, conditions: updated }
                          });
                        }}
                        className={`p-3.5 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer text-left flex items-center justify-between ${
                          isChecked
                            ? 'bg-blue-50 text-[#1E56A0] border-[#1E56A0]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          {cond}
                        </span>
                        {isChecked ? <CheckCircle2 className="w-4 h-4 text-[#1E56A0]" /> : <span className="w-4 h-4 rounded-full border border-slate-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 7: PERSONAL & LIFESTYLE HISTORY */}
            {currentSection === 7 && (
              <div className="p-5 sm:p-7 space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#1E56A0] uppercase tracking-wider">Step 7 of 8</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                    {t('sec_7_title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t('sec_7_desc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tobacco / Smoking</label>
                    <div className="flex gap-2">
                      {['Never', 'Occasional', 'Regular'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setHistoryData({
                            ...historyData,
                            personalHistory: { ...historyData.personalHistory, smoking: s }
                          })}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            historyData.personalHistory.smoking === s
                              ? 'bg-[#1E56A0] text-white border-[#1E56A0]'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Alcohol Use</label>
                    <div className="flex gap-2">
                      {['Never', 'Occasional', 'Regular'].map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setHistoryData({
                            ...historyData,
                            personalHistory: { ...historyData.personalHistory, alcohol: a }
                          })}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            historyData.personalHistory.alcohol === a
                              ? 'bg-[#1E56A0] text-white border-[#1E56A0]'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 8: REVIEW OF SYSTEMS (ROS) */}
            {currentSection === 8 && (
              <div className="p-5 sm:p-7 space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#1E56A0] uppercase tracking-wider">Step 8 of 8</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                    {t('sec_8_title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t('sec_8_desc')}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    'Chills / Sweat', 'Shortness of Breath', 'Palpitations', 'Nausea / Vomiting',
                    'Dizziness', 'Joint Pain', 'Skin Rash', 'Fatigue'
                  ].map((sys) => {
                    const isChecked = historyData.reviewOfSystems.general.includes(sys);
                    return (
                      <button
                        key={sys}
                        type="button"
                        onClick={() => {
                          let updated = [...historyData.reviewOfSystems.general];
                          if (isChecked) updated = updated.filter(s => s !== sys);
                          else updated.push(sys);
                          setHistoryData({
                            ...historyData,
                            reviewOfSystems: { ...historyData.reviewOfSystems, general: updated }
                          });
                        }}
                        className={`p-3 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-blue-50 text-[#1E56A0] border-[#1E56A0]'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="truncate">{sys}</span>
                        {isChecked && <Check className="w-4 h-4 text-[#1E56A0] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mx-5 sm:mx-7 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-bold text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="p-5 sm:p-7 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="py-3.5 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <span>{currentSection === 8 ? 'Review Health Summary' : t('save_and_continue')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium">
        MediKiosk Clinical Core v2.4 • Non-Diagnostic Patient Intake Engine
      </footer>
    </div>
  );
}
