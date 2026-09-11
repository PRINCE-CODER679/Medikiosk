import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui/Card';
import { Clock, ChevronDown, ChevronUp, FileText, Calendar, Activity, Pill, Microscope, Stethoscope } from 'lucide-react';

export function TimelinePage() {
  const [expandedId, setExpandedId] = useState(0);

  const timelineEvents = [
    {
      id: 0,
      date: '28 AUG 2026',
      title: 'Current Kiosk Intake Encounter',
      badge: 'Active Encounter',
      color: 'bg-[#2563EB]',
      diagnosis: 'Acute Febrile Illness + Frontal Headache',
      medication: 'Paracetamol 650mg, Oral Rehydration',
      investigation: 'Complete Blood Count (CBC), Typhoid Serology Order',
      document: 'Self-Intake Transcript & Vitals Log #880',
      notes: 'Patient presented at Kiosk 01 with 3-day fever history. Critical flag for Penicillin allergy.'
    },
    {
      id: 1,
      date: '12 APR 2026',
      title: 'Hospital Discharge Summary',
      badge: 'Inpatient Stay',
      color: 'bg-[#0D9488]',
      diagnosis: 'Acute Bronchospasm & Respiratory Distress',
      medication: 'Salbutamol Nebulization, Budesonide Inhaler',
      investigation: 'Chest X-Ray, Arterial Blood Gas (ABG)',
      document: 'Discharge Summary PDF #DIS-2026-904',
      notes: 'Admitted for 48h observation. Discharged with respiratory inhaler protocol.'
    },
    {
      id: 2,
      date: '05 JAN 2026',
      title: 'Hypertension Follow-Up Visit',
      badge: 'Outpatient OPD',
      color: 'bg-slate-700',
      diagnosis: 'Essential Hypertension (Stage 1)',
      medication: 'Amlodipine 5mg once daily',
      investigation: 'Serum Electrolytes, Renal Function Test (RFT)',
      document: 'Prescription Note #OPD-1029',
      notes: 'Blood pressure recorded 138/88 mmHg. Advised low-sodium dietary protocol.'
    },
    {
      id: 3,
      date: '10 NOV 2025',
      title: 'Routine Comprehensive Lab Panel',
      badge: 'Lab Investigation',
      color: 'bg-emerald-600',
      diagnosis: 'Routine Health Check',
      medication: 'Multivitamin Supplements',
      investigation: 'Lipid Profile, Fasting Blood Sugar, LFT',
      document: 'Metropolis Lab Report #LAB-5819',
      notes: 'Serum Creatinine 0.9 mg/dL. Fasting glucose 108 mg/dL.'
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#1E56A0]" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Longitudinal Medical Timeline</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            Expandable chronological history of patient encounters, diagnoses, medications, and scanned documents
          </p>
        </div>
      </div>

      <Card title="Interactive Clinical Timeline">
        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-4">
          {timelineEvents.map((ev) => {
            const isExpanded = expandedId === ev.id;

            return (
              <div key={ev.id} className="relative">
                {/* Node dot */}
                <span className={`absolute -left-[31px] top-4 w-4 h-4 rounded-full ${ev.color} ring-4 ring-white shadow-sm`} />

                {/* Event Card Container */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                  className="bg-slate-50 hover:bg-slate-100/80 p-5 rounded-2xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs group"
                >
                  {/* Collapsed Header */}
                  <div className="flex items-start sm:items-center justify-between gap-3 text-left">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-xs font-mono font-extrabold text-slate-500">{ev.date}</span>
                      <Badge variant="primary" size="sm">{ev.badge}</Badge>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#1E56A0] transition-colors">
                        {ev.title}
                      </h4>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-500 shrink-0 mt-0.5 sm:mt-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-700" />
                    )}
                  </div>

                  {/* Expandable Accordion Body */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Stethoscope className="w-4 h-4 text-[#1E56A0]" />
                            <span>Diagnosis:</span>
                          </div>
                          <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                            {ev.diagnosis}
                          </p>

                          <div className="flex items-center gap-2 text-slate-900 font-bold pt-1">
                            <Pill className="w-4 h-4 text-[#0D9488]" />
                            <span>Prescribed Medication:</span>
                          </div>
                          <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                            {ev.medication}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Microscope className="w-4 h-4 text-emerald-600" />
                            <span>Investigations &amp; Labs:</span>
                          </div>
                          <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                            {ev.investigation}
                          </p>

                          <div className="flex items-center gap-2 text-slate-900 font-bold pt-1">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span>Scanned Document / Notes:</span>
                          </div>
                          <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                            {ev.notes}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </DashboardLayout>
  );
}
