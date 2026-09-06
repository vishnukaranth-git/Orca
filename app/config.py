from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    demo_mode: bool = True
    groq_api_key: str | None = None
    groq_model: str = "openai/gpt-oss-120b"
    google_maps_api_key: str | None = None
    allowed_origins: str = "*"
    version: str = "0.1.0"

    @property
    def origins(self) -> list[str]:
        return [value.strip() for value in self.allowed_origins.split(",") if value.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
