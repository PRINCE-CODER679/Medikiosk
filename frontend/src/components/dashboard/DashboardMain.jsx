import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Stethoscope,
  AlertTriangle,
  FileText,
  RefreshCw,
  Monitor,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Eye,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileCheck,
  AlertCircle,
  X,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  Activity,
  ChevronDown,
  Copy,
  ExternalLink,
  Heart,
  Thermometer,
  Zap,
  TrendingUp,
  Brain,
  Check
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function DashboardMain({
  stats,
  encounters = [],
  alerts = [],
  refreshing = false,
  onSync
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State management
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'URGENT' | 'ROUTINE'
  const [activeMetricCard, setActiveMetricCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChartTab, setActiveChartTab] = useState('INTAKE_FLOW'); // 'INTAKE_FLOW' | 'HOURLY_QUEUE' | 'DEPARTMENT'
  const [alertSeverityFilter, setAlertSeverityFilter] = useState('ALL');
  const [opdRoom, setOpdRoom] = useState('OPD Room 04 - General Medicine');
  const [showOpdDropdown, setShowOpdDropdown] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [modalTab, setModalTab] = useState('SUMMARY'); // 'SUMMARY' | 'VITALS' | 'RECOMMENDATIONS'
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, [currentTime]);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, [currentTime]);

  // Chart data
  const chartData = useMemo(() => {
    if (stats?.intakeActivityHourly && stats.intakeActivityHourly.length > 0) {
      return stats.intakeActivityHourly.map(item => ({
        ...item,
        queue: Math.round(item.intakes * 0.4),
        escalationPct: Math.round((item.redFlags / (item.intakes || 1)) * 100)
      }));
    }
    return [
      { hour: '08:00 AM', intakes: 12, redFlags: 0, queue: 4, escalationPct: 0 },
      { hour: '09:00 AM', intakes: 24, redFlags: 1, queue: 8, escalationPct: 4 },
      { hour: '10:00 AM', intakes: 38, redFlags: 3, queue: 14, escalationPct: 8 },
      { hour: '11:00 AM', intakes: 29, redFlags: 2, queue: 11, escalationPct: 7 },
      { hour: '12:00 PM', intakes: 15, redFlags: 0, queue: 5, escalationPct: 0 },
      { hour: '01:00 PM', intakes: 22, redFlags: 1, queue: 7, escalationPct: 5 },
      { hour: '02:00 PM', intakes: 31, redFlags: 1, queue: 10, escalationPct: 3 }
    ];
  }, [stats]);

  // Sparklines
  const sparklinePatients = [{ v: 180 }, { v: 195 }, { v: 210 }, { v: 225 }, { v: 248 }];
  const sparklineEncounters = [{ v: 80 }, { v: 95 }, { v: 110 }, { v: 118 }, { v: 126 }];
  const sparklineRedFlags = [{ v: 12 }, { v: 10 }, { v: 11 }, { v: 9 }, { v: 8 }];
  const sparklineOcr = [{ v: 290 }, { v: 320 }, { v: 350 }, { v: 375 }, { v: 394 }];

  // Filtering encounters
  const filteredEncounters = useMemo(() => {
    return encounters.filter(item => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        item.patientName?.toLowerCase().includes(query) ||
        item.patientId?.toLowerCase().includes(query) ||
        item.complaint?.toLowerCase().includes(query) ||
        item.aiSummary?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (activeMetricCard === 'RED_FLAGS') {
        return item.urgency === 'Critical' || item.urgency === 'Urgent';
      }
      if (activeMetricCard === 'REVIEW_PENDING') {
        return item.status === 'Waiting Physician' || item.status === 'In Progress';
      }

      if (activeFilter === 'CRITICAL') return item.urgency === 'Critical';
      if (activeFilter === 'URGENT') return item.urgency === 'Urgent' || item.urgency === 'Critical';
      if (activeFilter === 'ATTENTION') return item.urgency === 'Moderate';
      if (activeFilter === 'ROUTINE') return item.urgency === 'Routine';

      return true;
    });
  }, [encounters, searchQuery, activeFilter, activeMetricCard]);

  // Alerts
  const urgentAlertsCount = alerts.filter(a => a.severity === 'Critical' || a.severity === 'Urgent').length || 3;
  const moderateAlertsCount = alerts.filter(a => a.severity === 'Moderate').length || 2;

  const priorityItems = [
    {
      id: 'ALT-101',
      patient: 'Suresh Gupta',
      token: '#B-104',
      risk: 'Substernal chest tightness & SpO2 94% (Hypoxia Risk)',
      severity: 'Critical',
      time: '10m ago',
      confidence: '98%',
      vitals: 'BP 154/96 • SpO2 94%'
    },
    {
      id: 'ALT-102',
      patient: 'Ramesh Kumar',
      token: '#A-088',
      risk: 'Fever 101.4°F + Documented Anaphylactic Penicillin Allergy',
      severity: 'Urgent',
      time: '25m ago',
      confidence: '96%',
      vitals: 'Temp 101.4°F • HR 102'
    },
    {
      id: 'ALT-103',
      patient: 'Priya Sharma',
      token: '#C-112',
      risk: 'Acute RLQ Abdominal Tenderness & Tachycardia',
      severity: 'Urgent',
      time: '42m ago',
      confidence: '94%',
      vitals: 'HR 104 • BP 128/82'
    },
    {
      id: 'ALT-104',
      patient: 'Amit Patil',
      token: '#B-095',
      risk: 'Fasting glucose 142 mg/dL & HbA1c 9.2% (Endocrine Triage)',
      severity: 'Moderate',
      time: '1h ago',
      confidence: '92%',
      vitals: 'FBG 142 mg/dL'
    }
  ];

  const filteredPriorityItems = useMemo(() => {
    if (alertSeverityFilter === 'CRITICAL') return priorityItems.filter(i => i.severity === 'Critical');
    if (alertSeverityFilter === 'URGENT') return priorityItems.filter(i => i.severity === 'Critical' || i.severity === 'Urgent');
    if (alertSeverityFilter === 'MODERATE') return priorityItems.filter(i => i.severity === 'Moderate');
    return priorityItems;
  }, [alertSeverityFilter]);

  const handleCopySummary = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const TABLE_GRID_COLS = "grid-cols-[1.6fr_1fr_0.9fr_2fr_1.1fr_2fr_1fr_0.9fr]";

  return (
    <div className="space-y-5 sm:space-y-6 text-left font-sans select-none pb-12 w-full max-w-full min-w-0">
      
      {/* =====================================================================
          1. LIGHT WORKSPACE HEADER BANNER (RESPONSIVE FOR MOBILE & DESKTOP)
          ===================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-slate-50 to-blue-50/40 border border-slate-200/90 shadow-sm p-4 sm:p-7 text-slate-900"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 min-w-0">
          
          {/* Title & Demographics */}
          <div className="space-y-1.5 sm:space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live OPD Feed
              </span>

              {/* OPD Room Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOpdDropdown(!showOpdDropdown)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs max-w-[200px] sm:max-w-none truncate"
                >
                  <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">{opdRoom}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {showOpdDropdown && (
                  <div className="absolute left-0 mt-2 w-60 sm:w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs">
                    {[
                      'OPD Room 04 - General Medicine',
                      'OPD Room 02 - Cardiology Triage',
                      'OPD Room 09 - Emergency Triage',
                      'OPD Room 12 - Pediatrics'
                    ].map((room, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setOpdRoom(room);
                          setShowOpdDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                          opdRoom === room ? 'text-blue-700 font-bold bg-blue-50/50' : 'text-slate-700 font-medium'
                        }`}
                      >
                        <span className="truncate">{room}</span>
                        {opdRoom === room && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
              <span>Good morning, Dr. Ananya Sharma</span>
              <span className="text-lg sm:text-xl shrink-0">🩺</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              Real-time patient self-intake metrics, AI priority alerts, and FHIR-ready clinical summaries for today's OPD queue.
            </p>
          </div>

          {/* Action Buttons & Clock */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full lg:w-auto">
            
            {/* Live Clock Badge */}
            <div className="flex flex-1 sm:flex-none justify-between sm:justify-start items-center sm:flex-col text-left sm:text-right px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs font-mono">
              <span className="text-xs font-extrabold text-slate-900">{formattedDate}</span>
              <span className="text-xs text-blue-700 font-bold sm:ml-0 ml-2">{formattedTime}</span>
            </div>

            {/* Sync Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onSync}
              disabled={refreshing}
              className="flex-1 sm:flex-none px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 ${refreshing ? 'animate-spin text-teal-600' : ''}`} />
              <span>{t('dash_sync_button', 'Sync Feed')}</span>
            </motion.button>

            {/* View Kiosk Mode */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => navigate('/kiosk')}
              className="flex-1 sm:flex-none px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#1E56A0] hover:bg-[#16427D] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('dash_kiosk_view', 'Patient Kiosk')}</span>
            </motion.button>
          </div>

        </div>
      </motion.div>


      {/* =====================================================================
          2. STANDARDIZED METRIC CARDS (1 Col Mobile, 2 Col Tablet, 4 Col Desktop)
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch w-full min-w-0">
        
        {/* Card 1: Total Patients */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            setActiveMetricCard(activeMetricCard === 'PATIENTS' ? null : 'PATIENTS');
            setActiveFilter('ALL');
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-sm flex flex-col justify-between min-w-0 ${
            activeMetricCard === 'PATIENTS'
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-blue-50/20'
              : 'border-slate-200/90 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-[#1E56A0] flex items-center justify-center font-bold shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5 mt-2.5 sm:mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalPatients || '248'}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {stats?.totalPatientsTrend || '+12.4%'}
              </span>
            </div>
          </div>

          <div className="h-9 sm:h-10 w-full mt-2.5 sm:mt-3 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklinePatients}>
                <Area type="monotone" dataKey="v" stroke="#1E56A0" fill="#1E56A0" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2.5 sm:pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="truncate">24 self-checked via Kiosk</span>
            <span className="text-blue-700 font-bold shrink-0">Today</span>
          </div>
        </motion.div>

        {/* Card 2: Active Encounters */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            setActiveMetricCard(activeMetricCard === 'REVIEW_PENDING' ? null : 'REVIEW_PENDING');
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-sm flex flex-col justify-between min-w-0 ${
            activeMetricCard === 'REVIEW_PENDING'
              ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md bg-teal-50/20'
              : 'border-slate-200/90 hover:border-teal-300 hover:shadow-md'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Encounters</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5 mt-2.5 sm:mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.encountersToday || '126'}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {stats?.encountersTrend || '+8.2%'}
              </span>
            </div>
          </div>

          <div className="h-9 sm:h-10 w-full mt-2.5 sm:mt-3 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineEncounters}>
                <Area type="monotone" dataKey="v" stroke="#0D9488" fill="#0D9488" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2.5 sm:pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="truncate">18 awaiting physician review</span>
            <span className="text-teal-700 font-bold shrink-0">Active</span>
          </div>
        </motion.div>

        {/* Card 3: Priority Red Flags */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            setActiveMetricCard(activeMetricCard === 'RED_FLAGS' ? null : 'RED_FLAGS');
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-sm flex flex-col justify-between min-w-0 ${
            activeMetricCard === 'RED_FLAGS'
              ? 'border-red-500 ring-2 ring-red-500/20 shadow-md bg-red-50/20'
              : 'border-slate-200/90 hover:border-red-300 hover:shadow-md'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Red Flags</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5 mt-2.5 sm:mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.redFlagsCount || '8'}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 shrink-0">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {stats?.redFlagsUrgent || 3} Urgent
              </span>
            </div>
          </div>

          <div className="h-9 sm:h-10 w-full mt-2.5 sm:mt-3 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineRedFlags}>
                <Area type="monotone" dataKey="v" stroke="#DC2626" fill="#DC2626" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2.5 sm:pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="truncate">5 moderate risk flags</span>
            <span className="text-red-600 font-bold shrink-0">Action Needed</span>
          </div>
        </motion.div>

        {/* Card 4: Document OCR */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            setActiveMetricCard(activeMetricCard === 'OCR' ? null : 'OCR');
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-sm flex flex-col justify-between min-w-0 ${
            activeMetricCard === 'OCR'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/20'
              : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Document OCR</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5 mt-2.5 sm:mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.documentsProcessed || '394'}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {stats?.documentsTrend || '+18.0%'}
              </span>
            </div>
          </div>

          <div className="h-9 sm:h-10 w-full mt-2.5 sm:mt-3 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineOcr}>
                <Area type="monotone" dataKey="v" stroke="#6366F1" fill="#6366F1" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2.5 sm:pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="truncate">Prescriptions &amp; lab reports</span>
            <span className="text-indigo-700 font-bold shrink-0">Processed</span>
          </div>
        </motion.div>

      </div>


      {/* =====================================================================
          3. MAIN CONTENT ROW (CHART 8-COL & ALERTS 4-COL STACKED ON MOBILE)
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch w-full min-w-0">
        
        {/* LEFT COLUMN: Intake Activity Chart */}
        <div className="lg:col-span-8 flex flex-col min-w-0">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between h-full min-w-0">
            
            {/* Chart Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 shrink-0">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Patient Intake Activity &amp; Triage Trends
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold font-mono">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time hourly self-intake volume vs AI priority escalations
                </p>
              </div>

              {/* Multi-view Tabs */}
              <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl w-full sm:w-auto overflow-x-auto scroll-x-safe shrink-0">
                {[
                  { id: 'INTAKE_FLOW', label: 'Volume' },
                  { id: 'HOURLY_QUEUE', label: 'Queue Load' },
                  { id: 'DEPARTMENT', label: 'Escalation %' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveChartTab(tab.id)}
                    className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      activeChartTab === tab.id
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="flex-1 w-full pt-4 min-h-[220px] sm:min-h-[280px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIntakesLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E56A0" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1E56A0" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorFlagsLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorQueueLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#E2E8F0" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} stroke="#E2E8F0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      color: '#0F172A',
                      fontSize: '11px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                    itemStyle={{ color: '#0F172A', fontWeight: '600' }}
                  />

                  {activeChartTab === 'INTAKE_FLOW' && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="intakes"
                        stroke="#1E56A0"
                        strokeWidth={2.5}
                        fill="url(#colorIntakesLight)"
                        name="Patient Intakes"
                      />
                      <Area
                        type="monotone"
                        dataKey="redFlags"
                        stroke="#DC2626"
                        strokeWidth={2.5}
                        fill="url(#colorFlagsLight)"
                        name="Priority Flags"
                      />
                    </>
                  )}

                  {activeChartTab === 'HOURLY_QUEUE' && (
                    <Area
                      type="monotone"
                      dataKey="queue"
                      stroke="#0D9488"
                      strokeWidth={2.5}
                      fill="url(#colorQueueLight)"
                      name="Active Waiting Queue"
                    />
                  )}

                  {activeChartTab === 'DEPARTMENT' && (
                    <Area
                      type="monotone"
                      dataKey="escalationPct"
                      stroke="#8B5CF6"
                      strokeWidth={2.5}
                      fill="#8B5CF6"
                      fillOpacity={0.12}
                      name="Escalation Rate %"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Operational Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-100 shrink-0 w-full min-w-0">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Peak Intake Hour</p>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">10:00 AM (38 Intakes)</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Intake Time</p>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">4.2 mins / Patient</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">AI Escalation Rate</p>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">6.3% Priority Flags</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Priority Alerts Ticker */}
        <div className="lg:col-span-4 flex flex-col min-w-0">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between h-full min-w-0">
            
            {/* Header */}
            <div className="pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
                  <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">Priority Alerts</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/alerts')}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>View All ({urgentAlertsCount + moderateAlertsCount})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Clinical risk items requiring physician review</p>

              {/* Severity Filter Tabs */}
              <div className="flex items-center gap-1 mt-3 bg-slate-100 p-1 rounded-xl w-full overflow-x-auto scroll-x-safe">
                {[
                  { id: 'ALL', label: 'All (4)' },
                  { id: 'CRITICAL', label: 'Critical' },
                  { id: 'URGENT', label: 'Urgent' },
                  { id: 'MODERATE', label: 'Moderate' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAlertSeverityFilter(f.id)}
                    className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      alertSeverityFilter === f.id
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert Cards Feed */}
            <div className="py-3.5 space-y-2.5 flex-1 overflow-y-auto max-h-[360px] pr-0.5">
              {filteredPriorityItems.map((item) => {
                const isCritical = item.severity === 'Critical';
                const isUrgent = item.severity === 'Urgent';

                return (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    key={item.id}
                    onClick={() => navigate('/alerts')}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isCritical
                        ? 'bg-red-50/50 border-red-200 hover:border-red-300'
                        : isUrgent
                        ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isCritical ? 'bg-red-600 animate-pulse' : isUrgent ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <span className="text-xs font-bold text-slate-900 truncate">{item.patient}</span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{item.token}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.time}</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 mt-1.5 line-clamp-2 pl-4">
                      {item.risk}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-500 font-medium">{item.vitals}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-teal-700">
                        {item.confidence} AI Match
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Safety Guarantee Footer */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-600 shrink-0">
              <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="text-[11px] leading-tight font-medium">
                AI flags triage risk. Final assessment is physician-verified.
              </span>
            </div>

          </div>
        </div>

      </div>


      {/* =====================================================================
          4. RECENT PATIENT INTAKES (DESKTOP TABLE + MOBILE CARDS VIEW)
          ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden text-left w-full">
        
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Patient Intakes</h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold text-[10px] border border-teal-200">
                  {filteredEncounters.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Live clinical intake stream from MediKiosks • OPD Room 04</p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/encounters')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>View All Encounters</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Filter Toolbar & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-full sm:max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, ID, or complaint..."
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scroll-x-safe pb-0.5">
              {[
                { id: 'ALL', label: 'All Intakes' },
                { id: 'CRITICAL', label: 'Critical' },
                { id: 'URGENT', label: 'Urgent' },
                { id: 'ATTENTION', label: 'Attention' },
                { id: 'ROUTINE', label: 'Routine' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    setActiveFilter(pill.id);
                    setActiveMetricCard(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    activeFilter === pill.id && !activeMetricCard
                      ? 'bg-[#1E56A0] text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}

              {(activeMetricCard || searchQuery || activeFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('ALL');
                    setActiveMetricCard(null);
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <X className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ── MOBILE CARDS VIEW (VISIBLE ON MOBILE SCREENS < MD) ── */}
        <div className="block md:hidden divide-y divide-slate-100 bg-white p-3 space-y-3">
          {filteredEncounters.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No matching patient intake records found.
            </div>
          ) : (
            filteredEncounters.map((row) => {
              const isCritical = row.urgency === 'Critical';
              const isUrgent = row.urgency === 'Urgent';
              const isModerate = row.urgency === 'Moderate';

              return (
                <div
                  key={row.id}
                  onClick={() => setSelectedEncounter(row)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 space-y-3 cursor-pointer shadow-2xs"
                >
                  {/* Row Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                        isCritical ? 'bg-red-100 text-red-700' : isUrgent ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {row.patientName ? row.patientName.charAt(0) : 'P'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{row.patientName}</p>
                        <p className="text-xs text-slate-500">{row.age}y • {row.gender} • <span className="font-mono text-slate-600">{row.patientId}</span></p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                      isCritical
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : isUrgent
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : isModerate
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-600 animate-pulse' : isUrgent ? 'bg-amber-600' : 'bg-emerald-500'}`} />
                      {row.urgency}
                    </span>
                  </div>

                  {/* Complaint & Time */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Reported Concern</span>
                      <span>{row.time}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">"{row.complaint}"</p>
                    <p className="text-xs text-slate-500 line-clamp-2 pt-1 border-t border-slate-100">{row.aiSummary}</p>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {row.status}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEncounter(row);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Review Triage</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* ── DESKTOP TABLE VIEW (VISIBLE ON MD SCREENS AND LARGER) ── */}
        <div className="hidden md:block w-full overflow-x-auto">
          <div className="min-w-[980px]">
            
            {/* Header Row */}
            <div className={`grid ${TABLE_GRID_COLS} items-center px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider`}>
              <div>Patient</div>
              <div>ID</div>
              <div>Arrival</div>
              <div>Chief Concern</div>
              <div>Priority</div>
              <div>AI Clinical Draft</div>
              <div>Status</div>
              <div className="text-right">Action</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100 bg-white">
              {filteredEncounters.length === 0 ? (
                <div className="px-6 py-12 text-center text-xs text-slate-400 font-medium">
                  No matching patient intake records found.
                </div>
              ) : (
                filteredEncounters.map((row) => {
                  const isCritical = row.urgency === 'Critical';
                  const isUrgent = row.urgency === 'Urgent';
                  const isModerate = row.urgency === 'Moderate';

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={row.id}
                      onClick={() => setSelectedEncounter(row)}
                      className={`grid ${TABLE_GRID_COLS} items-center px-6 py-3.5 hover:bg-slate-50/80 transition-colors text-xs text-slate-700 cursor-pointer ${
                        isCritical ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* Patient Info */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                          isCritical
                            ? 'bg-red-100 text-red-700'
                            : isUrgent
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {row.patientName ? row.patientName.charAt(0) : 'P'}
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="font-bold text-slate-900 leading-tight truncate">{row.patientName}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.age}y • {row.gender}</p>
                        </div>
                      </div>

                      {/* Patient ID */}
                      <div className="font-mono text-xs text-slate-600 font-semibold">
                        {row.patientId}
                      </div>

                      {/* Arrival Time */}
                      <div className="flex items-center gap-1 font-mono text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{row.time}</span>
                      </div>

                      {/* Chief Concern */}
                      <div className="font-medium text-slate-800 pr-3 truncate">
                        {row.complaint}
                      </div>

                      {/* Urgency Badge */}
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isCritical
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : isUrgent
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : isModerate
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isCritical ? 'bg-red-600 animate-pulse' : isUrgent ? 'bg-amber-600' : 'bg-emerald-500'
                          }`} />
                          {row.urgency}
                        </span>
                      </div>

                      {/* AI Summary */}
                      <div className="text-xs text-slate-500 truncate pr-4">
                        {row.aiSummary}
                      </div>

                      {/* Status */}
                      <div>
                        <span className="inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {row.status}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="text-right">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEncounter(row);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Review</span>
                        </motion.button>
                      </div>

                    </motion.div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>


      {/* =====================================================================
          5. FOOTER COMPLIANCE BAR
          ===================================================================== */}
      <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shadow-sm text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="font-semibold text-slate-700 text-xs">
            AI-generated draft — physician review and verification required before clinical order entry.
          </span>
        </div>
        <span className="font-mono text-xs text-slate-400 font-medium shrink-0">
          MediKiosk Clinical Core v2.4 • ABDM &amp; FHIR R4 Compliant
        </span>
      </div>


      {/* =====================================================================
          6. LIGHT CLINICAL SUMMARY REVIEW MODAL (MOBILE RESPONSIVE DRAWER)
          ===================================================================== */}
      <AnimatePresence>
        {selectedEncounter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] m-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Light Modal Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 bg-slate-50 shrink-0">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      Clinical Summary — {selectedEncounter.patientName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono text-[10px] border border-teal-200 font-bold shrink-0">
                      {selectedEncounter.kioskId || 'Kiosk 04'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Encounter ID: {selectedEncounter.id} • Arrival: {selectedEncounter.time}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEncounter(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Sub-tabs */}
              <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 bg-slate-100/70 border-b border-slate-200 shrink-0 text-xs font-semibold overflow-x-auto scroll-x-safe">
                {[
                  { id: 'SUMMARY', label: 'AI Clinical Summary' },
                  { id: 'VITALS', label: 'Recorded Vitals & OCR' },
                  { id: 'RECOMMENDATIONS', label: 'Clinical Recommendations' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setModalTab(t.id)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      modalTab === t.id
                        ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-left font-sans">
                
                {/* Demographic Strip */}
                <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{selectedEncounter.patientName}</span>
                    <span className="text-slate-500 ml-2 font-medium">
                      ({selectedEncounter.age}y, {selectedEncounter.gender}) • ID: {selectedEncounter.patientId}
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded-full ${
                    selectedEncounter.urgency === 'Critical' || selectedEncounter.urgency === 'Urgent'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      selectedEncounter.urgency === 'Critical' || selectedEncounter.urgency === 'Urgent'
                        ? 'bg-red-600 animate-pulse'
                        : 'bg-emerald-500'
                    }`} />
                    Triage: {selectedEncounter.urgency}
                  </span>
                </div>

                {modalTab === 'SUMMARY' && (
                  <>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Patient Reported Chief Concern
                      </p>
                      <p className="text-xs font-semibold text-slate-900 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200">
                        "{selectedEncounter.complaint}"
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Structured Clinical AI Summary Draft
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopySummary(selectedEncounter.aiSummary)}
                          className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                        </button>
                      </div>

                      {/* Clean Light Clinical Card */}
                      <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs leading-relaxed space-y-3 shadow-inner">
                        <p className="font-medium">{selectedEncounter.aiSummary}</p>
                        <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1 text-[11px] text-teal-700 font-mono font-bold">
                          <span>AI Confidence: 96% Match</span>
                          <span>FHIR R4 DocumentReference Ready</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {modalTab === 'VITALS' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Self-Kiosk Telemetry Vitals
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Blood Pressure</p>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">154/96 mmHg</p>
                        <span className="text-[9px] font-bold text-red-600">Elevated</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">SpO2 Oxygen</p>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">94%</p>
                        <span className="text-[9px] font-bold text-amber-600">Borderline Low</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Heart Rate</p>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">102 bpm</p>
                        <span className="text-[9px] font-bold text-slate-500">Regular Pulse</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Body Temp</p>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">101.4 °F</p>
                        <span className="text-[9px] font-bold text-amber-600">Fever Present</span>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'RECOMMENDATIONS' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      AI Triage Recommended Next Steps
                    </p>
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-semibold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Order 12-lead ECG &amp; Troponin I stat evaluation.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-semibold flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Verify patient allergy history before prescribing beta-lactam antibiotics.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Safety Disclaimer */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>AI-generated draft for clinical review. All orders and diagnoses must be confirmed by physician.</span>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedEncounter(null)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer text-center"
                >
                  Close
                </button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => {
                    const patId = selectedEncounter.patientId || 'PAT-10928';
                    setSelectedEncounter(null);
                    navigate(`/patients/${patId}`);
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-[#1E56A0] hover:bg-[#16427D] rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <FileCheck className="w-4 h-4 text-teal-300" />
                  <span>{t('dash_btn_open_profile', 'Open Full Patient Profile')}</span>
                </motion.button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
