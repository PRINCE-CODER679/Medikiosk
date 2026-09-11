# MediKiosk Backend Service — Phase 1

MediKiosk Backend Foundation built with **FastAPI**, **Pydantic**, and **SQLAlchemy**.

## Structure
```
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   └── routes/
│   │       └── health.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── utils/
├── .env.example
├── .env
├── requirements.txt
└── README.md
```

## Setup & Running

1. Activate virtual environment:
   ```cmd
   venv\Scripts\activate
   ```
2. Install dependencies:
   ```cmd
   pip install -r requirements.txt
   ```
3. Start development server:
   ```cmd
   uvicorn app.main:app --reload --port 8000
   ```
4. Verify Health Endpoint:
   - `GET http://localhost:8000/api/health`
   - Response: `{"status": "ok", "service": "MediKiosk API"}`
   - API Documentation: `http://localhost:8000/docs`
