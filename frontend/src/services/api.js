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
  }
};
