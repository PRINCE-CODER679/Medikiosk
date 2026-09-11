import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KioskHeader } from '../../components/kiosk/KioskComponents';
import { ApiService } from '../../services/api';
import {
  Search,
  UserCheck,
  UserPlus,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  BadgeCheck,
  FileText
} from 'lucide-react';

export function KioskIdentityPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('EXISTING'); // 'EXISTING' | 'NEW' | 'QUICK'
  const [identifierInput, setIdentifierInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // New patient registration form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: ''
  });

  const demoPatients = [
    { label: 'Ramesh Kumar (PAT-10928)', id: 'PAT-10928', detail: '45y • Male • Chest Tightness' },
    { label: 'Priya Sharma (PAT-10929)', id: 'PAT-10929', detail: '34y • Female • Abdominal Pain' },
    { label: 'Suresh Gupta (ABHA)', id: '14-8829-1029-4829', detail: '62y • Male • SpO2 94%' }
  ];

  // Submit Existing Patient Lookup
  const handleLookup = async (idToSearch) => {
    const searchId = (idToSearch || identifierInput).trim();
    if (!searchId) {
      setErrorMessage('Please enter an ABHA ID (e.g. 14-8829-1029-4829) or Patient ID (e.g. PAT-10928).');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await ApiService.identifyPatient({ method: 'AUTO', identifier: searchId });
      if (!res.ok) {
        throw new Error(res.error || `No patient record found for "${searchId}". Please check the ID or register as a new patient.`);
      }

      // Store pending patient in sessionStorage & navigate to confirmation
      sessionStorage.setItem('pendingPatient', JSON.stringify(res.data));
      navigate('/kiosk/confirmation');
    } catch (err) {
      setErrorMessage(err.message || 'Lookup failed. Please check the ID or register as a new patient.');
    } finally {
      setLoading(false);
    }
  };

  // Submit New Patient Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Please enter a valid Full Name (minimum 2 characters).');
      return;
    }
    if (!formData.age || Number(formData.age) < 0 || Number(formData.age) > 120) {
      setErrorMessage('Please enter a valid age between 0 and 120.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await ApiService.registerPatient({
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone.trim() || undefined
      });

      if (!res.ok) {
        throw new Error(res.error || 'Patient registration failed.');
      }

      sessionStorage.setItem('pendingPatient', JSON.stringify(res.data));
      navigate('/kiosk/confirmation');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Quick Registration
  const handleQuickRegister = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await ApiService.registerPatient({
        name: 'Walk-in OPD Patient',
        age: 35,
        gender: 'Other',
        phone: '+91 90000 00000'
      });

      if (!res.ok) throw new Error('Quick registration failed.');

      sessionStorage.setItem('pendingPatient', JSON.stringify(res.data));
      navigate('/kiosk/confirmation');
    } catch (err) {
      setErrorMessage(err.message || 'Quick registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between select-none font-sans">
      {/* Hospital Kiosk Header */}
      <KioskHeader showBack={true} onBack={() => navigate('/kiosk')} />

      {/* Progress Indicator */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-2 font-bold text-[#1E56A0]">
            <span className="w-6 h-6 rounded-full bg-[#1E56A0] text-white flex items-center justify-center text-[11px]">1</span>
            Patient Identification
          </span>
          <span className="text-slate-400">Step 1 of 4</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Card Title Banner */}
          <div className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1E56A0] border border-blue-200">
                  <Building2 className="w-3.5 h-3.5" />
                  OPD Kiosk Check-In
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                  Patient Identification
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Look up an existing hospital record or register as a new patient to start your OPD visit.
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 mt-5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => { setActiveTab('EXISTING'); setErrorMessage(''); }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'EXISTING'
                    ? 'bg-white text-[#1E56A0] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Existing Patient</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('NEW'); setErrorMessage(''); }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'NEW'
                    ? 'bg-white text-[#1E56A0] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>New Registration</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('QUICK'); setErrorMessage(''); }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'QUICK'
                    ? 'bg-white text-[#1E56A0] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BadgeCheck className="w-4 h-4 text-teal-600" />
                <span>Quick Walk-in</span>
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-5 sm:p-7 space-y-6">
            
            {/* Error Alert Box */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-800 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-red-900">Patient Lookup Error</p>
                  <p className="mt-0.5 font-medium leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* TAB 1: EXISTING PATIENT LOOKUP */}
            {activeTab === 'EXISTING' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enter Patient ID or ABHA Number
                  </label>
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={identifierInput}
                      onChange={(e) => { setIdentifierInput(e.target.value); setErrorMessage(''); }}
                      placeholder="e.g. PAT-10928 or 14-8829-1029-4829"
                      disabled={loading}
                      onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                      className="w-full bg-white border-2 border-slate-200 focus:border-[#1E56A0] rounded-xl pl-11 pr-4 py-3 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Supports hospital Patient ID (<span className="font-mono text-slate-700 font-bold">PAT-XXXXX</span>) or 14-digit ABHA ID.
                  </p>
                </div>

                {/* Demo Quick Chips */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Demo Search (Click to Test):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {demoPatients.map((demo) => (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => {
                          setIdentifierInput(demo.id);
                          handleLookup(demo.id);
                        }}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-[#1E56A0] border border-slate-200 transition-colors cursor-pointer text-slate-700 flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{demo.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="button"
                  onClick={() => handleLookup()}
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching Hospital Records...</span>
                    </>
                  ) : (
                    <>
                      <span>Find Patient Record</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 2: NEW PATIENT REGISTRATION */}
            {activeTab === 'NEW' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-white border border-slate-200 focus:border-[#1E56A0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Age (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="e.g. 45"
                      className="w-full bg-white border border-slate-200 focus:border-[#1E56A0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 pt-0.5">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: g })}
                          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            formData.gender === g
                              ? 'bg-[#1E56A0] text-white border-[#1E56A0]'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mobile Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white border border-slate-200 focus:border-[#1E56A0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Register &amp; Proceed to Confirmation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: QUICK WALK-IN */}
            {activeTab === 'QUICK' && (
              <div className="space-y-5 text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-900">Direct Walk-in Intake</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Proceed immediately with a temporary intake profile without pre-entering demographic records. You can update your details with the triage nurse.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleQuickRegister}
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Starting Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue as New Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

          {/* Footer Notice */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium px-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              SIH '26 Prototype — No real Aadhaar stored
            </span>
            <span className="font-mono text-slate-400">OPD Room 04</span>
          </div>

        </motion.div>
      </main>

      {/* Footer Branding */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium">
        MediKiosk Clinical Core v2.4 • ABDM &amp; FHIR Ready Architecture
      </footer>
    </div>
  );
}
