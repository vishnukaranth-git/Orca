from abc import ABC, abstractmethod
from datetime import datetime
from app.schemas import Coordinates


class ProviderUnavailable(Exception):
    """A source could not return validated information."""


class MarineProvider(ABC):
    @abstractmethod
    async def current(self, location: Coordinates, at: datetime | None = None) -> dict: ...


class WeatherProvider(ABC):
    @abstractmethod
    async def current(self, location: Coordinates, at: datetime | None = None) -> dict: ...


class PFZProvider(ABC):
    @abstractmethod
    async def zones(self, location: Coordinates, at: datetime | None = None) -> dict: ...
