import os
import shutil
import argparse
import random

def print_instructions():
    print("""
=== CASIA Image Tampering Detection Dataset Setup ===

The CASIA dataset is a standard benchmark for image forgery detection.
Due to licensing, you must download it manually.

Instructions:
1. Request access or download CASIA v1.0 and/or CASIA v2.0 from official sources or Kaggle.
   - Example Kaggle Link: https://www.kaggle.com/datasets/sophatvathana/casia-dataset
2. Extract the downloaded archive. You should see folders named 'Au' (Authentic) and 'Tp' (Tampered).
3. Run this script pointing to the extracted directory:
   python prepare_casia.py --input-dir /path/to/extracted/casia

Dataset Paper Citation:
Dong, J., Wang, W., & Tan, T. (2013). CASIA Image Tampering Detection Evaluation Database. 
IEEE China Summit and International Conference on Signal and Information Processing.
""")

def organize_dataset(input_dir, output_dir, split_ratio=(0.7, 0.2, 0.1)):
    """Organizes CASIA images into train/val/test splits."""
    
    if not os.path.exists(input_dir):
        print(f"Error: Input directory '{input_dir}' does not exist.")
        return

    # Find Au and Tp folders (handling potential subdirectories for v1/v2)
    au_files = []
    tp_files = []
    
    for root, _, files in os.walk(input_dir):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.tif', '.tiff')):
                full_path = os.path.join(root, file)
                # Heuristics to determine class based on typical CASIA naming/folder structure
                if 'Au' in root or 'au' in file.lower() or 'authentic' in root.lower():
                    au_files.append(full_path)
                elif 'Tp' in root or 'tp' in file.lower() or 'tampered' in root.lower():
                    tp_files.append(full_path)

    if not au_files or not tp_files:
         print("Error: Could not find sufficient Authentic or Tampered images. Please check the input directory structure.")
         print(f"Found: {len(au_files)} Authentic, {len(tp_files)} Tampered.")
         return

    print(f"Found {len(au_files)} Authentic images.")
    print(f"Found {len(tp_files)} Tampered images.")

    # Shuffle for random splits
    random.seed(42)
    random.shuffle(au_files)
    random.shuffle(tp_files)

    def distribute_files(files, class_name):
        n_total = len(files)
        n_train = int(n_total * split_ratio[0])
        n_val = int(n_total * split_ratio[1])
        
        splits = {
            'train': files[:n_train],
            'val': files[n_train:n_train + n_val],
            'test': files[n_train + n_val:]
        }
        
        count = 0
        for split_name, file_list in splits.items():
            dest_dir = os.path.join(output_dir, split_name, class_name)
            os.makedirs(dest_dir, exist_ok=True)
            
            for file_path in file_list:
                filename = os.path.basename(file_path)
                dest_path = os.path.join(dest_dir, filename)
                try:
                    shutil.copy2(file_path, dest_path)
                    count += 1
                except Exception as e:
                    print(f"Failed to copy {file_path}: {e}")
            print(f"  Copied {len(file_list)} files to {split_name}/{class_name}")
        return count

    print("\nOrganizing Authentic images...")
    auth_copied = distribute_files(au_files, 'authentic')
    
    print("\nOrganizing Tampered images...")
    forged_copied = distribute_files(tp_files, 'forged')
    
    print("\n=== Summary ===")
    print(f"Successfully processed {auth_copied + forged_copied} total images.")
    print(f"Dataset ready at: {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prepare CASIA dataset")
    parser.add_argument("--input-dir", type=str, help="Path to raw CASIA dataset")
    args = parser.parse_args()

    if not args.input_dir:
        print_instructions()
    else:
        OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "casia")
        organize_dataset(args.input_dir, OUTPUT_DIR)
