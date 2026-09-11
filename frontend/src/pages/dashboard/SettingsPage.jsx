import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Settings, ShieldCheck, Lock, Bell, Server } from 'lucide-react';

export function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#1E56A0]" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System &amp; Security Settings</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            MediKiosk Platform Configuration &amp; Security Architecture
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Security & Compliance Architecture">
          <div className="space-y-3 text-xs text-slate-600">
            <p><strong>HIPAA / ABDM Guidelines:</strong> End-to-end data encryption in transit &amp; rest.</p>
            <p><strong>Role-Based Access Control (RBAC):</strong> Kiosk Mode vs. Physician Verification Role.</p>
            <p><strong>Audit Logging:</strong> Full clinical summary edits and approvals tracked.</p>
          </div>
        </Card>

        <Card title="Kiosk Terminal Network">
          <div className="space-y-2 text-xs text-slate-600 font-mono">
            <p>● Kiosk 01 — Main Reception OPD (Active)</p>
            <p>● Kiosk 02 — Emergency Triage Bay (Active)</p>
            <p>● Kiosk 03 — Pediatric Wing (Active)</p>
            <p>● Kiosk 04 — General Medicine (Connected / Active)</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
