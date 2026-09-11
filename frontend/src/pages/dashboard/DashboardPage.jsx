import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DashboardMain } from '../../components/dashboard/DashboardMain';
import { ApiService } from '../../services/api';

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    Promise.all([
      ApiService.getDashboardStats(),
      ApiService.getEncounters(),
      ApiService.getAlerts()
    ]).then(([statsRes, encRes, alertRes]) => {
      setStats(statsRes);
      setEncounters(encRes);
      setAlerts(alertRes);
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
    }, 400);
  };

  return (
    <DashboardLayout>
      <DashboardMain
        stats={stats}
        encounters={encounters}
        alerts={alerts}
        refreshing={refreshing}
        onSync={handleSync}
      />
    </DashboardLayout>
  );
}
