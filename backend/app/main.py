from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import health, patients, encounters, sessions, conversations, safety, documents, entities, timeline, summary
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="MediKiosk AI-Powered Clinical Intake Platform API Foundation",
    version="1.0.0"
)

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(patients.router, prefix="/api", tags=["Patients"])
app.include_router(encounters.router, prefix="/api", tags=["Encounters"])
app.include_router(sessions.router, prefix="/api", tags=["Sessions"])
app.include_router(conversations.router, prefix="/api", tags=["Conversations"])
app.include_router(safety.router, prefix="/api", tags=["Safety"])
app.include_router(documents.router, prefix="/api", tags=["Documents"])
app.include_router(entities.router, prefix="/api", tags=["Entities"])
app.include_router(timeline.router, prefix="/api", tags=["Timeline"])
app.include_router(summary.router, prefix="/api", tags=["Summary"])

@app.get("/", summary="Root Endpoint")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "health": "/api/health"
    }
