"""
Standalone inference module used by test.py and external scripts.

This mirrors the backend's ai_model.py but is importable without the
FastAPI application context (no relative imports).

Usage
-----
    from inference import ForgeryDetector

    detector = ForgeryDetector(model_path="models/saved_model/fusion_model.keras", demo_mode=False)
    img_array = preprocess_image("path/to/image.jpg")  # shape (1, 224, 224, 3)
    result = detector.predict(img_array)
    # -> {'result': 'authentic', 'confidence': 0.8712, 'model_used': '...'}
"""

import os
import sys
import random
import numpy as np
import tensorflow as tf

# Allow running from the models/ directory
sys.path.insert(0, os.path.dirname(__file__))
from fusion_model import build_fusion_model


class ForgeryDetector:
    """
    Standalone wrapper around the fusion model for production inference.

    Parameters
    ----------
    model_path : str or None
        Path to a saved .keras model file.  If None or missing, uses
        ImageNet weights without fine-tuning (or demo random scores).
    demo_mode : bool
        When True, predict() returns random scores (good for UI demos).
    """

    def __init__(self, model_path: str = None, demo_mode: bool = True):
        self.model_path = model_path
        self.demo_mode = demo_mode
        self.model = self._load_or_build()

    def _load_or_build(self):
        no_saved = (
            self.model_path is None
            or not os.path.exists(self.model_path)
        )
        if self.demo_mode or no_saved:
            mode = "DEMO" if self.demo_mode else "FRESH IMAGENET WEIGHTS"
            print(f"[ForgeryDetector] {mode} MODE — predictions may not be meaningful.")
            return build_fusion_model()
        print(f"[ForgeryDetector] Loading model from: {self.model_path}")
        return tf.keras.models.load_model(self.model_path)

    def predict(self, img_array: np.ndarray) -> dict:
        """
        Run forgery detection.

        Parameters
        ----------
        img_array : np.ndarray
            Shape (1, 224, 224, 3), pixel values in [0, 1].

        Returns
        -------
        dict  {result, confidence, model_used}
        """
        if self.demo_mode:
            score = random.uniform(0.0, 1.0)
        else:
            # Pass the same array to all three input heads
            score = float(
                self.model.predict([img_array, img_array, img_array])[0][0]
            )

        result = "forged" if score >= 0.5 else "authentic"
        confidence = score if result == "forged" else (1.0 - score)

        return {
            "result": result,
            "confidence": round(float(confidence), 4),
            "model_used": "FusionNet (MobileNetV3Small + EfficientNetB0 + EfficientNetB3)",
        }

    def get_gradcam_layer_name(self) -> str:
        """Name of EfficientNetB0's last spatial activation layer."""
        return "top_activation"


# ── Singleton for script-level reuse ──────────────────────────────────────────
_instance: ForgeryDetector = None


def get_detector(model_path: str = None, demo_mode: bool = True) -> ForgeryDetector:
    """Return or create the singleton ForgeryDetector."""
    global _instance
    if _instance is None:
        _instance = ForgeryDetector(model_path=model_path, demo_mode=demo_mode)
    return _instance
