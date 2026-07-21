# Datasets Guide

This directory contains scripts to prepare datasets for training the image forgery detection models.

## Section 1: Demo Mode (Synthetic Dataset)
For quick testing and development without downloading large files, you can generate a synthetic dataset.
```bash
python datasets/generate_sample.py
```
This will create a `sample` folder with generated authentic and copy-move forged images, split into train/val/test directories.

## Section 2: CASIA Dataset
The CASIA Image Tampering Detection Evaluation Database is a standard benchmark.
*   **CASIA v1.0 / v2.0**: Download from sources like [Kaggle](https://www.kaggle.com/datasets/sophatvathana/casia-dataset) or request from the authors.
*   **Citation**: Dong, J., Wang, W., & Tan, T. (2013). CASIA Image Tampering Detection Evaluation Database.
*   **Preparation**:
    ```bash
    python datasets/prepare_casia.py --input-dir /path/to/extracted/casia
    ```

## Section 3: Columbia Uncompressed Image Splicing Dataset
A dataset specifically for image splicing detection.
*   **Download**: [Official Link](http://www.ee.columbia.edu/ln/dvmm/downloads/authsplcuncmp/)
*   **Preparation**:
    ```bash
    python datasets/prepare_columbia.py --input-dir /path/to/extracted/columbia
    ```

## Section 4: COVERAGE Dataset
A database designed to evaluate copy-move forgery detection algorithms, focusing on similar objects.
*   **Download**: [GitHub Repository](https://github.com/wenbihan/coverage)
*   **Preparation**:
    ```bash
    python datasets/prepare_coverage.py --input-dir /path/to/extracted/coverage/image
    ```

## Section 5: Using Real Datasets
Once you have prepared a real dataset (e.g., CASIA), you can use it for training by pointing the training script to the generated folder:
```bash
python models/train.py --data-dir datasets/casia
```
Ensure you update the `.env` file or backend configuration if the application needs to load models trained on specific data.

## Section 6: Dataset Folder Structure
The preparation scripts organize all datasets into this standard structure expected by the training pipeline:
```
datasets/
├── <dataset_name>/ (e.g., sample, casia, columbia)
│   ├── train/
│   │   ├── authentic/  (Contains real images)
│   │   └── forged/     (Contains tampered images)
│   ├── val/
│   │   ├── authentic/
│   │   └── forged/
│   └── test/
│       ├── authentic/
│       └── forged/
```

## Section 7: Custom Datasets
To use your own dataset, organize your images into the folder structure shown in Section 6. The training scripts will automatically load images from these directories.
