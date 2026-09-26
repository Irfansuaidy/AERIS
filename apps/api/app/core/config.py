from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


REPOSITORY_ROOT = Path(__file__).resolve().parents[4]


class Settings(BaseSettings):
    database_url: str = (
        "postgresql+psycopg://iris:iris_dev_password@localhost:5432/iris"
    )

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    documents_root: str = str(REPOSITORY_ROOT / "data" / "documents")
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    ocr_service_url: str = "http://localhost:8001"
    iris_api_base_url: str = "http://localhost:8000"
    ocr_service_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
