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
import { KioskIdentityPage } from '../pages/kiosk/KioskIdentityPage';
import { KioskConfirmationPage } from '../pages/kiosk/KioskConfirmationPage';
import { KioskSessionPage } from '../pages/kiosk/KioskSessionPage';
import { KioskLanguagePage } from '../pages/kiosk/KioskLanguagePage';
import { KioskAccessibilityPage } from '../pages/kiosk/KioskAccessibilityPage';
import { KioskConsentPage } from '../pages/kiosk/KioskConsentPage';
import { KioskHistoryPage } from '../pages/kiosk/KioskHistoryPage';
import { KioskHistoryReviewPage } from '../pages/kiosk/KioskHistoryReviewPage';
import { KioskAiConversationPage } from '../pages/kiosk/KioskAiConversationPage';
import { KioskSafetyPage } from '../pages/kiosk/KioskSafetyPage';
import { KioskDocumentPage } from '../pages/kiosk/KioskDocumentPage';

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
      <Route path="/kiosk/identity" element={<KioskIdentityPage />} />
      <Route path="/kiosk/confirmation" element={<KioskConfirmationPage />} />
      <Route path="/kiosk/session" element={<KioskSessionPage />} />
      <Route path="/kiosk/language" element={<KioskLanguagePage />} />
      <Route path="/kiosk/accessibility" element={<KioskAccessibilityPage />} />
      <Route path="/kiosk/consent" element={<KioskConsentPage />} />
      <Route path="/kiosk/history" element={<KioskHistoryPage />} />
      <Route path="/kiosk/history/ai-guidance" element={<KioskAiConversationPage />} />
      <Route path="/kiosk/history/safety" element={<KioskSafetyPage />} />
      <Route path="/kiosk/history/documents" element={<KioskDocumentPage />} />
      <Route path="/kiosk/history/review" element={<KioskHistoryReviewPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

