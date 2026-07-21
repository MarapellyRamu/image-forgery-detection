#!/usr/bin/env python3
"""
setup.py — One-click setup script for Image Forgery Detection application.

Runs in the project root directory and:
  1. Creates Python virtual environment (backend/venv)
  2. Installs backend Python dependencies
  3. Copies .env.example → .env (if not already present)
  4. Generates the demo/sample dataset
  5. Copies frontend .env.local.example → .env.local
  6. Installs frontend Node.js dependencies

Usage:
    python setup.py

After setup, run manually:
    Terminal 1: cd backend && python -m uvicorn main:app --reload --port 8000
    Terminal 2: cd frontend && npm run dev
"""

import os
import sys
import shutil
import subprocess
import platform

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT, "backend")
FRONTEND_DIR = os.path.join(ROOT, "frontend")
DATASETS_DIR = os.path.join(ROOT, "datasets")

# ANSI colors
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

def ok(msg):   print(f"{GREEN}  ✔ {msg}{RESET}")
def info(msg): print(f"{CYAN}  → {msg}{RESET}")
def warn(msg): print(f"{YELLOW}  ⚠ {msg}{RESET}")
def err(msg):  print(f"{RED}  ✖ {msg}{RESET}")
def header(msg):
    print(f"\n{BOLD}{CYAN}{'='*60}")
    print(f"  {msg}")
    print(f"{'='*60}{RESET}\n")


def run(cmd, cwd=None, check=True, shell=False):
    """Run a shell command, streaming output."""
    info(f"Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    result = subprocess.run(
        cmd, cwd=cwd, check=check,
        shell=shell if platform.system() == "Windows" else False
    )
    return result


def get_python():
    """Return the Python executable path."""
    for py in ["python3", "python"]:
        if shutil.which(py):
            return py
    err("Python 3 not found. Please install Python 3.11+ from https://python.org")
    sys.exit(1)


def get_node():
    """Check Node.js is available."""
    if not shutil.which("node"):
        err("Node.js not found. Please install Node.js 20+ from https://nodejs.org")
        sys.exit(1)
    ok("Node.js found")


def setup_backend():
    header("Setting up Backend (FastAPI + Python)")

    python = get_python()
    venv_dir = os.path.join(BACKEND_DIR, "venv")

    # Create virtual environment
    if not os.path.isdir(venv_dir):
        info("Creating Python virtual environment …")
        run([python, "-m", "venv", venv_dir])
        ok("Virtual environment created")
    else:
        ok("Virtual environment already exists")

    # pip executable
    if platform.system() == "Windows":
        pip = os.path.join(venv_dir, "Scripts", "pip.exe")
        py  = os.path.join(venv_dir, "Scripts", "python.exe")
    else:
        pip = os.path.join(venv_dir, "bin", "pip")
        py  = os.path.join(venv_dir, "bin", "python")

    # Upgrade pip
    info("Upgrading pip …")
    run([pip, "install", "--upgrade", "pip"])

    # Install requirements
    req_path = os.path.join(BACKEND_DIR, "requirements.txt")
    info("Installing Python requirements (this may take a few minutes for TensorFlow) …")
    run([pip, "install", "-r", req_path])
    ok("Python requirements installed")

    # Copy .env
    env_src = os.path.join(BACKEND_DIR, ".env.example")
    env_dst = os.path.join(BACKEND_DIR, ".env")
    if not os.path.isfile(env_dst):
        shutil.copy(env_src, env_dst)
        ok(f"Copied .env.example → .env")
        warn("IMPORTANT: Edit backend/.env and change SECRET_KEY before production use!")
    else:
        ok(".env already exists — skipping copy")


def setup_frontend():
    header("Setting up Frontend (Next.js 15)")

    get_node()

    # npm install
    info("Installing Node.js dependencies …")
    run(["npm", "install"], cwd=FRONTEND_DIR, shell=True)
    ok("Node.js dependencies installed")

    # Copy .env.local
    env_src = os.path.join(FRONTEND_DIR, ".env.local.example")
    env_dst = os.path.join(FRONTEND_DIR, ".env.local")
    if not os.path.isfile(env_dst):
        shutil.copy(env_src, env_dst)
        ok("Copied .env.local.example → .env.local")
    else:
        ok(".env.local already exists — skipping copy")


def generate_dataset():
    header("Generating Sample Dataset (Demo Mode)")

    python = get_python()
    venv_dir = os.path.join(BACKEND_DIR, "venv")
    if platform.system() == "Windows":
        py = os.path.join(venv_dir, "Scripts", "python.exe")
    else:
        py = os.path.join(venv_dir, "bin", "python")

    script = os.path.join(DATASETS_DIR, "generate_sample.py")
    if os.path.isfile(script):
        info("Running dataset generator …")
        run([py, script], cwd=ROOT)
        ok("Sample dataset generated at datasets/sample/")
    else:
        warn(f"Dataset script not found: {script}")


def print_next_steps():
    header("Setup Complete! 🎉")
    print(f"""{BOLD}Next steps:{RESET}

{CYAN}Terminal 1 — Start the backend:{RESET}
    cd backend
    venv\\Scripts\\activate          (Windows)
    source venv/bin/activate        (Mac/Linux)
    python -m uvicorn main:app --reload --port 8000

{CYAN}Terminal 2 — Start the frontend:{RESET}
    cd frontend
    npm run dev

{CYAN}Then open:{RESET}
    Frontend:  http://localhost:3000
    API Docs:  http://localhost:8000/api/docs

{CYAN}Demo credentials:{RESET}
    Admin:   admin@forgery.ai / Admin@123

{YELLOW}To switch from demo to real model (after training):{RESET}
    1. Download a dataset: see datasets/README.md
    2. Run: python models/train.py --data-dir datasets/casia --output-dir models/saved_model
    3. Update backend/.env:  DEMO_MODE=false
    4. Restart the backend

{GREEN}Happy detecting! 🔍{RESET}
""")


def main():
    print(f"\n{BOLD}{CYAN}Image Forgery Detection — Setup Script{RESET}")
    print(f"Project root: {ROOT}\n")

    setup_backend()
    generate_dataset()
    setup_frontend()
    print_next_steps()


if __name__ == "__main__":
    main()
