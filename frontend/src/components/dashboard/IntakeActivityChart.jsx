import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Clock, Brain } from 'lucide-react';

export function IntakeActivityChart({ data = [] }) {
  const [activeTab, setActiveTab] = useState('INTAKES');

  const chartData = data.length > 0 ? data : [
    { hour: '08:00 AM', intakes: 12, redFlags: 0, queue: 4 },
    { hour: '09:00 AM', intakes: 24, redFlags: 1, queue: 8 },
    { hour: '10:00 AM', intakes: 38, redFlags: 3, queue: 14 },
    { hour: '11:00 AM', intakes: 29, redFlags: 2, queue: 11 },
    { hour: '12:00 PM', intakes: 15, redFlags: 0, queue: 5 },
    { hour: '01:00 PM', intakes: 22, redFlags: 1, queue: 7 },
    { hour: '02:00 PM', intakes: 31, redFlags: 1, queue: 10 }
  ];

  return (
    <Card
      title="Patient Intake Activity & Triage Trends"
      subtitle="Real-time hourly self-intake volume vs AI priority escalations"
      action={
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {[
            { id: 'INTAKES', label: 'Volume' },
            { id: 'FLAGS', label: 'Priority Flags' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === t.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
      className="h-full flex flex-col justify-between"
    >
      <div className="flex-1 w-full pt-2 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIntakesMod" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E56A0" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1E56A0" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorFlagsMod" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: 'none',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                padding: '10px 14px'
              }}
              itemStyle={{ color: '#F8FAFC' }}
            />
            {activeTab === 'INTAKES' ? (
              <Area
                type="monotone"
                dataKey="intakes"
                stroke="#1E56A0"
                strokeWidth={2.5}
                fill="url(#colorIntakesMod)"
                name="Patient Intakes"
              />
            ) : (
              <Area
                type="monotone"
                dataKey="redFlags"
                stroke="#DC2626"
                strokeWidth={2.5}
                fill="url(#colorFlagsMod)"
                name="Priority Flags"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Operational Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5 pt-4 border-t border-slate-100 text-left shrink-0">
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
          <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Peak Volume</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">10:00 AM (38 Intakes)</p>
          </div>
        </div>
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-teal-600 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Intake Time</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">4.2 mins / Patient</p>
          </div>
        </div>
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
          <Brain className="w-4 h-4 text-purple-600 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Escalation Rate</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">6.3% Flag Velocity</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
