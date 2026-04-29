#Step-3

import os
import json
import time
import copy
from pathlib import Path
from datetime import datetime

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import datasets, models, transforms

import matplotlib.pyplot as plt
import numpy as np

# ─── CONFIG ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Fix for Colab: replace Path(__file__) with os.getcwd()
BASE_DIR = Path(__file__).parent.parent
DATA_DIR   = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "models"
LOGS_DIR   = BASE_DIR / "logs"

MODELS_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

# Training hyperparameters
CONFIG = {
    "model_name":        "mobilenet_v3_small",
    "num_classes":       5,          # Updated to 5 granular classes
    "image_size":        224,
    "batch_size":        32,
    "num_epochs":        40,
    "lr_head":           1e-3,
    "lr_finetune":       1e-4,
    "weight_decay":      1e-4,
    "patience":          7,
    "unfreeze_epoch":    10,
    "device":            "cuda" if torch.cuda.is_available() else "cpu",
}

# ─── DATA AUGMENTATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

train_transforms = transforms.Compose([
    transforms.Resize((CONFIG["image_size"] + 32, CONFIG["image_size"] + 32)),
    transforms.RandomCrop(CONFIG["image_size"]),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.3, contrast=0.3),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

val_transforms = transforms.Compose([
    transforms.Resize((CONFIG["image_size"], CONFIG["image_size"])),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# ─── LOADING FUNCTIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def load_datasets():
    return {
        "train": datasets.ImageFolder(DATA_DIR / "train", transform=train_transforms),
        "val":   datasets.ImageFolder(DATA_DIR / "val",   transform=val_transforms),
        "test":  datasets.ImageFolder(DATA_DIR / "test",  transform=val_transforms),
    }

def make_weighted_sampler(dataset):
    class_counts = np.bincount(dataset.targets)
    weights_per_class = 1.0 / class_counts.astype(float)
    sample_weights = weights_per_class[dataset.targets]
    return WeightedRandomSampler(weights=sample_weights, num_samples=len(sample_weights), replacement=True)

def make_dataloaders(datasets_dict):
    sampler = make_weighted_sampler(datasets_dict["train"])
    return {
        "train": DataLoader(datasets_dict["train"], batch_size=CONFIG["batch_size"], sampler=sampler, num_workers=2),
        "val": DataLoader(datasets_dict["val"], batch_size=CONFIG["batch_size"], shuffle=False, num_workers=2),
        "test": DataLoader(datasets_dict["test"], batch_size=CONFIG["batch_size"], shuffle=False, num_workers=2),
    }

def build_model():
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1)
    for param in model.parameters(): param.requires_grad = False
    in_features = model.classifier[0].in_features
    model.classifier = nn.Sequential(
        nn.Linear(in_features, 256),
        nn.Hardswish(),
        nn.Dropout(p=0.3),
        nn.Linear(256, CONFIG["num_classes"])
    )
    return model

def unfreeze_top_layers(model, n_blocks=3):
    blocks = list(model.features.children())
    for block in blocks[-n_blocks:]:
        for param in block.parameters(): param.requires_grad = True

# ... (Training loop functions train_one_epoch and evaluate as defined in original script) ...
# I will reuse the core logic but ensure the main run block is clean

def train_one_epoch(model, loader, optimizer, criterion, device):
    model.train()
    rl, c, t = 0.0, 0, 0
    for imgs, lbs in loader:
        imgs, lbs = imgs.to(device), lbs.to(device)
        optimizer.zero_grad()
        outs = model(imgs)
        loss = criterion(outs, lbs)
        loss.backward()
        optimizer.step()
        rl += loss.item()
        _, pred = outs.max(1)
        c += pred.eq(lbs).sum().item()
        t += lbs.size(0)
    return rl/len(loader), 100.*c/t

@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    rl, c, t = 0.0, 0, 0
    for imgs, lbs in loader:
        imgs, lbs = imgs.to(device), lbs.to(device)
        outs = model(imgs)
        loss = criterion(outs, lbs)
        rl += loss.item()
        _, pred = outs.max(1)
        c += pred.eq(lbs).sum().item()
        t += lbs.size(0)
    return rl/len(loader), 100.*c/t

def train():
    print("\nNAGARSETU — Training Started")
    ds = load_datasets()
    ld = make_dataloaders(ds)
    device = torch.device(CONFIG["device"])
    model = build_model().to(device)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=CONFIG["lr_head"])

    best_acc = 0.0
    history = {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []}

    for epoch in range(1, CONFIG["num_epochs"] + 1):
        if epoch == CONFIG["unfreeze_epoch"]:
            unfreeze_top_layers(model)
            for pg in optimizer.param_groups: pg["lr"] = CONFIG["lr_finetune"]

        tl, ta = train_one_epoch(model, ld["train"], optimizer, criterion, device)
        vl, va = evaluate(model, ld["val"], criterion, device)

        history["train_loss"].append(tl)
        history["val_loss"].append(vl)
        history["train_acc"].append(ta)
        history["val_acc"].append(va)

        print(f"Epoch {epoch}: Train Acc {ta:.1f}% | Val Acc {va:.1f}%")

        if va > best_acc:
            best_acc = va
            torch.save(model.state_dict(), MODELS_DIR / "nagarsetu_best.pt")

    print(f"\nTraining complete. Best Val Acc: {best_acc:.1f}%")
    return model, ds["train"].classes, history

if __name__ == "__main__":
    model, class_names, history = train()