"""
Configuration settings for the backend.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./forgery_detection.db"
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    MODEL_PATH: str = "../models/saved_model"
    DEMO_MODE: bool = True

    model_config = SettingsConfigDict(env_file=".env")

@lru_cache()
def get_settings() -> Settings:
    return Settings()
