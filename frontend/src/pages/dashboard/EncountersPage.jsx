import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { RecentEncountersTable } from '../../components/dashboard/RecentEncountersTable';
import { Stethoscope, Filter } from 'lucide-react';
import { ApiService } from '../../services/api';

export function EncountersPage() {
  const [encounters, setEncounters] = useState([]);

  useEffect(() => {
    ApiService.getEncounters().then((data) => setEncounters(data));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-[#1E56A0]" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Encounters</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            Live Stream of Patient Self-Intakes, Vitals Checks, and Clinical Summaries
          </p>
        </div>
      </div>

      <RecentEncountersTable encounters={encounters} />
    </DashboardLayout>
  );
}
