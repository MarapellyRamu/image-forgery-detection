"""
Script to download pretrained weights.
"""
from tensorflow.keras.applications import MobileNetV3Small, EfficientNetB0, EfficientNetB3

if __name__ == "__main__":
    print("Downloading MobileNetV3Small weights...")
    MobileNetV3Small(include_top=False, weights='imagenet')
    print("Downloading EfficientNetB0 weights...")
    EfficientNetB0(include_top=False, weights='imagenet')
    print("Downloading EfficientNetB3 weights...")
    EfficientNetB3(include_top=False, weights='imagenet')
    print("All weights downloaded successfully.")
