#Step-1

import os
import shutil
import random
from pathlib import Path
from collections import defaultdict

# ─── CONFIG ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE_DIR = Path(__file__).parent.parent
RAW_DIR       = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

# Updated MAP with the verified nested paths
DATASET_MAP = {
    "pothole_raw":                                          "Pothole",
    "garbage_raw":                                          "Garbage",
    "civic_issue_raw/civic-issue-dataset/images/potholes":  "Pothole",
    "civic_issue_raw/civic-issue-dataset/images/garbage":   "Garbage",
    "civic_issue_raw/civic-issue-dataset/images/open_manhole":"Sewage",
    "civic_issue_raw/civic-issue-dataset/images/streetlight_bad": "StreetLight",
    "civic_issue_raw/civic-issue-dataset/images/road_normal": "Other",
}

if PROCESSED_DIR.exists():
    shutil.rmtree(PROCESSED_DIR)

SPLITS = {"train": 0.70, "val": 0.15, "test": 0.15}
SEED   = 42
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

def collect_images(folder: Path) -> list[Path]:
    images = []
    for ext in VALID_EXTENSIONS:
        images.extend(folder.glob(f"*{ext}"))
        images.extend(folder.glob(f"*{ext.upper()}"))
    return images

def split_files(files: list, seed: int = SEED) -> dict:
    random.seed(seed)
    random.shuffle(files)
    n = len(files)
    n_train = int(n * SPLITS["train"])
    n_val = int(n * SPLITS["val"])
    return {"train": files[:n_train], "val": files[n_train:n_train + n_val], "test": files[n_train + n_val:]}

def copy_files(files: list[Path], dest_dir: Path):
    dest_dir.mkdir(parents=True, exist_ok=True)
    for i, src in enumerate(files):
        dest = dest_dir / f"{i:06d}_{src.name}"
        shutil.copy2(src, dest)

def organize_datasets():
    print("\nNagarSetu — Dataset Organizer (Granular Labels)")
    print("="*60)
    for split in SPLITS:
        for label in set(DATASET_MAP.values()):
            (PROCESSED_DIR / split / label).mkdir(parents=True, exist_ok=True)
    for raw_folder, label in DATASET_MAP.items():
        source_dir = RAW_DIR / raw_folder
        if not source_dir.exists(): continue
        images = collect_images(source_dir)
        if not images: continue
        print(f"\n  Processing {label} from {raw_folder} ({len(images)} images)")
        splits = split_files(images)
        for split_name, files_in_split in splits.items():
            dest = PROCESSED_DIR / split_name / label
            copy_files(files_in_split, dest)
    print("\nOrganized dataset saved to: ", PROCESSED_DIR)

if __name__ == "__main__":
    organize_datasets()