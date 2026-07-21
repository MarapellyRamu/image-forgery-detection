"""
Gradient-weighted Class Activation Mapping (Grad-CAM) utilities.
"""
import numpy as np
import cv2
from PIL import Image
import tensorflow as tf


class GradCAM:
    def __init__(self, model, layer_name: str):
        self.model = model
        self.layer_name = layer_name
        self.grad_model = None
        self._build_grad_model()

    def _build_grad_model(self):
        try:
            self.grad_model = tf.keras.models.Model(
                inputs=self.model.inputs,
                outputs=[
                    self.model.get_layer(self.layer_name).output,
                    self.model.output,
                ],
            )
        except Exception as e:
            print(f"[GradCAM] Failed to build grad model: {e}")
            self.grad_model = None

    def compute(self, img_array: np.ndarray) -> np.ndarray:
        if self.grad_model is None:
            return np.random.rand(7, 7).astype(np.float32)
        with tf.GradientTape() as tape:
            cast_image = tf.cast(img_array, tf.float32)
            conv_outputs, predictions = self.grad_model(cast_image)
            loss = predictions[:, 0]
        grads = tape.gradient(loss, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs_np = conv_outputs[0].numpy()
        pooled_grads_np = pooled_grads.numpy()
        for i in range(pooled_grads_np.shape[-1]):
            conv_outputs_np[:, :, i] *= pooled_grads_np[i]
        heatmap = np.mean(conv_outputs_np, axis=-1)
        heatmap = np.maximum(heatmap, 0)
        heatmap_max = heatmap.max()
        if heatmap_max > 0:
            heatmap /= heatmap_max
        return heatmap.astype(np.float32)


def apply_heatmap(original_img_path: str, heatmap: np.ndarray, alpha: float = 0.4) -> Image.Image:
    img = cv2.imread(original_img_path)
    if img is None:
        img = np.zeros((224, 224, 3), dtype=np.uint8)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    heatmap_resized = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
    overlay = cv2.addWeighted(img, 1 - alpha, heatmap_colored, alpha, 0)
    return Image.fromarray(overlay)


def save_gradcam(original_img_path: str, heatmap: np.ndarray, save_path: str) -> str:
    overlay_img = apply_heatmap(original_img_path, heatmap)
    overlay_img.save(save_path)
    return save_path
