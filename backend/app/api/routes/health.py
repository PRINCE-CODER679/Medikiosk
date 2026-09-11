from fastapi import APIRouter

router = APIRouter()

@router.get("/health", summary="MediKiosk Health Check")
def health_check():
    """
    Returns health status of the MediKiosk API service.
    Requirement: Returns {"status": "ok", "service": "MediKiosk API"}
    """
    return {
        "status": "ok",
        "service": "MediKiosk API"
    }
