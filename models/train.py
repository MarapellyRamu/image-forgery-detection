"""
Training script for the Image Forgery Detection fusion model.

Usage
-----
    python models/train.py \\
        --data-dir datasets/sample \\
        --output-dir models/saved_model \\
        --epochs 50 \\
        --batch-size 32

Dataset layout (inside --data-dir):
    train/
        authentic/   ← JPEG/PNG authentic images
        forged/      ← JPEG/PNG forged images
    val/
        authentic/
        forged/

The fusion model has 3 inputs (one per backbone).  This script wraps
Keras ImageDataGenerators so that the same batch is fed to all three inputs.
"""

import os
import sys
import argparse
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.callbacks import (
    ModelCheckpoint,
    EarlyStopping,
    ReduceLROnPlateau,
    TensorBoard,
    CSVLogger,
)
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import BinaryCrossentropy

# Allow running from the project root
sys.path.insert(0, os.path.dirname(__file__))
from fusion_model import build_fusion_model, MODEL_INPUT_SHAPE


# ── Utility: triple-input generator ───────────────────────────────────────────
def triple_input_generator(base_generator):
    """
    Wrap a Keras flow_from_directory generator so it yields
    ([X, X, X], y) tuples required by the three-input fusion model.
    """
    for X_batch, y_batch in base_generator:
        yield [X_batch, X_batch, X_batch], y_batch


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Train the Image Forgery Detection Fusion Model"
    )
    parser.add_argument(
        "--data-dir", type=str, required=True,
        help="Root dataset directory containing train/ and val/ subdirectories"
    )
    parser.add_argument(
        "--output-dir", type=str, required=True,
        help="Directory where the trained model and logs will be saved"
    )
    parser.add_argument("--epochs",        type=int,   default=50)
    parser.add_argument("--batch-size",    type=int,   default=32)
    parser.add_argument("--learning-rate", type=float, default=1e-4)
    parser.add_argument(
        "--resume-checkpoint", type=str, default=None,
        help="Path to a .keras / .h5 checkpoint to resume training from"
    )
    parser.add_argument(
        "--fine-tune", action="store_true",
        help="If set, unfreeze backbones for fine-tuning (use a small LR)"
    )
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    # ── Data generators ─────────────────────────────────────────────────
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        horizontal_flip=True,
        rotation_range=15,
        zoom_range=0.15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        brightness_range=[0.8, 1.2],
        fill_mode="nearest",
    )
    val_datagen = ImageDataGenerator(rescale=1.0 / 255)

    train_dir = os.path.join(args.data_dir, "train")
    val_dir   = os.path.join(args.data_dir, "val")

    if not os.path.isdir(train_dir) or not os.path.isdir(val_dir):
        print(
            f"[ERROR] Expected train/ and val/ subdirectories inside: {args.data_dir}\n"
            "Run `python datasets/generate_sample.py` to create a demo dataset first."
        )
        sys.exit(1)

    target_size = MODEL_INPUT_SHAPE[:2]

    raw_train_gen = train_datagen.flow_from_directory(
        train_dir,
        target_size=target_size,
        batch_size=args.batch_size,
        class_mode="binary",
        shuffle=True,
        seed=42,
    )
    raw_val_gen = val_datagen.flow_from_directory(
        val_dir,
        target_size=target_size,
        batch_size=args.batch_size,
        class_mode="binary",
        shuffle=False,
    )

    print(f"Training classes: {raw_train_gen.class_indices}")
    print(f"Training samples : {raw_train_gen.samples}")
    print(f"Validation samples: {raw_val_gen.samples}")

    steps_per_epoch  = max(1, raw_train_gen.samples  // args.batch_size)
    validation_steps = max(1, raw_val_gen.samples    // args.batch_size)

    # ── Build / load model ───────────────────────────────────────────────
    model = build_fusion_model(trainable_backbones=args.fine_tune)

    if args.resume_checkpoint and os.path.exists(args.resume_checkpoint):
        print(f"Resuming weights from: {args.resume_checkpoint}")
        model.load_weights(args.resume_checkpoint)

    model.compile(
        optimizer=Adam(learning_rate=args.learning_rate),
        loss=BinaryCrossentropy(),
        metrics=[
            "accuracy",
            tf.keras.metrics.Precision(name="precision"),
            tf.keras.metrics.Recall(name="recall"),
            tf.keras.metrics.AUC(name="auc"),
        ],
    )
    model.summary()

    # ── Callbacks ────────────────────────────────────────────────────────
    callbacks = [
        ModelCheckpoint(
            filepath=os.path.join(args.output_dir, "best_model.keras"),
            save_best_only=True,
            monitor="val_loss",
            verbose=1,
        ),
        EarlyStopping(
            patience=10,
            monitor="val_loss",
            restore_best_weights=True,
            verbose=1,
        ),
        ReduceLROnPlateau(
            factor=0.5,
            patience=5,
            monitor="val_loss",
            min_lr=1e-7,
            verbose=1,
        ),
        TensorBoard(
            log_dir=os.path.join(args.output_dir, "logs"),
            histogram_freq=0,
        ),
        CSVLogger(os.path.join(args.output_dir, "training_log.csv")),
    ]

    # ── Training ─────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("Starting training …")
    print("=" * 60 + "\n")

    history = model.fit(
        triple_input_generator(raw_train_gen),
        steps_per_epoch=steps_per_epoch,
        epochs=args.epochs,
        validation_data=triple_input_generator(raw_val_gen),
        validation_steps=validation_steps,
        callbacks=callbacks,
    )

    # ── Save final model ─────────────────────────────────────────────────
    final_path = os.path.join(args.output_dir, "fusion_model.keras")
    model.save(final_path)
    print(f"\nFinal model saved to: {final_path}")

    # ── Save training history ─────────────────────────────────────────────
    history_dict = {
        k: [float(v) for v in vals]
        for k, vals in history.history.items()
    }
    hist_path = os.path.join(args.output_dir, "training_history.json")
    with open(hist_path, "w") as f:
        json.dump(history_dict, f, indent=2)
    print(f"Training history saved to: {hist_path}")

    # ── Print final metrics ───────────────────────────────────────────────
    final_epoch = {k: v[-1] for k, v in history_dict.items()}
    print("\nFinal epoch metrics:")
    for k, v in final_epoch.items():
        print(f"  {k:30s}: {v:.4f}")


if __name__ == "__main__":
    main()
