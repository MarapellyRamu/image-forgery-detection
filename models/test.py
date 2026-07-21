"""
Test / inference script for individual images or entire directories.

Usage
-----
    # Single image (demo mode):
    python models/test.py --image path/to/image.jpg --demo-mode

    # Single image with trained model:
    python models/test.py --model-path models/saved_model/fusion_model.keras --image path/to/image.jpg

    # Batch test on a directory:
    python models/test.py --model-path models/saved_model/fusion_model.keras --dir path/to/images/
"""
import os
import sys
import argparse
import time
import cv2
import numpy as np
import tensorflow as tf

# Allow running from the project root
sys.path.insert(0, os.path.dirname(__file__))
from inference import ForgeryDetector


def preprocess_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return None
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))
    img = img.astype(np.float32) / 255.0
    return np.expand_dims(img, axis=0)

def main():
    parser = argparse.ArgumentParser(description="Test Forgery Detection Inference")
    parser.add_argument("--model-path", type=str, default=None, help="Path to trained model")
    parser.add_argument("--image", type=str, help="Path to a single image to test")
    parser.add_argument("--dir", type=str, help="Path to a directory of images to test")
    parser.add_argument("--demo-mode", action="store_true", help="Run in demo mode with random weights")
    args = parser.parse_args()
    
    if not args.image and not args.dir:
        print("Please provide either --image or --dir")
        return
        
    detector = ForgeryDetector(model_path=args.model_path, demo_mode=args.demo_mode)
    
    if args.image:
        print(f"Testing single image: {args.image}")
        img_arr = preprocess_image(args.image)
        if img_arr is None:
            print("Failed to read image.")
            return
            
        start_t = time.time()
        res = detector.predict(img_arr)
        t = time.time() - start_t
        
        print(f"Result: {res['result'].upper()}")
        print(f"Confidence: {res['confidence']*100:.2f}%")
        print(f"Processing Time: {t:.4f}s")
        
    if args.dir:
        print(f"Testing directory: {args.dir}")
        valid_exts = ['.jpg', '.jpeg', '.png']
        images = [f for f in os.listdir(args.dir) if any(f.lower().endswith(e) for e in valid_exts)]
        
        total = len(images)
        forged = 0
        authentic = 0
        times = []
        
        for img_name in images:
            path = os.path.join(args.dir, img_name)
            img_arr = preprocess_image(path)
            if img_arr is None:
                continue
                
            start_t = time.time()
            res = detector.predict(img_arr)
            times.append(time.time() - start_t)
            
            if res['result'] == 'forged':
                forged += 1
            else:
                authentic += 1
                
        print(f"\nSummary for {total} images:")
        print(f"Authentic: {authentic}")
        print(f"Forged: {forged}")
        if times:
            print(f"Average time per image: {np.mean(times):.4f}s")

if __name__ == "__main__":
    main()
