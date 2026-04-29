#Step - 0

import os
import shutil
import subprocess
from pathlib import Path

# ─── CONFIG ───────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent.parent
RAW_DIR  = BASE_DIR / "data" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ─── DATASETS TO DOWNLOAD ─────────────────────────────────────────────────────
# Format: (kaggle_dataset_slug, target_folder_name, class_label)
# Find slugs at kaggle.com — it's the part after kaggle.com/datasets/

DATASETS = [
    # Potholes
    {
        "slug":   "chitholian/annotated-potholes-dataset",
        "folder": "pothole_raw",
        "label":  "Pothole",
        "type":   "images"   # images or csv
    },
    # Garbage / Waste
    {
        "slug":   "asdasdasasdas/garbage-classification",
        "folder": "garbage_raw",
        "label":  "Garbage",
        "type":   "images"
    },
    # Street Lights / Infrastructure
    {
        "slug":   "siddheshvchavan/broken-street-lights",  # Updated slug
        "folder": "streetlight_raw",
        "label":  "StreetLight",
        "type":   "images"
    },
    # Waterlogging / Flooding
    {
        "slug":   "manishsubedi/flood-detection-image-dataset", # Updated slug
        "folder": "waterlogging_raw",
        "label":  "Waterlogging",
        "type":   "images"
    },
    # Sewage / Drainage
    {
        "slug":   "kabilanr/drainage-system-dataset",  # Updated slug
        "folder": "sewage_raw",
        "label":  "Sewage",
        "type":   "images"
    },
    #Streetlight,pothole,road,garbage
    {
        "slug":   "harirajharsh/civic-issue-reporting",
        "folder": "civic_issue_raw",
        "label":  "CivicIssue", # Placeholder label, adjust if needed
        "type":   "images"
    },
]

# ─── DOWNLOAD FUNCTION ────────────────────────────────────────────────────────

def download_dataset(slug: str, folder: str):
    """Download a Kaggle dataset into data/raw/<folder>"""
    dest = RAW_DIR / folder
    dest.mkdir(exist_ok=True)

    print(f"\n{'='*60}")
    print(f"Downloading: {slug}")
    print(f"Target:      {dest}")
    print(f"{'='*60}")

    result = subprocess.run(
        ["kaggle", "datasets", "download", "-d", slug,
         "--unzip", "-p", str(dest)],
        capture_output=True, text=True
    )

    if result.returncode == 0:
        print(f"✅ Success: {folder}")
        files = list(dest.rglob("*"))
        img_files = [f for f in files if f.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]]
        print(f"   Found {len(img_files)} images")
    else:
        print(f"❌ Failed: {folder}")
        print(f"   Error: {result.stderr}")
        print(f"   → Check the dataset slug at kaggle.com/datasets/{slug}")

    return result.returncode == 0


def check_kaggle_auth():
    """Verify kaggle credentials exist"""
    kaggle_json = Path.home() / ".kaggle" / "kaggle.json"
    if not kaggle_json.exists():
        print("❌ kaggle.json not found!")
        print("\nTo fix this:")
        print("  1. Go to kaggle.com → Your Account → API → Create New Token")
        print("  2. Download kaggle.json")
        print("  3. Move it to ~/.kaggle/kaggle.json")
        print("  4. Run: chmod 600 ~/.kaggle/kaggle.json")
        return False
    print("✅ Kaggle credentials found")
    return True


def list_available_civic_datasets():
    """Print recommended Kaggle search terms for each category"""
    print("\n" + "="*60)
    print("RECOMMENDED KAGGLE SEARCH TERMS PER CATEGORY")
    print("="*60)

    searches = {
        "Pothole":      ["pothole detection", "road damage dataset", "road crack"],
        "Garbage":      ["garbage classification", "waste detection", "trash dataset"],
        "Waterlogging": ["flood detection urban", "waterlogging dataset", "flooded road"],
        "StreetLight":  ["street light fault", "broken streetlight", "urban infrastructure"],
        "Sewage":       ["sewage overflow", "drain blockage", "manhole dataset"],
        "Construction": ["illegal construction", "road construction hazard"],
        "Other":        ["civic issues dataset", "municipal complaints", "311 service requests"],
    }

    for category, terms in searches.items():
        print(f"\n{category}:")
        for term in terms:
            print(f"  → kaggle.com/search?q={term.replace(' ', '+')}")


if __name__ == "__main__":
    print("NagarSetu — Dataset Downloader")
    print("="*60)

    if not check_kaggle_auth():
        list_available_civic_datasets()
        exit(1)

    list_available_civic_datasets()
    print("\n" + "="*60)
    print("Starting downloads...")

    success_count = 0
    for dataset in DATASETS:
        ok = download_dataset(dataset["slug"], dataset["folder"])
        if ok:
            success_count += 1

    print(f"\n{'='*60}")
    print(f"Downloaded {success_count}/{len(DATASETS)} datasets")
    print(f"Raw data location: {RAW_DIR}")
    print("\nNext step: Run step1_organize_dataset.py")
