"""
Evaluation script for the trained model.
"""
import os
import argparse
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, roc_curve
import matplotlib.pyplot as plt
import seaborn as sns
from fusion_model import MODEL_INPUT_SHAPE

def main():
    parser = argparse.ArgumentParser(description="Evaluate Forgery Detection Model")
    parser.add_argument("--model-path", type=str, required=True, help="Path to the trained model (.keras file)")
    parser.add_argument("--test-dir", type=str, required=True, help="Directory containing test dataset")
    parser.add_argument("--output-dir", type=str, default="evaluation_results", help="Output directory for reports and plots")
    args = parser.parse_args()
    
    os.makedirs(args.output_dir, exist_ok=True)
    
    print(f"Loading model from {args.model_path}")
    model = tf.keras.models.load_model(args.model_path)
    
    test_datagen = ImageDataGenerator(rescale=1./255)
    test_generator = test_datagen.flow_from_directory(
        args.test_dir,
        target_size=MODEL_INPUT_SHAPE[:2],
        batch_size=32,
        class_mode='binary',
        shuffle=False
    )
    
    print("Evaluating model — collecting batches ...")
    # The fusion model has 3 inputs; feed the same array to all three.
    all_X, all_y = [], []
    for i in range(len(test_generator)):
        X_batch, y_batch = test_generator[i]
        all_X.append(X_batch)
        all_y.extend(y_batch)

    X_all = np.concatenate(all_X, axis=0)
    y_true = np.array(all_y).astype(int)

    print(f"Running predictions on {len(y_true)} images …")
    y_pred_prob = model.predict([X_all, X_all, X_all]).flatten()
    y_pred = (y_pred_prob >= 0.5).astype(int)
    
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred)
    rec = recall_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)
    auc = roc_auc_score(y_true, y_pred_prob)
    
    print(f"Accuracy: {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall: {rec:.4f}")
    print(f"F1 Score: {f1:.4f}")
    print(f"ROC AUC: {auc:.4f}")
    
    # Save report
    report = {
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1_score": float(f1),
        "roc_auc": float(auc)
    }
    with open(os.path.join(args.output_dir, 'evaluation_report.json'), 'w') as f:
        json.dump(report, f, indent=4)
        
    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8,6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Authentic', 'Forged'], yticklabels=['Authentic', 'Forged'])
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig(os.path.join(args.output_dir, 'confusion_matrix.png'))
    plt.close()
    
    # ROC Curve
    fpr, tpr, _ = roc_curve(y_true, y_pred_prob)
    plt.figure(figsize=(8,6))
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (area = {auc:.2f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic')
    plt.legend(loc="lower right")
    plt.savefig(os.path.join(args.output_dir, 'roc_curve.png'))
    plt.close()
    
    print(f"Evaluation complete. Results saved to {args.output_dir}")

if __name__ == "__main__":
    main()
