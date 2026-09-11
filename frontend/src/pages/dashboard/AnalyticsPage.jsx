import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui/Card';
import { BarChart3, TrendingUp, Users, Brain, Clock, ShieldCheck } from 'lucide-react';

export function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#1E56A0]" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Intake Analytics</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            AI Intake Efficiency Metrics &amp; Hospital Triage Velocity Insights
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Average Intake Duration">
          <div className="text-center py-4">
            <h2 className="text-4xl font-extrabold text-[#1E56A0]">4.2 mins</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Down from 18.5 mins manual intake</p>
          </div>
        </Card>
        <Card title="AI Summary Accuracy">
          <div className="text-center py-4">
            <h2 className="text-4xl font-extrabold text-emerald-600">94.8%</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Doctor agreement &amp; approval rate</p>
          </div>
        </Card>
        <Card title="Red Flag Early Detection">
          <div className="text-center py-4">
            <h2 className="text-4xl font-extrabold text-teal-700">100%</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Zero missed critical symptom flags</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
