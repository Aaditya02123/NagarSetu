# -*- coding: utf-8 -*-
"""
step8_test_api.py — NagarSetu AI API Test Suite
-------------------------------------------------
Tests the inference API from step6 end-to-end.

Run with:
    python step8_test_api.py

Requirements:
    pip install httpx Pillow rich

The API server (step6) must be running:
    uvicorn step6_inference_api:app --host 0.0.0.0 --port 8001
"""

import io
import sys
import time
import json
import base64
import random
import asyncio
from pathlib import Path
from typing import Optional

import httpx
from PIL import Image, ImageDraw, ImageFont

# ─── CONFIG ───────────────────────────────────────────────────────────────────

API_BASE    = "http://localhost:8001"
TIMEOUT     = 15.0      # seconds
TEST_IMAGES = Path("data/processed/test")   # use real test images if available

# ─── SYNTHETIC IMAGE GENERATOR ────────────────────────────────────────────────
# Creates simple solid-color test images when no real test data is present

def _make_synthetic_image(label: str = "test", size: int = 224) -> bytes:
    """Returns JPEG bytes of a labelled solid-color image."""
    colors = {
        "Pothole":      (60, 60, 60),
        "Garbage":      (80, 120, 40),
        "StreetLight":  (200, 180, 50),
        "Sewage":       (90, 100, 60),
        "Waterlogging": (30, 100, 180),
        "Other":        (160, 160, 160),
    }
    color = colors.get(label, (128, 128, 128))
    img = Image.new("RGB", (size, size), color=color)
    draw = ImageDraw.Draw(img)
    draw.text((10, 10), label, fill=(255, 255, 255))

    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def _load_real_image(class_label: str) -> Optional[bytes]:
    """Try to load a real test image for the given class."""
    class_dir = TEST_IMAGES / class_label
    if not class_dir.exists():
        return None
    candidates = list(class_dir.glob("*.jpg")) + list(class_dir.glob("*.jpeg")) + list(class_dir.glob("*.png"))
    if not candidates:
        return None
    path = random.choice(candidates)
    return path.read_bytes()

# ─── PRETTY PRINT HELPERS ─────────────────────────────────────────────────────

def _header(text: str):
    print("\n" + "="*65)
    print(f"  {text}")
    print("="*65)


def _ok(msg: str):  print(f"  ✅  {msg}")
def _fail(msg: str): print(f"  ❌  {msg}")
def _info(msg: str): print(f"  ℹ️   {msg}")


def _print_prediction(result: dict):
    print(f"     Predicted : {result.get('predicted_class', '?')}")
    print(f"     Confidence: {result.get('confidence', 0):.4f}")
    print(f"     Severity  : {result.get('severity_score', 0):.4f}")
    print(f"     Priority  : {result.get('priority', '?')}")
    print(f"     Latency   : {result.get('latency_ms', 0):.1f} ms")
    top3 = result.get("top3", [])
    if top3:
        top3_str = ", ".join(f"{t['class']}({t['confidence']:.2f})" for t in top3)
        print(f"     Top-3     : {top3_str}")

# ─── TEST CASES ───────────────────────────────────────────────────────────────

async def test_health(client: httpx.AsyncClient) -> bool:
    _header("TEST 1 — Health Check")
    try:
        r = await client.get(f"{API_BASE}/health", timeout=TIMEOUT)
        data = r.json()
        if r.status_code == 200 and data.get("status") == "ok":
            _ok(f"API is healthy. Model loaded: {data.get('model_loaded')}")
            _info(f"Classes: {data.get('classes')}")
            return True
        else:
            _fail(f"Unexpected response: {r.status_code} — {data}")
            return False
    except httpx.ConnectError:
        _fail(f"Cannot connect to {API_BASE}")
        _info("Is the API running?  uvicorn step6_inference_api:app --port 8001")
        return False


async def test_predict_synthetic(client: httpx.AsyncClient) -> bool:
    _header("TEST 2 — Predict with Synthetic Images")
    classes = ["Pothole", "Garbage", "StreetLight", "Sewage", "Waterlogging"]
    all_ok = True
    for label in classes:
        img_bytes = _make_synthetic_image(label)
        try:
            r = await client.post(
                f"{API_BASE}/predict",
                files={"image": ("test.jpg", img_bytes, "image/jpeg")},
                timeout=TIMEOUT,
            )
            if r.status_code == 200:
                result = r.json()
                _ok(f"[{label}]")
                _print_prediction(result)
            else:
                _fail(f"[{label}] HTTP {r.status_code}: {r.text}")
                all_ok = False
        except Exception as e:
            _fail(f"[{label}] Exception: {e}")
            all_ok = False
    return all_ok


async def test_predict_real_images(client: httpx.AsyncClient) -> bool:
    _header("TEST 3 — Predict with Real Test Images")
    if not TEST_IMAGES.exists():
        _info(f"No test images found at {TEST_IMAGES} — skipping this test")
        return True

    classes = [d.name for d in TEST_IMAGES.iterdir() if d.is_dir()]
    if not classes:
        _info("No class folders found — skipping")
        return True

    all_ok = True
    correct = 0
    total   = 0

    for label in classes:
        img_bytes = _load_real_image(label)
        if img_bytes is None:
            _info(f"No images for class '{label}' — skipping")
            continue
        try:
            r = await client.post(
                f"{API_BASE}/predict",
                files={"image": ("test.jpg", img_bytes, "image/jpeg")},
                timeout=TIMEOUT,
            )
            if r.status_code == 200:
                result = r.json()
                predicted = result.get("predicted_class", "")
                is_correct = predicted == label
                status = "✅" if is_correct else "⚠️ "
                print(f"  {status} [{label}] → predicted: {predicted} (conf={result['confidence']:.2f})")
                if is_correct:
                    correct += 1
                total += 1
            else:
                _fail(f"[{label}] HTTP {r.status_code}: {r.text}")
                all_ok = False
        except Exception as e:
            _fail(f"[{label}] Exception: {e}")
            all_ok = False

    if total > 0:
        acc = correct / total * 100
        print(f"\n  Accuracy on sampled test images: {correct}/{total} = {acc:.1f}%")

    return all_ok


