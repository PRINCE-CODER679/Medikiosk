import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link, RefreshCw, Building2, CheckCircle2, ShieldCheck, Database, Play, Check } from 'lucide-react';

export function IntegrationsPage() {
  const [syncStep, setSyncStep] = useState(5); // 1..5
  const [syncing, setSyncing] = useState(false);

  const startSyncSimulation = () => {
    setSyncing(true);
    setSyncStep(1);
    setTimeout(() => setSyncStep(2), 800);
    setTimeout(() => setSyncStep(3), 1600);
    setTimeout(() => setSyncStep(4), 2400);
    setTimeout(() => {
      setSyncStep(5);
      setSyncing(false);
    }, 3200);
  };

  const steps = [
    { label: 'MediKiosk Intake', key: 1 },
    { label: 'Consent Verified', key: 2 },
    { label: 'FHIR Resource Prepared', key: 3 },
    { label: 'ABDM Synchronized', key: 4 },
    { label: 'HIS / EMR Updated', key: 5 }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link className="w-6 h-6 text-[#1E56A0]" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">ABDM &amp; FHIR Integration Suite</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            Interoperability Architecture &amp; Ecosystem Gateway Status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="lg">SIMULATED PROTOTYPE INTEGRATION</Badge>
        </div>
      </div>

      {/* Animated Pipeline Stepper Card */}
      <Card
        title="Real-Time Synchronization Pipeline Simulation"
        subtitle="Test simulated FHIR R4 resource transformation & ABDM health repository push"
        action={
          <Button variant="primary" size="sm" onClick={startSyncSimulation} disabled={syncing}>
            <Play className={`w-3.5 h-3.5 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronizing...' : 'Run Pipeline Sync Test'}
          </Button>
        }
      >
        <div className="py-6 px-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />

            {steps.map((st) => {
              const isDone = syncStep >= st.key;
              const isCurrent = syncStep === st.key && syncing;

              return (
                <div key={st.key} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 scale-110 animate-pulse'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isDone ? <Check className="w-5 h-5" /> : st.key}
                  </div>
                  <span
                    className={`text-[11px] font-extrabold tracking-wider ${
                      isDone ? 'text-emerald-400' : isCurrent ? 'text-blue-300' : 'text-slate-500'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-teal-300 flex items-center justify-between">
            <span>Status: {syncing ? 'Transmitting JSON-FHIR Bundle...' : '100% Synchronized with ABDM Sandbox'}</span>
            <span className="text-slate-500">Latency: 24ms</span>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
