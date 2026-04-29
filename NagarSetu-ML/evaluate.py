# -*- coding: utf-8 -*-
"""
step4_evaluate.py — NagarSetu Model Evaluation
------------------------------------------------
Loads the best checkpoint, runs inference on the test split,
and produces:
  • Overall accuracy
  • Per-class Precision / Recall / F1 table
  • Confusion matrix heatmap  → logs/confusion_matrix.png
  • Full classification report → logs/classification_report.txt
"""

import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    f1_score,
    accuracy_score,
)

# ─── CONFIG ───────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent.parent
DATA_DIR   = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "models"
LOGS_DIR   = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)

CHECKPOINT = MODELS_DIR / "nagarsetu_best.pt"

CONFIG = {
    "num_classes": 5,
    "image_size":  224,
    "batch_size":  32,
    "device":      "cuda" if torch.cuda.is_available() else "cpu",
}

# ─── TRANSFORMS (same as val in training) ─────────────────────────────────────

val_transforms = transforms.Compose([
    transforms.Resize((CONFIG["image_size"], CONFIG["image_size"])),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# ─── MODEL BUILDER (must match step3) ─────────────────────────────────────────

def build_model(num_classes: int):
    model = models.mobilenet_v3_small(weights=None)
    in_features = model.classifier[0].in_features
    model.classifier = nn.Sequential(
        nn.Linear(in_features, 256),
        nn.Hardswish(),
        nn.Dropout(p=0.3),
        nn.Linear(256, num_classes),
    )
    return model

# ─── LOAD CHECKPOINT ──────────────────────────────────────────────────────────

def load_model(checkpoint_path: Path, num_classes: int, device: str):
    model = build_model(num_classes)
    state = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(state)
    model.to(device)
    model.eval()
    print(f"✅ Loaded checkpoint: {checkpoint_path}")
    return model

# ─── INFERENCE ────────────────────────────────────────────────────────────────

@torch.no_grad()
def run_inference(model, loader, device):
    all_preds  = []
    all_labels = []
    for imgs, labels in loader:
        imgs = imgs.to(device)
        logits = model(imgs)
        preds  = logits.argmax(dim=1).cpu().numpy()
        all_preds.extend(preds)
        all_labels.extend(labels.numpy())
    return np.array(all_labels), np.array(all_preds)

# ─── METRICS ──────────────────────────────────────────────────────────────────

def print_and_save_report(y_true, y_pred, class_names):
    report = classification_report(y_true, y_pred, target_names=class_names, digits=4)

    print("\n" + "="*65)
    print("CLASSIFICATION REPORT")
    print("="*65)
    print(report)

    report_path = LOGS_DIR / "classification_report.txt"
    with open(report_path, "w") as f:
        f.write(report)
    print(f"✅ Report saved → {report_path}")

    # Per-class F1 summary table
    f1_per_class = f1_score(y_true, y_pred, average=None)
    macro_f1     = f1_score(y_true, y_pred, average="macro")
    accuracy     = accuracy_score(y_true, y_pred)

    print("\n" + "="*45)
    print(f"{'Class':<18} {'F1':>8}")
    print("-"*30)
    for cls, f1 in zip(class_names, f1_per_class):
        bar = "█" * int(f1 * 20)
        print(f"  {cls:<16} {f1:.4f}  {bar}")
    print("-"*30)
    print(f"  {'Macro F1':<16} {macro_f1:.4f}")
    print(f"  {'Accuracy':<16} {accuracy:.4f}")
    print("="*45)

    return accuracy, macro_f1

# ─── CONFUSION MATRIX ─────────────────────────────────────────────────────────

def plot_confusion_matrix(y_true, y_pred, class_names):
    cm = confusion_matrix(y_true, y_pred)
    cm_normalized = cm.astype(float) / cm.sum(axis=1, keepdims=True)

    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    # Raw counts
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=class_names, yticklabels=class_names, ax=axes[0])
    axes[0].set_title("Confusion Matrix (Counts)")
    axes[0].set_xlabel("Predicted")
    axes[0].set_ylabel("Actual")

    # Normalized
    sns.heatmap(cm_normalized, annot=True, fmt=".2f", cmap="Blues",
                xticklabels=class_names, yticklabels=class_names, ax=axes[1])
    axes[1].set_title("Confusion Matrix (Normalized)")
    axes[1].set_xlabel("Predicted")
    axes[1].set_ylabel("Actual")

    plt.tight_layout()
    save_path = LOGS_DIR / "confusion_matrix.png"
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.show()
    print(f"✅ Confusion matrix saved → {save_path}")

# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    device = CONFIG["device"]
    print(f"NagarSetu — Evaluation | Device: {device}")

    # Dataset
    test_ds = datasets.ImageFolder(DATA_DIR / "test", transform=val_transforms)
    test_loader = DataLoader(test_ds, batch_size=CONFIG["batch_size"],
                             shuffle=False, num_workers=2)

    class_names = test_ds.classes
    print(f"Classes detected: {class_names}")
    print(f"Test samples:     {len(test_ds)}")

    # Model
    model = load_model(CHECKPOINT, len(class_names), device)

    # Inference
    print("\nRunning inference on test set...")
    y_true, y_pred = run_inference(model, test_loader, device)

    # Metrics
    accuracy, macro_f1 = print_and_save_report(y_true, y_pred, class_names)

    # Confusion matrix
    plot_confusion_matrix(y_true, y_pred, class_names)

    # Save summary JSON (useful for step6 API health endpoint)
    summary = {
        "accuracy":  round(float(accuracy), 4),
        "macro_f1":  round(float(macro_f1), 4),
        "classes":   class_names,
        "num_test_samples": len(test_ds),
    }
    summary_path = LOGS_DIR / "eval_summary.json"
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"✅ Summary saved  → {summary_path}")


if __name__ == "__main__":
    main()