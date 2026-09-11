# MediKiosk — AI-Powered Clinical Intake Platform

**Smart India Hackathon 2026 Project**

MediKiosk is a healthcare kiosk and clinical intake platform designed to collect patient information through an accessible interface and transform the collected information and medical documents into a structured, physician-ready clinical summary.

---

## 🚀 Phase 1 Implementation Status

- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Lucide Icons, MediKiosk Design System
- **Backend**: FastAPI, Python 3.13, Pydantic, SQLAlchemy abstraction, CORS Middleware
- **Health Check**: `GET /api/health` -> `{"status": "ok", "service": "MediKiosk API"}`
- **Patient Kiosk Shell (`/kiosk`)**: Accessible, large touch targets, low-literacy friendly, voice AI placeholder, language selector
- **Physician Dashboard Shell (`/dashboard`)**: Persistent sidebar, KPI cards, intake activity chart, red flag triage, recent encounters table with summary reviewer
- **Patient Profile (`/patients/:id`)**: Clinical summary editor, verification controls (`Edit`, `Confirm`, `Reject`, `Save`), red flags, vitals

---

## 📁 Repository Structure

```
prototype/
├── frontend/
│   ├── src/
│   │   ├── components/ (ui, layout, kiosk, dashboard)
│   │   ├── pages/ (landing, dashboard, kiosk)
│   │   ├── mock/ (patients, encounters, alerts, dashboard)
│   │   ├── services/ (api.js)
│   │   ├── routes/ (AppRoutes.jsx)
│   │   ├── styles/ (theme.css)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/routes/health.py
│   │   ├── core/ (config.py, database.py)
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
├── README.md
└── .env.example
```

---

## 🛠️ How to Run Locally

### 1. Start Backend API
```cmd
cd backend
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- API Health Endpoint: `http://localhost:8000/api/health`
- Swagger Docs: `http://localhost:8000/docs`

### 2. Start Frontend App
```cmd
cd frontend
npm install
npm run dev
```
- Local URL: `http://localhost:5173`
- Routes:
  - Landing Hub: `http://localhost:5173/`
  - Physician Dashboard: `http://localhost:5173/dashboard`
  - Patient Kiosk: `http://localhost:5173/kiosk`
  - Patient Profile: `http://localhost:5173/patients/PAT-10928`
