"""
AI model initialization and wrappers for the Image Forgery Detection system.

Architecture:
  - Three backbone feature extractors: MobileNetV3Small, EfficientNetB0, EfficientNetB3
  - Each extracts a feature vector via GlobalAveragePooling2D
  - Features are concatenated then passed through dense classifier layers
  - Final output: sigmoid score (>=0.5 → forged, <0.5 → authentic)

In DEMO MODE the model uses ImageNet weights but has NOT been fine-tuned on
forgery datasets — predictions are intentionally randomized so the complete
API pipeline (upload → preprocess → predict → gradcam → pdf) works end-to-end.
"""

import os
import random
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV3Small, EfficientNetB0, EfficientNetB3
from tensorflow.keras.layers import (
    GlobalAveragePooling2D, Concatenate, Dense, Dropout, Input
)
from tensorflow.keras.models import Model

# ─── Constants ────────────────────────────────────────────────────────────────
MODEL_INPUT_SHAPE = (224, 224, 3)


# ─── Model builder ────────────────────────────────────────────────────────────
def build_fusion_model() -> Model:
    """
    Builds the three-stream feature-fusion model.

    Each backbone receives its own Keras Input tensor so TensorFlow can build
    separate sub-graphs without variable-sharing conflicts.  The three feature
    vectors are concatenated and passed through two dense + dropout layers
    before the final sigmoid classifier.

    Returns
    -------
    tf.keras.Model
        Compiled-ready fusion model with three inputs.
    """
    # ── Input tensors ──────────────────────────────────────────────────────
    input_mob  = Input(shape=MODEL_INPUT_SHAPE, name="input_mobilenet")
    input_b0   = Input(shape=MODEL_INPUT_SHAPE, name="input_efficientnet_b0")
    input_b3   = Input(shape=MODEL_INPUT_SHAPE, name="input_efficientnet_b3")

    # ── MobileNetV3Small stream ────────────────────────────────────────────
    mobilenet_base = MobileNetV3Small(
        include_top=False, weights="imagenet", input_shape=MODEL_INPUT_SHAPE
    )
    mobilenet_base.trainable = False
    mob_features = mobilenet_base(input_mob, training=False)
    f1 = GlobalAveragePooling2D(name="gap_mobilenet")(mob_features)

    # ── EfficientNetB0 stream ─────────────────────────────────────────────
    effnet_b0_base = EfficientNetB0(
        include_top=False, weights="imagenet", input_shape=MODEL_INPUT_SHAPE
    )
    effnet_b0_base.trainable = False
    b0_features = effnet_b0_base(input_b0, training=False)
    f2 = GlobalAveragePooling2D(name="gap_efficientnet_b0")(b0_features)

    # ── EfficientNetB3 stream (ShuffleNetV2 substitute) ───────────────────
    effnet_b3_base = EfficientNetB3(
        include_top=False, weights="imagenet", input_shape=MODEL_INPUT_SHAPE
    )
    effnet_b3_base.trainable = False
    b3_features = effnet_b3_base(input_b3, training=False)
    f3 = GlobalAveragePooling2D(name="gap_efficientnet_b3")(b3_features)

    # ── Fusion classifier head ────────────────────────────────────────────
    concat = Concatenate(name="feature_concat")([f1, f2, f3])
    x = Dense(512, activation="relu", name="dense_512")(concat)
    x = Dropout(0.3, name="dropout_1")(x)
    x = Dense(256, activation="relu", name="dense_256")(x)
    x = Dropout(0.3, name="dropout_2")(x)
    output = Dense(1, activation="sigmoid", name="output")(x)

    model = Model(
        inputs=[input_mob, input_b0, input_b3],
        outputs=output,
        name="ForgeryFusionNet"
    )
    return model


# ─── Detector class ───────────────────────────────────────────────────────────
class ForgeryDetector:
    """
    High-level wrapper around the fusion model for inference.

    Parameters
    ----------
    model_path : str or None
        Path to a saved Keras model file (.keras).  Set to None or a
        non-existent path to trigger demo / fresh-weight mode.
    demo_mode : bool
        If True the predict() method returns a randomised score so the
        full pipeline can be demonstrated without real trained weights.
    """

    def __init__(self, model_path: str = None, demo_mode: bool = True):
        self.model_path = model_path
        self.demo_mode = demo_mode
        self.model = self._load_or_build()

    # ── Private ─────────────────────────────────────────────────────────────
    def _load_or_build(self) -> Model:
        no_saved_model = (
            self.model_path is None
            or not os.path.exists(self.model_path)
        )
        if self.demo_mode or no_saved_model:
            mode_label = "DEMO" if self.demo_mode else "FRESH WEIGHTS"
            print(
                f"[ForgeryDetector] Running in {mode_label} MODE. "
                "Predictions will use random scores until the model is trained."
            )
            return build_fusion_model()

        print(f"[ForgeryDetector] Loading trained model from: {self.model_path}")
        return tf.keras.models.load_model(self.model_path)

    # ── Public API ──────────────────────────────────────────────────────────
    def predict(self, img_array: np.ndarray) -> dict:
        """
        Run forgery detection on a pre-processed image array.

        Parameters
        ----------
        img_array : np.ndarray
            Shape (1, 224, 224, 3), values in [0, 1].

        Returns
        -------
        dict
            {result, confidence, model_used}
        """
        if self.demo_mode:
            # Randomised demo predictions so the UI pipeline is exercisable
            score = random.uniform(0.0, 1.0)
        else:
            # Real inference — pass the same array to all three input heads
            score = float(
                self.model.predict([img_array, img_array, img_array])[0][0]
            )

        result = "forged" if score >= 0.5 else "authentic"
        confidence = score if result == "forged" else (1.0 - score)

        return {
            "result": result,
            "confidence": round(confidence, 4),
            "model_used": "FusionNet (MobileNetV3Small + EfficientNetB0 + EfficientNetB3)",
        }

    def get_gradcam_layer_name(self) -> str:
        """Return the EfficientNetB0 layer name suitable for GradCAM."""
        # The top activation layer of EfficientNetB0 after GlobalMaxPool
        return "top_activation"

    def get_effnet_b0_submodel(self):
        """
        Extract the EfficientNetB0 sub-model from the fusion model so that
        GradCAM can be applied against its spatial feature maps.
        """
        for layer in self.model.layers:
            if isinstance(layer, Model) and "efficientnetb0" in layer.name.lower():
                return layer
        return None


# ─── Singleton accessor ───────────────────────────────────────────────────────
_detector_instance: ForgeryDetector = None


def get_detector(model_path: str = None, demo_mode: bool = True) -> ForgeryDetector:
    """
    Return the singleton ForgeryDetector instance, creating it on first call.

    Parameters
    ----------
    model_path : str or None
        Only used on the first call.
    demo_mode : bool
        Only used on the first call.
    """
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = ForgeryDetector(
            model_path=model_path, demo_mode=demo_mode
        )
    return _detector_instance
