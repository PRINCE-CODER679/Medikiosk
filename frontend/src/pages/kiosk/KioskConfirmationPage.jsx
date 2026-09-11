import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KioskHeader } from '../../components/kiosk/KioskComponents';
import { ApiService } from '../../services/api';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  User
} from 'lucide-react';

export function KioskConfirmationPage() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('pendingPatient');
    if (!raw) {
      navigate('/kiosk/identity');
      return;
    }
    try {
      setPatient(JSON.parse(raw));
    } catch (e) {
      navigate('/kiosk/identity');
    }
  }, [navigate]);

  if (!patient) return null;

  const nowFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ' • ' + new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleConfirmIdentity = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Create Encounter
      const encRes = await ApiService.createEncounter({ patientId: patient.id, source: 'MediKiosk' });
      if (!encRes.ok) throw new Error('Failed to create clinical encounter.');
      const encounter = encRes.data;

      // 2. Create Session
      const sessRes = await ApiService.createSession({
        patientId: patient.id,
        encounterId: encounter.id,
        currentStep: 'SESSION_ESTABLISHED',
        languagePreference: 'en'
      });
      if (!sessRes.ok) throw new Error('Failed to establish patient session.');
      const session = sessRes.data;

      // Store established active session
      const activeState = { patient, encounter, session };
      sessionStorage.setItem('activeKioskSession', JSON.stringify(activeState));

      // Navigate to Session view
      navigate('/kiosk/session');
    } catch (err) {
      setErrorMessage(err.message || 'Verification confirmation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between select-none font-sans">
      {/* Hospital Kiosk Header */}
      <KioskHeader showBack={true} onBack={() => navigate('/kiosk/identity')} />

      {/* Progress Indicator */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-2 font-bold text-[#1E56A0]">
            <span className="w-6 h-6 rounded-full bg-[#1E56A0] text-white flex items-center justify-center text-[11px]">2</span>
            Context Confirmation
          </span>
          <span className="text-slate-400">Step 2 of 4</span>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left"
        >
          {/* Card Header */}
          <div className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-blue-50/40 via-slate-50 to-teal-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1E56A0] flex items-center justify-center font-bold shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                  Confirm Your Identity
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Please verify that these details match your patient profile before proceeding.
                </p>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-5 sm:p-7 space-y-6">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Patient Context Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1E56A0] text-white flex items-center justify-center font-bold text-lg">
                    {patient.name ? patient.name.charAt(0) : 'P'}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{patient.name}</h3>
                    <span className="text-xs font-mono text-slate-500 font-bold">ID: {patient.id}</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {patient.verificationStatus || 'Sandbox ABDM Verified'}
                </span>
              </div>

              {/* Demographics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Age &amp; Gender</span>
                  <span className="font-extrabold text-slate-900 mt-0.5 block">{patient.age} yrs • {patient.gender}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mobile Number</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">{patient.phone || '+91 98765 43210'}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ABHA Address</span>
                  <span className="font-mono font-bold text-teal-700 mt-0.5 block truncate">
                    {patient.abhaId || 'Not Linked'}
                  </span>
                </div>
              </div>

              {/* Visit Context */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>OPD Consultation • General Medicine (Room 04)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{nowFormatted}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmIdentity}
                disabled={loading}
                className="w-full py-4 px-6 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl font-bold text-base transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Establishing Clinical Session...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Yes, this is me — Start Visit</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('pendingPatient');
                  navigate('/kiosk/identity');
                }}
                disabled={loading}
                className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-slate-500" />
                <span>No, try a different ID / Search again</span>
              </button>
            </div>

          </div>
        </motion.div>
      </main>

      {/* Footer Branding */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium">
        MediKiosk Clinical Core v2.4 • Isolated Patient Session Context
      </footer>
    </div>
  );
}
