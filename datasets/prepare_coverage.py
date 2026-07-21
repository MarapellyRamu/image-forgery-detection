import os
import shutil
import argparse
import random

def print_instructions():
    print("""
=== COVERAGE Dataset Setup ===

Instructions:
1. Download the COVERAGE (Copy-Move Forgery Dataset).
   - Source: https://github.com/wenbihan/coverage
2. Extract the archive (should contain image/ and mask/ folders; we need image/).
3. Run this script pointing to the extracted directory:
   python prepare_coverage.py --input-dir /path/to/extracted/coverage/image
""")

def organize_dataset(input_dir, output_dir, split_ratio=(0.7, 0.2, 0.1)):
    """Organizes COVERAGE images into train/val/test splits."""
    if not os.path.exists(input_dir):
        print(f"Error: Input directory '{input_dir}' does not exist.")
        return

    au_files, tp_files = [], []
    for root, _, files in os.walk(input_dir):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.tif')):
                full_path = os.path.join(root, file)
                if 't' in file.lower() or 'forged' in file.lower():
                    tp_files.append(full_path)
                else: # Assuming pristine if not marked tampered
                    au_files.append(full_path)

    print(f"Found {len(au_files)} Authentic and {len(tp_files)} Tampered images.")
    if not au_files or not tp_files: return

    random.seed(42)
    random.shuffle(au_files)
    random.shuffle(tp_files)

    def distribute(files, class_name):
        n_train = int(len(files) * split_ratio[0])
        n_val = int(len(files) * split_ratio[1])
        splits = {'train': files[:n_train], 'val': files[n_train:n_train + n_val], 'test': files[n_train + n_val:]}
        
        for split_name, file_list in splits.items():
            dest_dir = os.path.join(output_dir, split_name, class_name)
            os.makedirs(dest_dir, exist_ok=True)
            for file_path in file_list:
                shutil.copy2(file_path, os.path.join(dest_dir, os.path.basename(file_path)))
            print(f"  Copied {len(file_list)} files to {split_name}/{class_name}")

    print("\nOrganizing Authentic images...")
    distribute(au_files, 'authentic')
    print("\nOrganizing Forged images...")
    distribute(tp_files, 'forged')
    print(f"\nDataset ready at: {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", type=str, help="Path to raw dataset")
    args = parser.parse_args()
    if not args.input_dir:
        print_instructions()
    else:
        organize_dataset(args.input_dir, os.path.join(os.path.dirname(__file__), "coverage"))
