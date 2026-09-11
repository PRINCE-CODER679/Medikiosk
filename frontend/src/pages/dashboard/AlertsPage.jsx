import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, AlertOctagon, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    ApiService.getAlerts().then((data) => setAlerts(data));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Red Flag Triage Center</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            AI Automated Safety Risk Classification &amp; Doctor Escalation Feed
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alt) => {
          const isCritical = alt.severity === 'Critical' || alt.severity === 'Urgent';

          return (
            <Card
              key={alt.id}
              className={`border-l-4 ${isCritical ? 'border-l-red-600 bg-red-50/20' : 'border-l-amber-500 bg-amber-50/20'}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={isCritical ? 'critical' : 'warning'} size="sm">
                      {alt.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-mono text-slate-400">{alt.timestamp}</span>
                    <span className="text-xs font-semibold text-slate-700">• {alt.patientName} ({alt.patientId})</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{alt.title}</h3>
                  <p className="text-xs text-slate-600 font-medium">{alt.description}</p>

                  <div className="pt-2 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-blue-600" />
                    <span>Recommended Action: {alt.recommendedAction}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/patients/${alt.patientId}`)}
                  >
                    Open Patient Record
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
