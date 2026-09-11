import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge, Avatar } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/TableAndTabs';
import { Modal } from '../../components/ui/OverlayAndFeedback';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  FileText,
  Clock,
  HeartPulse,
  Activity,
  ShieldAlert,
  Edit3,
  XCircle,
  CheckCircle2,
  Save,
  Check
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [editing, setEditing] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [verifiedStatus, setVerifiedStatus] = useState('Awaiting Review');
  const [toastMessage, setToastMessage] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    ApiService.getPatientById(id).then((data) => {
      if (data) {
        setPatient(data);
        setSummaryText(data.aiSummary);
        setLoading(false);
      }
    });
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Activity className="w-10 h-10 text-[#1E56A0] animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-left bg-transparent min-w-0">
            <span className="text-xs font-mono text-slate-400 font-bold truncate">Directory &gt; {patient.id}</span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none mt-0.5 truncate">{patient.name}</h2>
          </div>
        </div>

        <Badge
          variant={verifiedStatus.includes('Approved') ? 'success' : verifiedStatus.includes('Rejected') ? 'danger' : 'warning'}
          size="lg"
          className="self-start sm:self-auto shrink-0"
        >
          Doctor Status: {verifiedStatus}
        </Badge>
      </div>

      {/* Patient Header Card (static on mobile, sticky on sm+) */}
      <div className="static sm:sticky top-16 z-20 shadow-xl rounded-3xl overflow-hidden mb-6 min-w-0">
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0D9488] text-white p-5 md:p-8 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
              <Avatar name={patient.name} size="xl" className="ring-4 ring-white/20 shrink-0" />
              <div className="text-left bg-transparent min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">{patient.name}</h1>
                  <Badge variant="primary" size="sm" className="shrink-0">ABHA Verified</Badge>
                </div>
                <p className="text-xs text-slate-200 font-mono mt-1 font-semibold truncate">
                  {patient.age} yrs • {patient.gender} • Blood Group: {patient.bloodGroup} • ABHA: {patient.abhaId}
                </p>
                <p className="text-xs text-teal-300 mt-1 font-semibold truncate">
                  Phone: {patient.phone} • Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Quick Stat Pill Matrix — 2-col on mobile, 4-col on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-center">
              <div className="bg-red-500/20 border border-red-500/30 p-2.5 rounded-2xl backdrop-blur-xs">
                <p className="text-[10px] font-extrabold text-red-300 uppercase">{t('nav_redflags')}</p>
                <p className="text-lg font-black text-white mt-0.5">02</p>
              </div>
              <div className="bg-teal-500/20 border border-teal-500/30 p-2.5 rounded-2xl backdrop-blur-xs">
                <p className="text-[10px] font-extrabold text-teal-300 uppercase">{t('medications')}</p>
                <p className="text-lg font-black text-white mt-0.5">{patient.medications ? patient.medications.length : 2}</p>
              </div>
              <div className="bg-amber-500/20 border border-amber-500/30 p-2.5 rounded-2xl backdrop-blur-xs">
                <p className="text-[10px] font-extrabold text-amber-300 uppercase">Allergies</p>
                <p className="text-lg font-black text-white mt-0.5">{patient.allergies ? patient.allergies.length : 1}</p>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 p-2.5 rounded-2xl backdrop-blur-xs">
                <p className="text-[10px] font-extrabold text-blue-300 uppercase">{t('cap_doc_ocr')}</p>
                <p className="text-lg font-black text-white mt-0.5">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="overflow-x-auto flex gap-4 sm:gap-6 text-sm font-medium border-b border-slate-200 -mx-1 px-1 scrollbar-none">
        {[
          { id: 'summary', label: t('clinical_summary'), icon: FileText },
          { id: 'vitals', label: 'Vitals & Allergies', icon: HeartPulse },
          { id: 'timeline', label: t('nav_timeline'), icon: Clock },
          { id: 'documents', label: t('cap_doc_ocr'), icon: FileText, count: 12 }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-1 relative transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'text-[#1E56A0] font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5 sm:gap-2">
              {tab.icon && <tab.icon className="w-4 h-4 shrink-0" />}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-blue-100 text-[#1E56A0]' : 'bg-slate-100 text-slate-600'
                }`}>{tab.count}</span>
              )}
            </span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E56A0] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Complaint & Summary Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card title={t('with_mk_guided')}>
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-start gap-3 text-left">
              <Activity className="w-5 h-5 text-[#1E56A0] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{t('voice_captured_speech')}</p>
                <p className="text-base font-bold text-slate-900 mt-1">"{patient.complaint}"</p>
              </div>
            </div>
          </Card>

          {/* AI Clinical Summary Container */}
          <Card
            title={t('clinical_summary') + ' Draft'}
            subtitle={t('disclaimer_sub')}
            action={
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Confidence Score: 94% ●●●●●
                </span>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Disclaimer Banner */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 text-left">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t('disclaimer_warning')}</span>
              </div>

              {editing ? (
                <textarea
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  className="w-full h-40 p-4 bg-slate-50 border-2 border-blue-300 rounded-2xl text-xs font-sans leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <div className="p-5 bg-slate-900 text-slate-100 rounded-2xl text-xs font-sans leading-relaxed space-y-3 shadow-inner text-left">
                  <p className="text-slate-200 font-medium">{summaryText}</p>
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                    <span>Clinical LLM: MediKiosk-Clinical-v1</span>
                    <span className="text-teal-300 font-bold">Status: {verifiedStatus}</span>
                  </div>
                </div>
              )}

              {/* Physician Interactive Toolbar */}
              <div className="p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(!editing);
                    if (editing) showToast('Edits saved to draft');
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-600" />
                  {editing ? 'Preview Text' : t('edit_summary')}
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowRejectModal(true)}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    {t('reject')}
                  </Button>

                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setVerifiedStatus('Doctor Verified & Approved');
                      showToast('Clinical summary verified by Dr. Ananya Sharma!');
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {t('confirm_sign')}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => showToast('Pushed to Hospital EMR Database!')}
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    {t('save_to_emr')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Vitals Scan & Allergies */}
        <div className="space-y-6">
          <Card title={t('nav_redflags')}>
            <div className="space-y-3">
              <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-3 text-xs text-red-950 text-left">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold">Penicillin Allergy (Anaphylaxis)</p>
                  <p className="text-[11px] text-red-700 mt-0.5">Do not prescribe beta-lactam antibiotics.</p>
                </div>
              </div>

              {patient.allergies &&
                patient.allergies.map((alg, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 text-left">
                    ⚠ {alg}
                  </div>
                ))}
            </div>
          </Card>

          <Card title="Recorded Vitals Scan">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-extrabold text-slate-400">Temperature</p>
                <p className="text-base font-black text-red-600 mt-0.5">{patient.vitals?.temp || '101.4 °F'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-extrabold text-slate-400">Blood Pressure</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{patient.vitals?.bp || '138/88 mmHg'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-extrabold text-slate-400">SpO2 Oxygen</p>
                <p className="text-base font-black text-emerald-600 mt-0.5">{patient.vitals?.spo2 || '97%'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-extrabold text-slate-400">Pulse Rate</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{patient.vitals?.pulse || '92 bpm'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject AI Summary Draft"
        subtitle="Specify clinical reason for summary rejection"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setVerifiedStatus('Rejected by Doctor');
                setShowRejectModal(false);
                showToast('Summary marked as rejected');
              }}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-left bg-white">
          <p className="font-semibold text-slate-700">Rejection Reason:</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Symptoms incompletely captured or requires manual physician re-interview..."
            className="w-full h-24 p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
}
