import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PatientsPage } from '../pages/dashboard/PatientsPage';
import { PatientDetailPage } from '../pages/dashboard/PatientDetailPage';
import { EncountersPage } from '../pages/dashboard/EncountersPage';
import { DocumentsPage } from '../pages/dashboard/DocumentsPage';
import { TimelinePage } from '../pages/dashboard/TimelinePage';
import { AlertsPage } from '../pages/dashboard/AlertsPage';
import { AnalyticsPage } from '../pages/dashboard/AnalyticsPage';
import { IntegrationsPage } from '../pages/dashboard/IntegrationsPage';
import { SettingsPage } from '../pages/dashboard/SettingsPage';
import { KioskWelcomePage } from '../pages/kiosk/KioskWelcomePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/patients/:id" element={<PatientDetailPage />} />
      <Route path="/encounters" element={<EncountersPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/timeline" element={<TimelinePage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/integrations" element={<IntegrationsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/kiosk" element={<KioskWelcomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
