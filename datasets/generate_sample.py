import os
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def create_directory_structure(base_dir):
    """Creates the necessary directory structure for the dataset."""
    dirs = [
        "train/authentic", "train/forged",
        "val/authentic", "val/forged",
        "test/authentic", "test/forged"
    ]
    
    for d in dirs:
        path = os.path.join(base_dir, d)
        os.makedirs(path, exist_ok=True)
        print(f"Created directory: {path}")

def generate_natural_image(size=(224, 224)):
    """Generates a synthetic 'natural-looking' image."""
    # Create base image with random color gradient
    base_color = (random.randint(50, 200), random.randint(50, 200), random.randint(50, 200))
    img = Image.new("RGB", size, base_color)
    draw = ImageDraw.Draw(img)
    
    # Add random shapes/textures to make it look less uniform
    for _ in range(random.randint(10, 30)):
        shape_type = random.choice(['rectangle', 'ellipse', 'polygon'])
        color = (
            min(255, base_color[0] + random.randint(-50, 50)),
            min(255, base_color[1] + random.randint(-50, 50)),
            min(255, base_color[2] + random.randint(-50, 50))
        )
        
        x1 = random.randint(0, size[0] - 20)
        y1 = random.randint(0, size[1] - 20)
        x2 = x1 + random.randint(20, 100)
        y2 = y1 + random.randint(20, 100)
        
        if shape_type == 'rectangle':
            draw.rectangle([x1, y1, x2, y2], fill=color)
        elif shape_type == 'ellipse':
            draw.ellipse([x1, y1, x2, y2], fill=color)
        else: # polygon
            points = [(random.randint(0, size[0]), random.randint(0, size[1])) for _ in range(3, 6)]
            draw.polygon(points, fill=color)
            
    # Apply a slight blur to blend shapes
    img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.5, 2.0)))
    
    # Add some noise
    img_np = np.array(img)
    noise = np.random.normal(0, random.uniform(5, 15), img_np.shape).astype(np.uint8)
    img_np = np.clip(img_np + noise, 0, 255).astype(np.uint8)
    
    return Image.fromarray(img_np)

def apply_copy_move_forgery(img, size=(224, 224)):
    """Applies a synthetic copy-move forgery to an image."""
    img_np = np.array(img)
    
    # Determine patch size (10% to 30% of image width/height)
    patch_w = random.randint(int(size[0] * 0.1), int(size[0] * 0.3))
    patch_h = random.randint(int(size[1] * 0.1), int(size[1] * 0.3))
    
    # Source region
    src_x = random.randint(0, size[0] - patch_w - 1)
    src_y = random.randint(0, size[1] - patch_h - 1)
    patch = img_np[src_y:src_y+patch_h, src_x:src_x+patch_w].copy()
    
    # Destination region (ensure it doesn't overlap completely with source)
    dst_x = random.randint(0, size[0] - patch_w - 1)
    dst_y = random.randint(0, size[1] - patch_h - 1)
    
    # Optional: Apply slight transformation to the patch (e.g., color shift or blur)
    if random.choice([True, False]):
         patch = np.clip(patch * random.uniform(0.8, 1.2), 0, 255).astype(np.uint8)
         
    # Paste patch
    img_np[dst_y:dst_y+patch_h, dst_x:dst_x+patch_w] = patch
    
    return Image.fromarray(img_np)

def generate_dataset(base_dir, num_samples=100):
    """Generates the full dataset with train/val/test splits."""
    
    splits = {
        'train': int(num_samples * 0.7),
        'val': int(num_samples * 0.2),
        'test': int(num_samples * 0.1)
    }
    
    # Ensure splits sum up to num_samples due to rounding
    splits['train'] += num_samples - sum(splits.values())

    print(f"Generating {num_samples} samples per class (Authentic/Forged)...")
    print(f"Splits: Train: {splits['train']}, Val: {splits['val']}, Test: {splits['test']}")

    count = 1
    for split_name, split_count in splits.items():
        print(f"\nProcessing {split_name} split...")
        for i in range(split_count):
            # Generate Authentic
            auth_img = generate_natural_image()
            auth_path = os.path.join(base_dir, split_name, "authentic", f"authentic_{count:03d}.png")
            auth_img.save(auth_path)
            
            # Generate Forged (based on a newly generated natural image to avoid pairs in same split)
            base_forged = generate_natural_image()
            forged_img = apply_copy_move_forgery(base_forged)
            forged_path = os.path.join(base_dir, split_name, "forged", f"forged_{count:03d}.png")
            forged_img.save(forged_path)
            
            if count % 10 == 0 or i == split_count - 1:
                print(f"  Generated {i+1}/{split_count} pairs for {split_name}...")
                
            count += 1

if __name__ == "__main__":
    BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample")
    NUM_SAMPLES = 100
    
    print("=== Starting Synthetic Dataset Generation for DEMO MODE ===")
    create_directory_structure(BASE_DIR)
    generate_dataset(BASE_DIR, num_samples=NUM_SAMPLES)
    print("\n=== Dataset Generation Complete ===")
    print(f"Dataset located at: {BASE_DIR}")
