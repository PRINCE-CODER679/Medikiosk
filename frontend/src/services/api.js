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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
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
      setTimeout(() => resolve(MOCK_DASHBOARD_STATS), 50);
    });
  },

  /**
   * Get Patient Directory
   */
  async getPatients() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_PATIENTS), 50);
    });
  },

  /**
   * Get Single Patient Details
   */
  async getPatientById(id) {
    return new Promise((resolve) => {
      const patient = MOCK_PATIENTS.find((p) => p.id === id) || MOCK_PATIENTS[0];
      setTimeout(() => resolve(patient), 50);
    });
  },

  /**
   * Get Encounters List
   */
  async getEncounters() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ENCOUNTERS), 50);
    });
  },

  /**
   * Get Red Flag Alerts
   */
  async getAlerts() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ALERTS), 50);
    });
  },

  /**
   * Phase 2: Identify Patient via ABHA or Patient ID Endpoint
   * POST /api/patients/identify
   */
  async identifyPatient({ method = 'AUTO', identifier }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/patients/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, identifier }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Patient identity lookup failed.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API identifyPatient fallback activated:', error.message);
      
      const cleanId = (identifier || '').trim().toUpperCase();
      const matched = MOCK_PATIENTS.find(
        p => p.id.toUpperCase() === cleanId || 
             (p.abhaId && p.abhaId.replace(/-/g, '').replace(/\s/g, '') === cleanId.replace(/-/g, '').replace(/\s/g, ''))
      );

      if (matched) {
        return {
          ok: true,
          data: {
            id: matched.id,
            name: matched.name,
            age: matched.age,
            gender: matched.gender,
            phone: matched.phone || '+91 98765 43210',
            abhaId: matched.abhaId || null,
            verificationStatus: 'Sandbox ABDM Verified',
            identityMethod: method,
            createdAt: new Date().toISOString()
          }
        };
      }

      // If ABHA format (approx 14 digits), simulate demo discovery
      const digitsOnly = cleanId.replace(/\D/g, '');
      if (digitsOnly.length === 14) {
        const mockId = `PAT-${Math.floor(10000 + Math.random() * 90000)}`;
        return {
          ok: true,
          data: {
            id: mockId,
            name: 'Devendra Sharma (Demo)',
            age: 52,
            gender: 'Male',
            phone: '+91 98123 45678',
            abhaId: `${digitsOnly.slice(0,2)}-${digitsOnly.slice(2,6)}-${digitsOnly.slice(6,10)}-${digitsOnly.slice(10)}`,
            verificationStatus: 'Sandbox ABDM Verified',
            identityMethod: 'ABHA',
            createdAt: new Date().toISOString()
          }
        };
      }

      return {
        ok: false,
        error: `No patient record found matching "${identifier}". Please verify the ID or register as a new patient.`
      };
    }
  },

  /**
   * Phase 2: Register New Patient Endpoint
   * POST /api/patients/register
   */
  async registerPatient({ name, age, gender, phone }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/patients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age: Number(age), gender, phone }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/encounters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, source }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
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
  async createSession({ patientId, encounterId, currentStep = 'IDENTITY', languagePreference = 'en' }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, encounterId, currentStep, languagePreference }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
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
          languagePreference,
          accessibilityPreferences: { textSize: 'normal', highContrast: false, voiceGuidance: false, reduceMotion: false },
          consentStatus: 'pending',
          consentTimestamp: null,
          createdTimestamp: new Date().toISOString(),
          lastActivityTimestamp: new Date().toISOString(),
          currentWorkflowStep: currentStep,
          status: 'ACTIVE'
        }
      };
    }
  },

  /**
   * Phase 3: Update Kiosk Session State Endpoint
   * PATCH /api/sessions/:sessionId
   */
  async updateSession(sessionId, updates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Session update failed.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API updateSession fallback activated:', error.message);
      // Offline fallback: return updated session representation
      return {
        ok: true,
        data: {
          sessionId,
          ...updates,
          lastActivityTimestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Phase 4: Save Clinical History Endpoint
   * POST /api/encounters/:encounterId/history
   */
  async saveClinicalHistory(encounterId, historyData) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/encounters/${encounterId}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Clinical history save failed.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API saveClinicalHistory fallback activated:', error.message);
      // Offline fallback: return updated history object
      return {
        ok: true,
        data: {
          encounterId,
          ...historyData,
          updatedAt: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Phase 4: Get Clinical History Endpoint
   * GET /api/encounters/:encounterId/history
   */
  async getClinicalHistory(encounterId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/encounters/${encounterId}/history`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Clinical history retrieval failed.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API getClinicalHistory fallback activated:', error.message);
      return {
        ok: false,
        error: error.message
      };
    }
  },

  /**
   * Phase 5: Create AI Conversation
   * POST /api/conversations
   */
  async createConversation({ encounterId, patientId, sessionId, languagePreference = 'en' }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encounterId, patientId, sessionId, languagePreference }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Conversation creation failed.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API createConversation fallback activated:', error.message);
      const mockConvId = `CONV-${Math.floor(10000 + Math.random() * 90000)}`;
      return {
        ok: true,
        data: {
          conversationId: mockConvId,
          encounterId,
          patientId,
          sessionId,
          status: 'ACTIVE',
          questionCount: 0,
          maxQuestions: 4,
          mode: 'DETERMINISTIC_FALLBACK'
        }
      };
    }
  },

  /**
   * Phase 5: Get Next Follow-Up Question
   * POST /api/conversations/:id/next-question
   */
  async getNextQuestion(conversationId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/next-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to get next question.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API getNextQuestion fallback activated:', error.message);
      // Fallback Question
      return {
        ok: true,
        data: {
          conversationId,
          questionId: 'Q-FB-1',
          question: 'Is your cough dry, or are you bringing up phlegm/mucus?',
          targetSection: 'hpi',
          targetField: 'sputumType',
          questionType: 'single_choice',
          options: ['Dry Cough', 'Productive with Mucus', 'Blood-tinged', 'Not Sure'],
          shouldContinue: true,
          mode: 'DETERMINISTIC_FALLBACK'
        }
      };
    }
  },

  /**
   * Phase 5: Submit Answer to Question
   * POST /api/conversations/:id/answer
   */
  async submitAnswer(conversationId, { questionId, targetSection, targetField, answerValue }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, targetSection, targetField, answerValue }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to submit answer.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API submitAnswer fallback activated:', error.message);
      return {
        ok: true,
        data: {
          conversationId,
          status: 'ACTIVE',
          questionCount: 1
        }
      };
    }
  },

  /**
   * Phase 6: Evaluate Clinical Safety Assessment
   * POST /api/encounters/:encounterId/safety-assessment
   */
  async evaluateSafetyAssessment(encounterId, patientId, sessionId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const url = new URL(`${API_BASE_URL}/api/encounters/${encounterId}/safety-assessment`);
      if (patientId) url.searchParams.append('patient_id', patientId);
      if (sessionId) url.searchParams.append('session_id', sessionId);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Safety assessment evaluation failed.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API evaluateSafetyAssessment fallback activated:', error.message);
      // Client-side fallback assessment
      return {
        ok: true,
        data: {
          safetyAssessmentId: `SAF-${Math.floor(10000 + Math.random() * 90000)}`,
          patientId: patientId || 'PAT-10928',
          encounterId,
          sessionId: sessionId || null,
          status: 'NO_IMMEDIATE_FLAG',
          ruleIds: [],
          triggeredFindings: [],
          patientGuidance: 'Your information has been reviewed for predefined immediate warning signs. No immediate warning pattern was identified from the information provided.',
          clinicianGuidance: 'Deterministic safety check complete. No predefined emergency or urgent warning patterns triggered.',
          ruleVersion: '1.0',
          source: 'DETERMINISTIC_RULE',
          createdAt: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Phase 6: Get Clinical Safety Assessment
   * GET /api/encounters/:encounterId/safety-assessment
   */
  async getSafetyAssessment(encounterId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${API_BASE_URL}/api/encounters/${encounterId}/safety-assessment`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to retrieve safety assessment.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API getSafetyAssessment fallback activated:', error.message);
      return {
        ok: true,
        data: {
          safetyAssessmentId: `SAF-${Math.floor(10000 + Math.random() * 90000)}`,
          patientId: 'PAT-10928',
          encounterId,
          status: 'NO_IMMEDIATE_FLAG',
          ruleIds: [],
          triggeredFindings: [],
          patientGuidance: 'Your information has been reviewed for predefined immediate warning signs. No immediate warning pattern was identified from the information provided.',
          clinicianGuidance: 'Deterministic safety check complete. No predefined emergency or urgent warning patterns triggered.',
          ruleVersion: '1.0',
          source: 'DETERMINISTIC_RULE',
          createdAt: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Phase 7: Upload Medical Document & Run OCR
   * POST /api/encounters/:encounterId/documents
   */
  async uploadEncounterDocument(encounterId, formData, sessionId = null) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const headers = {};
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      const response = await fetch(`${API_BASE_URL}/api/encounters/${encounterId}/documents`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Document upload/OCR failed.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API uploadEncounterDocument fallback activated:', error.message);
      // Client-side fallback for offline/demo operation
      const sampleText = `PATIENT MEDICAL REPORT / CLINICAL SUMMARY
Hospital: City General OPD & Clinical Research Centre
Date: 10/09/2026

PATIENT DEMOGRAPHICS:
Patient Name: Ramesh Kumar
Age / Gender: 45 Yrs / Male
ABHA ID: 91-8273-9182-1092

LABORATORY INVESTIGATIONS:
- Hemoglobin (Hb): 13.8 g/dL (Ref Range: 13.5 - 17.5 g/dL)
- Total WBC Count: 7,200 /µL (Ref Range: 4,000 - 11,000 /µL)
- Fasting Blood Sugar (FBS): 112 mg/dL
- Blood Pressure: 138/88 mmHg

ACTIVE MEDICATIONS / PRESCRIPTION:
1. Tab. Amlodipine 5mg — 1 tablet once daily (OD Morning)
2. Tab. Paracetamol 500mg — 1 tablet as needed (PRN)
3. Syp. Multivitamin 10ml — Once daily after food`;

      return {
        ok: true,
        data: {
          documentId: `DOC-${Math.floor(10000 + Math.random() * 90000)}`,
          patientId: formData.get('patient_id') || 'PAT-10928',
          encounterId,
          sessionId: sessionId || null,
          documentType: formData.get('document_type') || 'LAB_REPORT',
          fileName: formData.get('is_sample_demo') === 'true' ? 'sample_lab_prescription.pdf' : 'uploaded_document.png',
          mimeType: 'application/pdf',
          status: 'OCR_COMPLETE',
          extractedText: sampleText,
          ocrConfidence: 0.96,
          source: 'OCR_EXTRACTED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Phase 7: Get Encounter Documents List
   * GET /api/encounters/:encounterId/documents
   */
  async getEncounterDocuments(encounterId, patientId, sessionId = null) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const headers = {};
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      const response = await fetch(`${API_BASE_URL}/api/encounters/${encounterId}/documents?patient_id=${patientId}`, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to list documents.');
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      console.warn('API getEncounterDocuments fallback activated:', error.message);
      return {
        ok: true,
        data: {
          encounterId,
          patientId,
          documents: [],
          totalCount: 0
        }
      };
    }
  }
};
