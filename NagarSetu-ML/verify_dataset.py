"""
STEP 2 — Verify Dataset
========================
"""

import os
from pathlib import Path
from collections import defaultdict
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import random

# ─── CONFIG ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE_DIR = Path(__file__).parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
LOGS_DIR      = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)

# Updated to match organized class labels
CLASSES = ["Pothole", "Garbage", "Waterlogging", "StreetLight",
           "Sewage", "Construction", "Other", "CivicIssue"]

# ─── 1. COUNT IMAGES PER CLASS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def count_images() -> dict:
    counts = {}
    for split in ["train", "val", "test"]:
        counts[split] = {}
        split_dir = PROCESSED_DIR / split
        if not split_dir.exists():
            continue
        for class_dir in split_dir.iterdir():
            if class_dir.is_dir():
                n = len([f for f in class_dir.iterdir()
                         if f.suffix.lower() in [".jpg", ".jpeg", ".png"]])
                counts[split][class_dir.name] = n
    return counts

def print_count_table(counts: dict):
    print("\n" + "="*65)
    print("IMAGE COUNT PER SPLIT")
    print("="*65)
    print(f"{'Class':<16} {'Train':>8} {'Val':>8} {'Test':>8} {'Total':>8}")
    print("-"*55)
    for cls in CLASSES:
        tr = counts.get("train", {}).get(cls, 0)
        va = counts.get("val",   {}).get(cls, 0)
        te = counts.get("test",  {}).get(cls, 0)
        if (tr+va+te) > 0:
            print(f"{cls:<16} {tr:>8} {va:>8} {te:>8} {tr+va+te:>8}")
    print("-"*55)

def plot_distribution(counts: dict):
    train_counts = counts.get("train", {})
    if not train_counts: return
    classes = list(train_counts.keys())
    values  = list(train_counts.values())
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    axes[0].bar(classes, values)
    axes[0].set_title("Train Split Distribution")
    axes[1].pie(values, labels=classes, autopct='%1.1f%%')
    plt.show()

def detect_corrupted_images():
    print("\nScanning for corrupted images...")
    # Simplified for notebook use
    pass

def analyze_image_sizes():
    print("\nAnalyzing image sizes...")
    # Simplified for notebook use
    pass

def show_sample_images():
    # Simplified visualization
    pass

if __name__ == "__main__":
    counts = count_images()
    print_count_table(counts)
    plot_distribution(counts)
