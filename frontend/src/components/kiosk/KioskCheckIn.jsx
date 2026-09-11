import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserCheck, CreditCard, UserPlus, ArrowRight, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { ApiService } from '../../services/api';

export function KioskCheckIn({ onComplete, onBack }) {
  const [selectedMethod, setSelectedMethod] = useState(null); // null | 'ABHA' | 'AADHAAR' | 'NEW'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // ABHA Form state
  const [abhaInput, setAbhaInput] = useState('');
  
  // Aadhaar Form state
  const [aadhaarInput, setAadhaarInput] = useState('');
  
  // New Patient Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: ''
  });

  // Completed Session Result state
  const [sessionResult, setSessionResult] = useState(null);

  // Format ABHA input with hyphens XX-XXXX-XXXX-XXXX
  const handleAbhaChange = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 14);
    let formatted = raw;
    if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2)}`;
    }
    if (raw.length > 6) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2, 6)}-${raw.slice(6)}`;
    }
    if (raw.length > 10) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2, 6)}-${raw.slice(6, 10)}-${raw.slice(10)}`;
    }
    setAbhaInput(formatted);
    setErrorMessage('');
  };

  // Format Aadhaar input XXXX XXXX XXXX
  const handleAadhaarChange = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    setAadhaarInput(raw);
    setErrorMessage('');
  };

  // Submit Identity (ABHA or Aadhaar)
  const handleVerifyIdentity = async (method, identifier) => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // 1. Identify Patient
      const res = await ApiService.identifyPatient({ method, identifier });
      if (!res.ok) throw new Error(res.error || 'Verification failed.');
      const patient = res.data;

      // 2. Create Encounter
      const encRes = await ApiService.createEncounter({ patientId: patient.id });
      if (!encRes.ok) throw new Error('Failed to create clinical encounter.');
      const encounter = encRes.data;

      // 3. Create Session
      const sessRes = await ApiService.createSession({
        patientId: patient.id,
        encounterId: encounter.id,
        currentStep: 'IDENTITY'
      });
      if (!sessRes.ok) throw new Error('Failed to establish patient session.');
      const session = sessRes.data;

      setSessionResult({
        patient,
        encounter,
        session
      });
    } catch (err) {
      setErrorMessage(err.message || 'We couldn\'t verify your details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit New Patient Registration
  const handleRegisterNewPatient = async (e) => {
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
      // 1. Register Patient
      const res = await ApiService.registerPatient(formData);
      if (!res.ok) throw new Error(res.error || 'Registration failed.');
      const patient = res.data;

      // 2. Create Encounter
      const encRes = await ApiService.createEncounter({ patientId: patient.id });
      if (!encRes.ok) throw new Error('Failed to create clinical encounter.');
      const encounter = encRes.data;

      // 3. Create Session
      const sessRes = await ApiService.createSession({
        patientId: patient.id,
        encounterId: encounter.id,
        currentStep: 'IDENTITY'
      });
      if (!sessRes.ok) throw new Error('Failed to establish patient session.');
      const session = sessRes.data;

      setSessionResult({
        patient,
        encounter,
        session
      });
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong while starting your session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render Completed Verified Patient Context Card
  if (sessionResult) {
    const { patient, encounter, session } = sessionResult;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 sm:p-8 bg-slate-900 rounded-3xl border-2 border-emerald-500/40 shadow-2xl text-left space-y-6"
      >
        {/* Banner */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Identity Verified</h3>
              <p className="text-xs text-emerald-400 font-semibold">{patient.verificationStatus}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono font-bold rounded-full border border-slate-700">
            Phase 2 Prototype Session
          </span>
        </div>

        {/* Patient Details Context Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Patient Name</p>
            <p className="text-base font-extrabold text-white mt-0.5">{patient.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Patient ID</p>
            <p className="text-base font-mono font-extrabold text-teal-300 mt-0.5">{patient.id}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Demographics</p>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">{patient.age} yrs • {patient.gender}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Mobile Contact</p>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">{patient.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Encounter ID</p>
            <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">{encounter.id}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Session ID</p>
            <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">{session.sessionId}</p>
          </div>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={() => onComplete(sessionResult)}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-base font-bold transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30"
        >
          <span>Continue to Health Check</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="p-6 sm:p-8 bg-slate-900/95 rounded-3xl border border-slate-800 space-y-6 text-left shadow-2xl">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold mb-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Patient Check-in</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Patient Check-in</h2>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          Let's securely identify you before starting your health assessment.
        </p>
      </div>

      {/* Error Alert Message */}
      {errorMessage && (
        <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs font-semibold flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Method Selection View */}
      {!selectedMethod && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            Choose Check-in Method
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Option 1: ABHA */}
            <button
              type="button"
              onClick={() => setSelectedMethod('ABHA')}
              className="p-5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border-2 border-slate-800 hover:border-blue-500 transition-all text-left group cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-blue-300">ABHA</h4>
                <p className="text-xs text-slate-400 mt-0.5">Use your ABHA ID</p>
              </div>
            </button>

            {/* Option 2: Aadhaar */}
            <button
              type="button"
              onClick={() => setSelectedMethod('AADHAAR')}
              className="p-5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border-2 border-slate-800 hover:border-teal-500 transition-all text-left group cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-950 text-teal-400 flex items-center justify-center border border-teal-800 group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-teal-300">Aadhaar</h4>
                <p className="text-xs text-slate-400 mt-0.5">Use Aadhaar for verification</p>
              </div>
            </button>

            {/* Option 3: New Patient */}
            <button
              type="button"
              onClick={() => setSelectedMethod('NEW')}
              className="p-5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border-2 border-slate-800 hover:border-blue-400 transition-all text-left group cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700 group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-slate-200">New Patient</h4>
                <p className="text-xs text-slate-400 mt-0.5">Continue as a new patient</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 2. ABHA Input View */}
      {selectedMethod === 'ABHA' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-white">Enter ABHA ID</h4>
            <button
              type="button"
              onClick={() => { setSelectedMethod(null); setErrorMessage(''); }}
              className="text-xs font-semibold text-slate-400 hover:text-white underline cursor-pointer"
            >
              Change Method
            </button>
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-blue-300 text-xs font-medium">
            Prototype / Sandbox Verification — Enter 14-digit ABHA ID (e.g. 12-3456-7890-1234).
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              ABHA ID (14 Digits)
            </label>
            <input
              type="text"
              value={abhaInput}
              onChange={(e) => handleAbhaChange(e.target.value)}
              placeholder="12-3456-7890-1234"
              maxLength={17}
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-lg font-mono text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <button
            type="button"
            disabled={loading || abhaInput.replace(/\D/g, '').length !== 14}
            onClick={() => handleVerifyIdentity('ABHA', abhaInput)}
            className="w-full py-3.5 px-5 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Verify ABHA</span>
          </button>
        </div>
      )}

      {/* 3. Aadhaar Input View */}
      {selectedMethod === 'AADHAAR' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-white">Enter Aadhaar Number</h4>
            <button
              type="button"
              onClick={() => { setSelectedMethod(null); setErrorMessage(''); }}
              className="text-xs font-semibold text-slate-400 hover:text-white underline cursor-pointer"
            >
              Change Method
            </button>
          </div>

          <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs font-semibold">
            Prototype mode — no real Aadhaar data is processed or stored.
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Aadhaar Number (12 Digits)
            </label>
            <input
              type="text"
              value={aadhaarInput}
              onChange={(e) => handleAadhaarChange(e.target.value)}
              placeholder="1234 5678 9012"
              maxLength={12}
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-teal-500 rounded-xl px-4 py-3 text-lg font-mono text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <button
            type="button"
            disabled={loading || aadhaarInput.length !== 12}
            onClick={() => handleVerifyIdentity('AADHAAR', aadhaarInput)}
            className="w-full py-3.5 px-5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Verify Aadhaar</span>
          </button>
        </div>
      )}

      {/* 4. New Patient Registration Form View */}
      {selectedMethod === 'NEW' && (
        <form onSubmit={handleRegisterNewPatient} className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-white">New Patient Registration</h4>
            <button
              type="button"
              onClick={() => { setSelectedMethod(null); setErrorMessage(''); }}
              className="text-xs font-semibold text-slate-400 hover:text-white underline cursor-pointer"
            >
              Change Method
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Amit Verma"
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Age (Years) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g. 34"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Mobile Number (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Complete Registration &amp; Check-in</span>
          </button>
        </form>
      )}
    </div>
  );
}
