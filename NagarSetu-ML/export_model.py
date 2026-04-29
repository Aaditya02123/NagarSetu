# -*- coding: utf-8 -*-
"""
step5_export_model.py — NagarSetu Model Export
-----------------------------------------------
Exports the trained MobileNetV3-Small checkpoint to:
  1. TorchScript  → models/nagarsetu_scripted.pt   (use in Python / mobile)
  2. ONNX         → models/nagarsetu.onnx           (use in FastAPI inference)

Also saves class_names.json so the API can map index → label.
"""

import os
import json
import numpy as np
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import datasets, models, transforms

# ─── CONFIG ───────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent.parent
DATA_DIR   = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(exist_ok=True)

CHECKPOINT_PT  = MODELS_DIR / "nagarsetu_best.pt"
SCRIPTED_PATH  = MODELS_DIR / "nagarsetu_scripted.pt"
ONNX_PATH      = MODELS_DIR / "nagarsetu.onnx"
CLASS_MAP_PATH = MODELS_DIR / "class_names.json"

CONFIG = {
    "num_classes": 5,
    "image_size":  224,
    "device":      "cpu",          # export always on CPU for portability
    "opset":       17,             # ONNX opset — compatible with onnxruntime ≥ 1.16
}

# ─── MODEL BUILDER ────────────────────────────────────────────────────────────

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

def load_model(num_classes: int) -> torch.nn.Module:
    model = build_model(num_classes)
    state = torch.load(CHECKPOINT_PT, map_location="cpu")
    model.load_state_dict(state)
    model.eval()
    print(f"✅ Checkpoint loaded from {CHECKPOINT_PT}")
    return model

# ─── RESOLVE CLASS NAMES ──────────────────────────────────────────────────────

def get_class_names() -> list[str]:
    """
    Reads class names from the processed dataset folder (same order
    ImageFolder would assign them — alphabetical).
    """
    train_dir = DATA_DIR / "train"
    if train_dir.exists():
        ds = datasets.ImageFolder(str(train_dir))
        return ds.classes
    # Fallback if dataset folder isn't available
    return ["Garbage", "Other", "Pothole", "Sewage", "StreetLight"]

# ─── EXPORT: TORCHSCRIPT ──────────────────────────────────────────────────────

def export_torchscript(model: torch.nn.Module):
    dummy = torch.zeros(1, 3, CONFIG["image_size"], CONFIG["image_size"])
    try:
        scripted = torch.jit.trace(model, dummy)
        scripted.save(str(SCRIPTED_PATH))
        size_mb = SCRIPTED_PATH.stat().st_size / 1e6
        print(f"✅ TorchScript saved  → {SCRIPTED_PATH}  ({size_mb:.1f} MB)")
    except Exception as e:
        print(f"❌ TorchScript export failed: {e}")

# ─── EXPORT: ONNX ─────────────────────────────────────────────────────────────

def export_onnx(model: torch.nn.Module, num_classes: int):
    dummy = torch.zeros(1, 3, CONFIG["image_size"], CONFIG["image_size"])
    try:
        torch.onnx.export(
            model,
            dummy,
            str(ONNX_PATH),
            opset_version        = CONFIG["opset"],
            input_names          = ["image"],
            output_names         = ["logits"],
            dynamic_axes         = {
                "image":  {0: "batch_size"},
                "logits": {0: "batch_size"},
            },
            export_params        = True,
            do_constant_folding  = True,
        )
        size_mb = ONNX_PATH.stat().st_size / 1e6
        print(f"✅ ONNX saved         → {ONNX_PATH}  ({size_mb:.1f} MB)")
    except Exception as e:
        print(f"❌ ONNX export failed: {e}")
        return

    # Validate with onnxruntime if installed
    try:
        import onnxruntime as ort
        sess = ort.InferenceSession(str(ONNX_PATH))
        dummy_np = np.zeros((1, 3, CONFIG["image_size"], CONFIG["image_size"]),
                            dtype=np.float32)
        out = sess.run(None, {"image": dummy_np})[0]
        assert out.shape == (1, num_classes), f"Unexpected output shape: {out.shape}"
        print(f"✅ ONNX validation OK  (output shape: {out.shape})")
    except ImportError:
        print("ℹ️  onnxruntime not installed — skipping ONNX validation")
        print("   pip install onnxruntime")
    except Exception as e:
        print(f"❌ ONNX validation failed: {e}")

# ─── SAVE CLASS MAP ───────────────────────────────────────────────────────────

def save_class_map(class_names: list[str]):
    mapping = {str(i): name for i, name in enumerate(class_names)}
    with open(CLASS_MAP_PATH, "w") as f:
        json.dump(mapping, f, indent=2)
    print(f"✅ Class map saved    → {CLASS_MAP_PATH}")
    print(f"   Mapping: {mapping}")

# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    print("NagarSetu — Model Export")
    print("="*50)

    class_names = get_class_names()
    num_classes  = len(class_names)
    print(f"Classes ({num_classes}): {class_names}")

    model = load_model(num_classes)

    print("\n[1/3] Exporting TorchScript...")
    export_torchscript(model)

    print("\n[2/3] Exporting ONNX...")
    export_onnx(model, num_classes)

    print("\n[3/3] Saving class map...")
    save_class_map(class_names)

    print("\n" + "="*50)
    print("Export complete. Files ready for deployment:")
    for p in [ONNX_PATH, SCRIPTED_PATH, CLASS_MAP_PATH]:
        exists = "✅" if p.exists() else "❌"
        print(f"  {exists} {p}")
    print("\nNext step: Run step6_inference_api.py")


if __name__ == "__main__":
    main()