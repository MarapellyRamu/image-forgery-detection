"""
Standalone fusion model definition used by training, evaluation, and test scripts.

Architecture
------------
Three lightweight CNN backbones serve as feature extractors:

  ┌─────────────────────┐
  │  MobileNetV3Small   │ ──> GAP ──┐
  └─────────────────────┘           │
  ┌─────────────────────┐           ├──> Concat ──> Dense(512) ──> Dense(256) ──> sigmoid
  │   EfficientNetB0    │ ──> GAP ──┤
  └─────────────────────┘           │
  ┌─────────────────────┐           │
  │   EfficientNetB3    │ ──> GAP ──┘
  └─────────────────────┘
  (ShuffleNetV2 substitute — EfficientNetB3 is similarly lightweight and efficient)

Each backbone receives its own Keras Input so TensorFlow builds independent
sub-graphs without weight-sharing conflicts.  During inference the same
preprocessed array is fed to all three inputs.

Usage
-----
    from fusion_model import build_fusion_model, MODEL_INPUT_SHAPE

    model = build_fusion_model()
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    model.summary()
"""

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV3Small, EfficientNetB0, EfficientNetB3
from tensorflow.keras.layers import (
    GlobalAveragePooling2D, Concatenate, Dense, Dropout, Input
)
from tensorflow.keras.models import Model

# ── Constants ──────────────────────────────────────────────────────────────────
MODEL_INPUT_SHAPE = (224, 224, 3)   # Required input shape for all backbones
NUM_CLASSES = 1                      # Binary: 0 = authentic, 1 = forged


def build_fusion_model(trainable_backbones: bool = False) -> Model:
    """
    Build and return the three-stream feature-fusion model.

    Parameters
    ----------
    trainable_backbones : bool
        If False (default) backbone weights are frozen (transfer-learning stage).
        Set to True for fine-tuning after initial training converges.

    Returns
    -------
    tf.keras.Model
        Un-compiled model.  Call model.compile() before training.
    """
    # ── Separate inputs per backbone ──────────────────────────────────────
    input_mob = Input(shape=MODEL_INPUT_SHAPE, name="input_mobilenet")
    input_b0  = Input(shape=MODEL_INPUT_SHAPE, name="input_efficientnet_b0")
    input_b3  = Input(shape=MODEL_INPUT_SHAPE, name="input_efficientnet_b3")

    # ── Stream 1: MobileNetV3Small (very lightweight, ~2.5M params) ───────
    mob_base = MobileNetV3Small(
        include_top=False,
        weights="imagenet",
        input_shape=MODEL_INPUT_SHAPE,
    )
    mob_base.trainable = trainable_backbones
    f1 = GlobalAveragePooling2D(name="gap_mobilenet")(
        mob_base(input_mob, training=False)
    )

    # ── Stream 2: EfficientNetB0 (balanced accuracy/speed, ~5.3M params) ─
    b0_base = EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=MODEL_INPUT_SHAPE,
    )
    b0_base.trainable = trainable_backbones
    f2 = GlobalAveragePooling2D(name="gap_efficientnet_b0")(
        b0_base(input_b0, training=False)
    )

    # ── Stream 3: EfficientNetB3 (higher capacity, ~12M params) ──────────
    b3_base = EfficientNetB3(
        include_top=False,
        weights="imagenet",
        input_shape=MODEL_INPUT_SHAPE,
    )
    b3_base.trainable = trainable_backbones
    f3 = GlobalAveragePooling2D(name="gap_efficientnet_b3")(
        b3_base(input_b3, training=False)
    )

    # ── Fusion head ───────────────────────────────────────────────────────
    concat  = Concatenate(name="feature_concat")([f1, f2, f3])
    x       = Dense(512, activation="relu",    name="dense_512")(concat)
    x       = Dropout(0.3,                     name="dropout_1")(x)
    x       = Dense(256, activation="relu",    name="dense_256")(x)
    x       = Dropout(0.3,                     name="dropout_2")(x)
    output  = Dense(NUM_CLASSES, activation="sigmoid", name="output")(x)

    model = Model(
        inputs=[input_mob, input_b0, input_b3],
        outputs=output,
        name="ForgeryFusionNet",
    )
    return model


if __name__ == "__main__":
    # Quick sanity-check: build the model and print its summary
    model = build_fusion_model()
    model.summary()
    print(f"\nTotal parameters: {model.count_params():,}")
