from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ocr_service_host: str = "0.0.0.0"
    ocr_service_port: int = 8001
    redis_url: str = "redis://localhost:6379/0"
    iris_api_base_url: str = "http://localhost:8000"
    iris_api_key: str = ""
    model_name: str = "microsoft/trocr-base-handwritten"
    device: str = "cpu"


settings = Settings()
