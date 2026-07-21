# Image Forgery Detection System

![Python Version](https://img.shields.io/badge/Python-3.11-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15+-orange.svg)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)

An advanced web application for detecting manipulated and forged images using deep learning.

```
+---------------------------------------------------+
|               Web Application UI                  |
|  [ Upload Image ]  [ Detect Forgery ] [ History ] |
|                                                   |
|  +---------------+  +--------------------------+  |
|  |               |  | Result: FORGED (98%)     |  |
|  |   Image.jpg   |  | Heatmap: [GradCAM View]  |  |
|  |               |  | Types: Copy-Move, Splice |  |
|  +---------------+  +--------------------------+  |
+---------------------------------------------------+
```

## Features
- **Deep Learning Core**: Uses lightweight efficient architectures (MobileNet/EfficientNet) for fast and accurate detection.
- **Explainability**: Generates Grad-CAM heatmaps showing which regions of the image the model considers suspicious.
- **Modern Web Interface**: Beautiful, responsive Next.js frontend with drag-and-drop uploads.
- **RESTful API**: Fast and fully documented backend API using FastAPI.
- **Admin Dashboard**: Manage users, view scan history, and monitor system health.
- **Secure Authentication**: JWT-based user authentication.

## Quick Start

### Option 1: Docker (Recommended)
1. Clone the repository
2. Copy `.env.example` to `.env`
3. Run `docker-compose -f docker/docker-compose.yml up -d`
4. Access the app at `http://localhost:3000`

### Option 2: Manual Setup
See [INSTALLATION.md](docs/INSTALLATION.md) for step-by-step local setup instructions.

## Demo Credentials
If running with default configurations:
*   Email: `admin@forgery.ai`
*   Password: `Admin@123`

## Architecture

```
[ Frontend (Next.js) ] <--- REST API ---> [ Backend (FastAPI) ]
                                                |
                                                v
                                    [ Deep Learning Model (TF/Keras) ]
                                                |
                                                v
                                   [ Database (PostgreSQL/SQLite) ]
```

## Documentation
*   [Installation Guide](docs/INSTALLATION.md)
*   [API Reference](docs/API.md)
*   [Model Architecture](docs/MODEL_ARCHITECTURE.md)
*   [Deployment Guide](docs/DEPLOYMENT.md)

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
MIT License
