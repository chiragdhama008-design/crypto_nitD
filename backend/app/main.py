"""
TRACE-X Forensic Intelligence Platform - FastAPI Main Entrypoint.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.api.routes import (
    health,
    dashboard,
    transactions,
    graph,
    risk,
    models,
    analytics,
    cases,
    reports,
    ml,
    dataset
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 60)
    print("STARTING TRACE-X FORENSIC INTELLIGENCE BACKEND")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Active Model: {settings.ACTIVE_MODEL}")
    print(f"Dataset Path: {settings.DATASET_PATH}")
    print("=" * 60)
    # Initialize database connection and schemas
    init_db()
    yield
    print("[TRACE-X] Backend shutdown cleanly.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="End-to-End Crypto & Financial Forensic Analysis Platform",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(cases.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(ml.router, prefix="/api")
app.include_router(dataset.router, prefix="/api")


@app.get("/")
def root():
    return {
        "platform": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Forensic Server Error", "detail": str(exc)}
    )
