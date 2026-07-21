# 🔍 Forgery.ai — Image Forgery Detection

> **AI-powered image authenticity verification using a fusion of lightweight deep learning models.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.13+-orange)](https://tensorflow.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)

---

## 🚀 Quick Start (Demo Mode — No Training Required)

### Prerequisites
- **Python 3.11+**
- **Node.js 20+**
- **Git**

### One-Command Setup
```bash
# 1. Clone / navigate to the project
cd image-forgery-detection

# 2. Run the automated setup script
python setup.py

# 3a. Terminal 1 — Start the backend
start_backend.bat        # Windows
# OR: cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000

# 3b. Terminal 2 — Start the frontend
start_frontend.bat       # Windows
# OR: cd frontend && npm run dev

# 4. Open your browser
#    Frontend:  http://localhost:3000
#    API Docs:  http://localhost:8000/api/docs
```

### Demo Credentials
| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@forgery.ai       | Admin@123  |

---

## 🏗️ Architecture

```
image-forgery-detection/
├── backend/                # FastAPI + SQLAlchemy + JWT
│   ├── main.py             # App factory, startup, CORS
│   ├── config.py           # Pydantic settings from .env
│   ├── database.py         # SQLAlchemy engine + session
│   ├── models/
│   │   ├── ai_model.py     # Fusion model + ForgeryDetector singleton
│   │   └── db_models.py    # User + Prediction ORM models
│   ├── routers/
│   │   ├── auth.py         # POST /login, /register, GET /me
│   │   ├── images.py       # POST /upload, GET /history, /gradcam, /download-report
│   │   └── admin.py        # Admin CRUD + analytics
│   ├── services/
│   │   ├── prediction_service.py  # ML pipeline orchestration
│   │   └── report_service.py      # PDF generation (ReportLab)
│   └── utils/
│       ├── image_utils.py  # Validation, preprocessing, saving
│       └── gradcam.py      # GradCAM heatmap computation + overlay
│
├── frontend/               # Next.js 15 + React + Tailwind CSS
│   ├── app/
│   │   ├── page.tsx        # Landing page (animated hero)
│   │   ├── auth/           # Login + Signup pages
│   │   ├── dashboard/      # Main user dashboard + upload + history
│   │   └── admin/          # Admin control panel
│   ├── components/
│   │   ├── ui/             # Button, Card, Input, Badge, Modal, Spinner
│   │   ├── layout/         # Navbar, Sidebar
│   │   ├── upload/         # Dropzone, UploadProgress
│   │   ├── detection/      # ResultCard
│   │   ├── heatmap/        # GradCamViewer
│   │   └── charts/         # ActivityChart, DonutChart, StatsCards
│   └── lib/
│       ├── api.ts          # Axios API client with auth interceptors
│       └── utils.ts        # cn(), formatDate(), formatConfidence()
│
├── models/                 # Standalone ML scripts
│   ├── fusion_model.py     # Build the 3-stream fusion model
│   ├── train.py            # Full training script with augmentation
│   ├── evaluate.py         # Accuracy, F1, AUC, confusion matrix
│   ├── inference.py        # Standalone inference module
│   └── test.py             # CLI test on single image or directory
│
├── datasets/               # Dataset management
│   ├── generate_sample.py  # Creates synthetic demo dataset
│   ├── prepare_casia.py    # CASIA2.0 preparation script
│   ├── prepare_columbia.py # Columbia dataset preparation
│   └── prepare_coverage.py # COVERAGE dataset preparation
│
├── docker/                 # Docker configuration
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── docs/                   # Documentation
│   ├── INSTALLATION.md
│   ├── API.md
│   ├── MODEL_ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── setup.py                # One-click setup script
├── start_backend.bat       # Windows backend startup
└── start_frontend.bat      # Windows frontend startup
```

---

## 🧠 AI Model Architecture

The **ForgeryFusionNet** uses three parallel CNN backbones:

```
Input Image (224×224×3)
         │
    ┌────┼────┐
    │    │    │
MobileNetV3  EfficientNetB0  EfficientNetB3
    │    │    │
   GAP  GAP  GAP
    │    │    │
    └────┼────┘
         │
     Concatenate
         │
    Dense(512, ReLU)
         │
    Dropout(0.3)
         │
    Dense(256, ReLU)
         │
    Dropout(0.3)
         │
    Dense(1, Sigmoid)
         │
  0 = Authentic | 1 = Forged
```

### Demo Mode vs. Trained Mode
| Mode    | Weights                  | Predictions      |
|---------|--------------------------|-----------------|
| Demo    | ImageNet (not fine-tuned)| Random scores   |
| Trained | Fine-tuned on forgery data| Real predictions|

---

## 📊 Features

- ✅ **Upload & Detect** — Drag-and-drop image analysis
- ✅ **GradCAM Heatmaps** — Explainable AI visualization
- ✅ **PDF Reports** — Downloadable per-prediction reports
- ✅ **Detection History** — Paginated, searchable, filterable
- ✅ **Analytics Dashboard** — Charts and statistics
- ✅ **User Authentication** — JWT-secured accounts
- ✅ **Admin Panel** — User management and system analytics
- ✅ **Demo Mode** — Works without training
- ✅ **Docker** — Fully containerized deployment
- ✅ **Dark Mode** — Glassmorphism UI with gradient accents

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
SECRET_KEY=your-32-char-random-secret-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./forgery_detection.db
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
MODEL_PATH=../models/saved_model/fusion_model.keras
DEMO_MODE=true
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🏋️ Training with Real Data

```bash
# 1. Generate synthetic demo dataset (quick test)
python datasets/generate_sample.py

# 2. Download CASIA2.0 and prepare it
python datasets/prepare_casia.py --input /path/to/CASIA2.0 --output datasets/casia

# 3. Train the model
python models/train.py \
  --data-dir datasets/casia \
  --output-dir models/saved_model \
  --epochs 50 \
  --batch-size 32

# 4. Evaluate
python models/evaluate.py \
  --model-path models/saved_model/fusion_model.keras \
  --test-dir datasets/casia/test

# 5. Switch to trained mode
# In backend/.env: set DEMO_MODE=false
# Restart the backend
```

---

## 🐳 Docker Deployment

```bash
# Start all services (backend + frontend + PostgreSQL)
docker compose -f docker/docker-compose.yml up --build

# Stop
docker compose -f docker/docker-compose.yml down
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [INSTALLATION.md](docs/INSTALLATION.md) | Detailed installation steps |
| [API.md](docs/API.md) | Full REST API reference |
| [MODEL_ARCHITECTURE.md](docs/MODEL_ARCHITECTURE.md) | Deep learning model details |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [datasets/README.md](datasets/README.md) | Dataset preparation guide |

---

## ⚠️ Security Notes

1. **Change `SECRET_KEY`** before any production deployment
2. **Change the admin password** (`Admin@123`) immediately after first login
3. In production, set `CORS_ORIGINS` to your specific frontend domain
4. Use PostgreSQL instead of SQLite for production

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ using FastAPI · Next.js · TensorFlow · MobileNetV3 · EfficientNetB0 · EfficientNetB3*
