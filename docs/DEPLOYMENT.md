# Deployment Guide

## Section 1: Local Development
For local development, simply follow the instructions in [INSTALLATION.md](INSTALLATION.md).

## Section 2: Docker Deployment (Full Stack)
The project includes a `docker-compose.yml` file for easy full-stack deployment on any server with Docker installed.
```bash
cp .env.example .env
# Edit .env with production secrets
docker-compose -f docker/docker-compose.yml up -d --build
```
This deploys the Frontend, Backend, and a PostgreSQL database.

## Section 3: Render.com Backend Deployment
1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Root Directory: `backend`
4. Environment: `Python`
5. Build Command: `pip install -r ../requirements.txt`
6. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add Environment Variables from your `.env` file.

## Section 4: Vercel Frontend Deployment
1. Create a new Project on Vercel.
2. Import the repository.
3. Framework Preset: `Next.js`
4. Root Directory: `frontend`
5. Add Environment Variable: `NEXT_PUBLIC_API_URL` pointing to your deployed backend URL.
6. Click Deploy.

## Section 5: Environment Variables Reference
*   `DATABASE_URL`: Connection string (e.g., `postgresql://user:pass@host:5432/db`)
*   `SECRET_KEY`: Random 32+ char string for JWT.
*   `MODEL_PATH`: Path to the trained ML model.
*   `NEXT_PUBLIC_API_URL`: Backend URL for the frontend.

## Section 6: Database Migration (SQLite -> PostgreSQL)
In production, you should use PostgreSQL instead of SQLite. Update the `DATABASE_URL` in your `.env` file. SQLAlchemy will handle table creation automatically on the first run.

## Section 7: Model Deployment Considerations
*   Ensure the production server has enough RAM to load the TensorFlow models.
*   The `uploads/` directory must persist across deployments (e.g., use an attached disk on Render, or AWS S3 integration).
