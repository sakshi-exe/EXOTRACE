from fastapi import APIRouter

from app.api.routes import health, investigations, missions, models

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(missions.router)
api_router.include_router(investigations.router)
api_router.include_router(models.router)