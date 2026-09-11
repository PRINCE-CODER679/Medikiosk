/**
 * MediKiosk Centralized API Service Layer
 * For Phase 1, fetches live API health from FastAPI backend at http://localhost:8000/api/health
 * and serves structured mock data for clinical intake dashboards and patient kiosk interfaces.
 */

import { MOCK_PATIENTS } from '../mock/patients';
import { MOCK_ENCOUNTERS } from '../mock/encounters';
import { MOCK_ALERTS } from '../mock/alerts';
import { MOCK_DASHBOARD_STATS } from '../mock/dashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ApiService = {
  /**
   * Check FastAPI Backend Health Endpoint
   * GET /api/health -> {"status": "ok", "service": "MediKiosk API"}
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('Backend API Health Check warning:', error.message);
      return {
        ok: false,
        error: error.message,
        fallbackData: { status: 'offline', service: 'MediKiosk API (Offline Fallback)' }
      };
    }
  },

  /**
   * Get Dashboard Metrics (Phase 1 Mock Data Layer)
   */
  async getDashboardStats() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_DASHBOARD_STATS), 100);
    });
  },

  /**
   * Get Patient Directory
   */
  async getPatients() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_PATIENTS), 100);
    });
  },

  /**
   * Get Single Patient Details
   */
  async getPatientById(id) {
    return new Promise((resolve) => {
      const patient = MOCK_PATIENTS.find((p) => p.id === id) || MOCK_PATIENTS[0];
      setTimeout(() => resolve(patient), 100);
    });
  },

  /**
   * Get Encounters List
   */
  async getEncounters() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ENCOUNTERS), 100);
    });
  },

  /**
   * Get Red Flag Alerts
   */
  async getAlerts() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ALERTS), 100);
    });
  },

  /**
   * Phase 2: Identify Patient via ABHA or Aadhaar Mock Endpoint
   * POST /api/patients/identify
   */
  async identifyPatient({ method, identifier }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, identifier })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Identity verification failed.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API identifyPatient fallback activated:', error.message);
      // Offline fallback simulation
      const mockId = `PAT-${Math.floor(10000 + Math.random() * 90000)}`;
      const isAbha = method === 'ABHA';
      return {
        ok: true,
        data: {
          id: mockId,
          name: isAbha ? 'Devendra Sharma (Demo)' : 'Priya Patel (Demo)',
          age: isAbha ? 52 : 38,
          gender: isAbha ? 'Male' : 'Female',
          phone: '+91 98123 45678',
          abhaId: isAbha ? identifier : `99-${Math.floor(1000 + Math.random() * 9000)}-1029-4829`,
          verificationStatus: isAbha ? 'Prototype Sandbox Verified' : 'Aadhaar Sandbox Verified',
          identityMethod: method,
          createdAt: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Phase 2: Register New Patient Endpoint
   * POST /api/patients/register
   */
  async registerPatient({ name, age, gender, phone }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age: Number(age), gender, phone })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Patient registration failed.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API registerPatient fallback activated:', error.message);
      // Offline fallback simulation
      const mockId = `PAT-${Math.floor(10000 + Math.random() * 90000)}`;
      return {
        ok: true,
        data: {
          id: mockId,
          name,
          age: Number(age),
          gender,
          phone: phone || '+91 90000 00000',
          abhaId: null,
          verificationStatus: 'Self Registered (New Patient)',
          identityMethod: 'NEW_PATIENT',
          createdAt: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Phase 2: Create Clinical Encounter Endpoint
   * POST /api/encounters
   */
  async createEncounter({ patientId, source = 'MediKiosk' }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/encounters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, source })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Encounter creation failed.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API createEncounter fallback activated:', error.message);
      const year = new Date().getFullYear();
      const mockEncId = `ENC-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
      return {
        ok: true,
        data: {
          id: mockEncId,
          patientId,
          createdAt: new Date().toISOString(),
          status: 'In-Progress',
          source,
          workflowStatus: 'IDENTITY_VERIFIED'
        }
      };
    }
  },

  /**
   * Phase 2: Create Kiosk Session Endpoint
   * POST /api/sessions
   */
  async createSession({ patientId, encounterId, currentStep = 'IDENTITY' }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, encounterId, currentStep })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Session creation failed.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API createSession fallback activated:', error.message);
      const mockSessionId = `SES-${Math.floor(10000 + Math.random() * 90000)}`;
      return {
        ok: true,
        data: {
          sessionId: mockSessionId,
          patientId,
          encounterId,
          createdTimestamp: new Date().toISOString(),
          lastActivityTimestamp: new Date().toISOString(),
          currentWorkflowStep: currentStep,
          status: 'ACTIVE'
        }
      };
    }
  }
};
