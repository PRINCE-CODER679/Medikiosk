import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ChevronRight, ShieldAlert, AlertTriangle, ArrowRight, Activity, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function RedFlagMonitor({ alerts = [] }) {
  const navigate = useNavigate();
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const urgentCount = alerts.filter(a => a.severity === 'Critical' || a.severity === 'Urgent').length || 3;
  const moderateCount = alerts.filter(a => a.severity === 'Moderate').length || 2;

  const priorityItems = [
    {
      id: 'ALT-101',
      patient: 'Suresh Gupta',
      token: 'Token #B-104',
      risk: 'Substernal chest tightness & SpO2 94% (Hypoxia Risk)',
      severity: 'Critical',
      time: '10 mins ago',
      confidence: '98%'
    },
    {
      id: 'ALT-102',
      patient: 'Ramesh Kumar',
      token: 'Token #A-088',
      risk: 'Fever 101.4°F + Documented Anaphylactic Penicillin Allergy',
      severity: 'Urgent',
      time: '25 mins ago',
      confidence: '96%'
    },
    {
      id: 'ALT-103',
      patient: 'Priya Sharma',
      token: 'Token #C-112',
      risk: 'Acute RLQ Abdominal Tenderness & Tachycardia',
      severity: 'Urgent',
      time: '42 mins ago',
      confidence: '94%'
    },
    {
      id: 'ALT-104',
      patient: 'Amit Patil',
      token: 'Token #B-095',
      risk: 'Fasting glucose 142 mg/dL & HbA1c 9.2% (Endocrine Triage)',
      severity: 'Moderate',
      time: '1 hr ago',
      confidence: '92%'
    }
  ];

  const filteredItems = priorityItems.filter(item => {
    if (filterSeverity === 'CRITICAL') return item.severity === 'Critical';
    if (filterSeverity === 'URGENT') return item.severity === 'Critical' || item.severity === 'Urgent';
    if (filterSeverity === 'MODERATE') return item.severity === 'Moderate';
    return true;
  });

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <span>Priority Alerts</span>
        </div>
      }
      subtitle="Clinical risk items requiring physician review"
      action={
        <button
          type="button"
          onClick={() => navigate('/alerts')}
          className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
        >
          <span>View All ({urgentCount + moderateCount})</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      }
      className="h-full flex flex-col justify-between"
    >
      <div className="flex-1 flex flex-col justify-between space-y-4 text-left font-sans">
        
        {/* Severity Summary Tiers */}
        <div className="grid grid-cols-2 gap-3.5 shrink-0">
          <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200/90 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Urgent &amp; Critical</span>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">{urgentCount}</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse shrink-0" />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Attention Needed</span>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">{moderateCount}</p>
            </div>
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          </div>
        </div>

        {/* Severity filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'URGENT', label: 'Urgent' },
            { id: 'MODERATE', label: 'Moderate' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterSeverity(f.id)}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                filterSeverity === f.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Clinical Alert List */}
        <div className="space-y-2.5 flex-1 flex flex-col justify-between overflow-y-auto max-h-[320px] pr-0.5">
          {filteredItems.map((item) => {
            const isCritical = item.severity === 'Critical';
            const isUrgent = item.severity === 'Urgent';

            return (
              <motion.div
                whileHover={{ scale: 1.01 }}
                key={item.id}
                onClick={() => navigate('/alerts')}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left shadow-2xs ${
                  isCritical
                    ? 'bg-red-50/40 border-red-200 hover:border-red-300'
                    : isUrgent
                    ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isCritical ? 'bg-red-600 animate-pulse' : isUrgent ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span className="text-xs font-bold text-slate-900 truncate">{item.patient}</span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.token}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 line-clamp-1 font-medium pl-4">
                  {item.risk}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Clinical Safety Disclosure */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600 shrink-0">
          <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="text-[11px] leading-snug">
            AI flags &amp; escalates triage risk. Final assessment is physician-verified.
          </span>
        </div>

      </div>
    </Card>
  );
}
