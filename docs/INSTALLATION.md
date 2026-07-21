# Installation Guide

Follow these steps to set up the Image Forgery Detection System locally.

## Prerequisites
*   Python 3.11+
*   Node.js 20+
*   Git
*   Docker and Docker Compose (Optional, for containerized setup)

## 1. Clone the Repository
```bash
git clone <repository_url> image-forgery-detection
cd image-forgery-detection
```

## 2. Backend Setup
```bash
# Create a virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate
# Activate it (Linux/Mac)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env

# Run the backend server
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Create local env file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run the development server
npm run dev
```

## 4. Dataset & Model Setup (Demo Mode)
To run the system without downloading large datasets, use the demo generator:
```bash
# Generate synthetic dataset
python datasets/generate_sample.py

# Train the model on synthetic data
python models/train.py --data-dir datasets/sample
```

## 5. Verify Installation
Open `http://localhost:3000` in your browser. You should see the application running.

## 6. Docker Setup (Alternative)
If you prefer running the entire stack via Docker:
```bash
cp .env.example .env
docker-compose -f docker/docker-compose.yml up --build
```

## Switching to Real Datasets
To train on real datasets (CASIA, Columbia, etc.), refer to `datasets/README.md` for download instructions and use the corresponding preparation scripts before running the `train.py` script.

## Troubleshooting
*   **Port Conflicts**: Ensure ports 8000 (backend) and 3000 (frontend) are available.
*   **Database Errors**: If using SQLite, ensure the backend has write permissions to the directory.
*   **Model Not Found**: Ensure you have trained the model or set `DEMO_MODE=true` in your `.env` file to use a placeholder model for UI testing.
