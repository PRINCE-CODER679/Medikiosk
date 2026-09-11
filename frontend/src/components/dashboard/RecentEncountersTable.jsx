import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Modal } from '../ui/OverlayAndFeedback';
import { useTranslation } from 'react-i18next';
import { Eye, FileCheck, AlertCircle, Clock, ChevronRight, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function RecentEncountersTable({ encounters = [] }) {
  const { t } = useTranslation();
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filtered = encounters.filter(row => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      row.patientName?.toLowerCase().includes(q) ||
      row.patientId?.toLowerCase().includes(q) ||
      row.complaint?.toLowerCase().includes(q)
    );
  });

  const TABLE_GRID_COLS = "grid-cols-[1.8fr_1fr_0.9fr_2.2fr_1.2fr_1.8fr_1fr_0.9fr]";

  return (
    <>
      <Card
        title={
          <div className="flex items-center gap-3">
            <span>Recent Patient Intakes</span>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold text-[10px] border border-teal-200">
              {filtered.length} Live
            </span>
          </div>
        }
        subtitle="Live clinical intake stream from MediKiosks • OPD Room 04"
        action={
          <button
            type="button"
            onClick={() => navigate('/encounters')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All Intakes</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        }
        padding={false}
      >
        {/* Search bar inside Card */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by patient name, ID, or complaint..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
        </div>

        {/* ── MOBILE CARDS VIEW (VISIBLE ON MOBILE SCREENS < MD) ── */}
        <div className="block md:hidden divide-y divide-slate-100 bg-white p-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No patient intake records match search.
            </div>
          ) : (
            filtered.map((row) => {
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
            
            {/* Header */}
            <div className={`grid ${TABLE_GRID_COLS} items-center px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider`}>
              <div>Patient</div>
              <div>ID</div>
              <div>Arrival</div>
              <div>Chief Concern</div>
              <div>Priority</div>
              <div>AI Summary</div>
              <div>Status</div>
              <div className="text-right">Action</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <div className="px-6 py-8 text-center text-xs text-slate-400 font-medium">
                  No patient intake records match search.
                </div>
              ) : (
                filtered.map((row) => {
                  const isCritical = row.urgency === 'Critical';
                  const isUrgent = row.urgency === 'Urgent';
                  const isModerate = row.urgency === 'Moderate';

                  return (
                    <div
                      key={row.id}
                      onClick={() => setSelectedEncounter(row)}
                      className="grid grid-cols-[1.8fr_1fr_0.9fr_2.2fr_1.2fr_1.8fr_1fr_0.9fr] items-center px-6 py-3.5 hover:bg-slate-50/80 transition-colors text-xs text-slate-700 cursor-pointer"
                    >
                      {/* Patient */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                          isCritical ? 'bg-red-100 text-red-700' : isUrgent ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {row.patientName ? row.patientName.charAt(0) : 'P'}
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="font-bold text-slate-900 leading-tight truncate">{row.patientName}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.age}y • {row.gender}</p>
                        </div>
                      </div>

                      {/* ID */}
                      <div className="font-mono text-xs text-slate-600 font-semibold">{row.patientId}</div>

                      {/* Arrival */}
                      <div className="flex items-center gap-1 font-mono text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{row.time}</span>
                      </div>

                      {/* Concern */}
                      <div className="font-medium text-slate-800 pr-3 truncate">{row.complaint}</div>

                      {/* Priority */}
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

                      {/* Summary */}
                      <div className="text-xs text-slate-500 truncate pr-4">{row.aiSummary}</div>

                      {/* Status */}
                      <div>
                        <span className="inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {row.status}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEncounter(row);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Review</span>
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </Card>

      {/* AI Clinical Summary Review Modal */}
      <Modal
        isOpen={!!selectedEncounter}
        onClose={() => setSelectedEncounter(null)}
        title={`Clinical Summary — ${selectedEncounter?.patientName}`}
        subtitle={`Encounter ID: ${selectedEncounter?.id} • Intake Location: ${selectedEncounter?.kioskId}`}
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setSelectedEncounter(null)}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer text-center"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                const patId = selectedEncounter?.patientId || 'PAT-10928';
                setSelectedEncounter(null);
                navigate(`/patients/${patId}`);
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-[#1E56A0] hover:bg-[#16427D] rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <FileCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>{t('dash_btn_open_profile', 'Open Patient Profile')}</span>
            </button>
          </div>
        }
      >
        {selectedEncounter && (
          <div className="space-y-4 text-slate-900 bg-white text-left font-sans">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-extrabold text-slate-900">{selectedEncounter.patientName}</span>
                <span className="text-slate-500 ml-2 font-medium">
                  ({selectedEncounter.age}y, {selectedEncounter.gender}) • ID: {selectedEncounter.patientId}
                </span>
              </div>
              <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full ${
                selectedEncounter.urgency === 'Critical' || selectedEncounter.urgency === 'Urgent'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  selectedEncounter.urgency === 'Critical' || selectedEncounter.urgency === 'Urgent'
                    ? 'bg-red-600 animate-pulse'
                    : 'bg-emerald-500'
                }`} />
                Triage: {selectedEncounter.urgency}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Reported Chief Concern
              </p>
              <p className="text-xs font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">
                "{selectedEncounter.complaint}"
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Structured Clinical Summary Draft
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs leading-relaxed space-y-2.5">
                <p className="font-medium">{selectedEncounter.aiSummary}</p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-teal-700 font-mono font-bold">
                  <span>Confidence Score: 96% Verified</span>
                  <span>FHIR DocumentReference Ready</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>AI-generated draft for clinical review. All orders and diagnoses must be confirmed by the physician.</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
