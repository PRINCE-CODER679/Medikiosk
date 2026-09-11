import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "MediKiosk API")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./medikiosk.db")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

settings = Settings()
