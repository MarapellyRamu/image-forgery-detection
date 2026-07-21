"""
FastAPI application factory for the Image Forgery Detection API.

IMPORTANT: Always run from the PROJECT ROOT (image-forgery-detection/):

    # Recommended (from project root):
    backend\\venv\\Scripts\\python.exe -m uvicorn backend.main:app --reload --port 8000

    # Or using start_backend.bat (Windows):
    start_backend.bat
"""

import os
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base, SessionLocal
from .routers import auth, images, admin
from .models.db_models import User
from .routers.auth import get_password_hash
from .config import get_settings
from .models.ai_model import get_detector

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Image Forgery Detection API",
    description=(
        "REST API for detecting image forgery using a fusion of "
        "MobileNetV3Small, EfficientNetB0, and EfficientNetB3 models."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

settings = get_settings()

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    # In production restrict this to your Vercel domain, e.g.:
    # allow_origins=["https://your-app.vercel.app"]
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(images.router)
app.include_router(admin.router)


# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    logger.info("Starting up Image Forgery Detection API …")

    # 1. Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created / verified.")

    # 2. Ensure the uploads directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info("Upload directory: %s", settings.UPLOAD_DIR)

    # 3. Initialise the AI detector singleton (downloads ImageNet weights once)
    logger.info(
        "Initialising ForgeryDetector (demo_mode=%s) …", settings.DEMO_MODE
    )
    get_detector(model_path=settings.MODEL_PATH, demo_mode=settings.DEMO_MODE)
    logger.info("ForgeryDetector ready.")

    # 4. Create a default admin account if one doesn't already exist
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.email == "admin@forgery.ai").first()
        if not existing_admin:
            admin_user = User(
                username="admin",
                email="admin@forgery.ai",
                hashed_password=get_password_hash("Admin@123"),
                is_admin=True,
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            logger.info(
                "Default admin account created: admin@forgery.ai / Admin@123 "
                "(change this password immediately!)"
            )
        else:
            logger.info("Admin account already exists — skipping creation.")
    finally:
        db.close()

    # 5. Mount static files for uploaded images (served at /uploads/<filename>)
    # We re-check the dir exists because StaticFiles raises if it doesn't.
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
    logger.info("Static files mounted at /uploads")

    logger.info("🚀  API is ready. Visit /api/docs for interactive documentation.")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["health"])
def health_check():
    """Simple health probe used by Docker / Render health checks."""
    return {"status": "ok", "message": "Image Forgery Detection API is running"}