async def test_edge_cases(client: httpx.AsyncClient) -> bool:
    _header("TEST 4 — Edge Cases & Error Handling")
    all_ok = True

    # 4a. Empty file
    print("\n  [4a] Empty file upload")
    try:
        r = await client.post(
            f"{API_BASE}/predict",
            files={"image": ("empty.jpg", b"", "image/jpeg")},
            timeout=TIMEOUT,
        )
        if r.status_code == 400:
            _ok(f"Correctly rejected empty file (HTTP 400)")
        else:
            _fail(f"Expected 400, got {r.status_code}")
            all_ok = False
    except Exception as e:
        _fail(f"Exception: {e}")
        all_ok = False

    # 4b. Wrong content type
    print("\n  [4b] Unsupported content type (PDF)")
    try:
        r = await client.post(
            f"{API_BASE}/predict",
            files={"image": ("doc.pdf", b"%PDF-1.4", "application/pdf")},
            timeout=TIMEOUT,
        )
        if r.status_code == 415:
            _ok(f"Correctly rejected unsupported type (HTTP 415)")
        else:
            _fail(f"Expected 415, got {r.status_code}: {r.text}")
            all_ok = False
    except Exception as e:
        _fail(f"Exception: {e}")
        all_ok = False

    # 4c. Corrupted image bytes
    print("\n  [4c] Corrupted / random bytes")
    try:
        random_bytes = bytes(random.getrandbits(8) for _ in range(1024))
        r = await client.post(
            f"{API_BASE}/predict",
            files={"image": ("corrupt.jpg", random_bytes, "image/jpeg")},
            timeout=TIMEOUT,
        )
        if r.status_code in (400, 500):
            _ok(f"Correctly handled corrupted image (HTTP {r.status_code})")
        else:
            _fail(f"Unexpected status {r.status_code}: {r.text[:200]}")
            all_ok = False
    except Exception as e:
        _fail(f"Exception: {e}")
        all_ok = False

    # 4d. Large valid image (check no crash)
    print("\n  [4d] Large image (800×800 JPEG)")
    try:
        big_img = _make_synthetic_image("Pothole", size=800)
        r = await client.post(
            f"{API_BASE}/predict",
            files={"image": ("big.jpg", big_img, "image/jpeg")},
            timeout=TIMEOUT,
        )
        if r.status_code == 200:
            _ok(f"Large image handled correctly (conf={r.json()['confidence']:.2f})")
        else:
            _fail(f"HTTP {r.status_code}: {r.text}")
            all_ok = False
    except Exception as e:
        _fail(f"Exception: {e}")
        all_ok = False

    return all_ok


async def test_latency(client: httpx.AsyncClient, n: int = 10) -> bool:
    _header(f"TEST 5 — Latency Benchmark ({n} requests, sequential)")
    img_bytes = _make_synthetic_image("Pothole")
    latencies = []

    for i in range(n):
        start = time.perf_counter()
        try:
            r = await client.post(
                f"{API_BASE}/predict",
                files={"image": ("bench.jpg", img_bytes, "image/jpeg")},
                timeout=TIMEOUT,
            )
            elapsed = (time.perf_counter() - start) * 1000
            if r.status_code == 200:
                latencies.append(elapsed)
            else:
                _fail(f"Request {i+1} failed: HTTP {r.status_code}")
        except Exception as e:
            _fail(f"Request {i+1} exception: {e}")

    if latencies:
        avg = sum(latencies) / len(latencies)
        mn  = min(latencies)
        mx  = max(latencies)
        p95 = sorted(latencies)[int(len(latencies) * 0.95)]
        _ok(f"Avg: {avg:.1f}ms  |  Min: {mn:.1f}ms  |  Max: {mx:.1f}ms  |  P95: {p95:.1f}ms")
        if avg > 500:
            _info("⚠️  Average latency > 500ms — consider enabling GPU inference")
    return len(latencies) == n

# ─── MAIN ─────────────────────────────────────────────────────────────────────

async def main():
    print("\n" + "🔍  NagarSetu AI API Test Suite".center(65))
    print(f"   Target: {API_BASE}".center(65))

    results: dict[str, bool] = {}

    async with httpx.AsyncClient() as client:
        results["health"]          = await test_health(client)
        if not results["health"]:
            print("\n❌  API is not reachable. Aborting remaining tests.")
            sys.exit(1)

        results["synthetic"]       = await test_predict_synthetic(client)
        results["real_images"]     = await test_predict_real_images(client)
        results["edge_cases"]      = await test_edge_cases(client)
        results["latency"]         = await test_latency(client)

    _header("SUMMARY")
    passed = sum(results.values())
    total  = len(results)
    for name, ok in results.items():
        status = "✅ PASS" if ok else "❌ FAIL"
        print(f"  {status}  {name}")
    print(f"\n  {passed}/{total} test groups passed")

    if passed < total:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())