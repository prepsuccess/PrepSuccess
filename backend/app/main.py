import time
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 2. Production Correlation ID (X-Request-ID) & Timing Middleware
@app.middleware("http")
async def add_correlation_id_and_timing(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id

    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response


# 3. Root Endpoint
@app.get("/", tags=["General"])
async def root():
    return {
        "success": True,
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# 4. Production Liveness Probe (Check if app process is running)
@app.get("/health/live", tags=["Health"])
async def liveness_probe():
    return {
        "status": "alive",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# 5. Production Readiness Probe (Check if dependencies are reachable)
@app.get("/health/ready", tags=["Health"])
async def readiness_probe():
    # Note: DB check will be integrated in SCRUM-9
    return {
        "status": "ready",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
