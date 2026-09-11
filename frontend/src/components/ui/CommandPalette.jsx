import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Stethoscope, FileText, AlertTriangle, Clock, ArrowRight, X, Command } from 'lucide-react';
import { MOCK_PATIENTS } from '../../mock/patients';
import { MOCK_ENCOUNTERS } from '../../mock/encounters';

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { type: 'action', title: 'Open Clinical Dashboard', path: '/dashboard', icon: Command, category: 'Quick Actions' },
    { type: 'action', title: 'View Red Flag Alerts Center', path: '/alerts', icon: AlertTriangle, category: 'Quick Actions' },
    { type: 'action', title: 'Open Medical Timeline', path: '/timeline', icon: Clock, category: 'Quick Actions' },
    { type: 'action', title: 'Launch Patient Kiosk Mode', path: '/kiosk', icon: Stethoscope, category: 'Quick Actions' }
  ];

  const filteredPatients = MOCK_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.id.toLowerCase().includes(query.toLowerCase()) ||
    p.abhaId.includes(query)
  ).map(p => ({
    type: 'patient',
    title: `${p.name} (${p.id})`,
    subtitle: `ABHA: ${p.abhaId} • ${p.complaint}`,
    path: `/patients/${p.id}`,
    icon: Users,
    category: 'Patients'
  }));

  const filteredEncounters = MOCK_ENCOUNTERS.filter(e =>
    e.patientName.toLowerCase().includes(query.toLowerCase()) ||
    e.id.toLowerCase().includes(query.toLowerCase())
  ).map(e => ({
    type: 'encounter',
    title: `${e.id} — ${e.patientName}`,
    subtitle: e.complaint,
    path: `/patients/${e.patientId}`,
    icon: Stethoscope,
    category: 'Encounters'
  }));

  const allItems = [...quickActions, ...filteredPatients, ...filteredEncounters];

  const handleSelect = (item) => {
    onClose();
    navigate(item.path);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-20 px-3 sm:px-4 bg-slate-950/60 backdrop-blur-xs select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Command Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Search Header */}
          <div className="flex items-center px-5 py-4 border-b border-slate-100">
            <Search className="w-5 h-5 text-[#1E56A0] mr-3 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search patients, encounters, documents, or quick actions..."
              className="w-full text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-4">
            {allItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No matching patients, encounters, or actions found for "{query}".
              </div>
            ) : (
              ['Quick Actions', 'Patients', 'Encounters'].map((category) => {
                const categoryItems = allItems.filter(i => i.category === category);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className="space-y-1">
                    <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {category}
                    </p>
                    {categoryItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelect(item)}
                        className="flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all hover:bg-blue-50/80 hover:border-blue-200 border border-transparent group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-[#1E56A0] text-slate-600 group-hover:text-white transition-colors">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-[#1E56A0] transition-colors">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1E56A0] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts Info */}
          <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-2 sm:gap-3">
              <span>Press <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> to close</span>
              <span className="hidden sm:inline">Use <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono text-[10px]">Ctrl + K</kbd> anywhere</span>
            </div>
            <span className="text-[#1E56A0] font-bold hidden sm:inline">MediKiosk Command Search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
