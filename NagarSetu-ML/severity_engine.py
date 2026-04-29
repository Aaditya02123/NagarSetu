# -*- coding: utf-8 -*-
"""
step7_severity_engine.py — NagarSetu Severity Scoring Logic
------------------------------------------------------------
A pure-Python module (no PyTorch / ONNX dependency) that takes
the raw AI prediction output and computes:

  • severity_score  (0.0 – 1.0 float)
  • priority        ("Low" | "Medium" | "High")
  • suggested_dept  — which NagarSetu department to auto-assign
  • escalation_flag — True if the complaint should skip the queue

Import this module from step6_inference_api.py or from your main
NagarSetu FastAPI backend (complaints.py / complaint_service.py).

Usage:
    from step7_severity_engine import compute_severity, DEPT_ROUTING

    result = compute_severity(
        predicted_class="Pothole",
        confidence=0.91,
        location_hint="highway",     # optional free-text from complaint form
        time_of_day=14,              # hour (0–23), optional
    )
    print(result)
    # SeverityResult(score=0.87, priority='High', dept='NHAI', escalate=True)
"""

from __future__ import annotations

import math
from dataclasses import dataclass, asdict
from typing import Optional

# ─── CLASS-LEVEL BASE WEIGHTS ─────────────────────────────────────────────────
# Higher = more urgent / dangerous by nature
# Tune these based on domain knowledge or feedback data

BASE_SEVERITY: dict[str, float] = {
    "Pothole":      0.80,
    "Sewage":       0.88,
    "Waterlogging": 0.78,
    "Garbage":      0.60,
    "StreetLight":  0.58,
    "Construction": 0.70,
    "Traffic":      0.72,
    "Infrastructure": 0.75,
    "Other":        0.45,
}

# ─── DEPARTMENT ROUTING TABLE ─────────────────────────────────────────────────
# Maps class → default NagarSetu department name
# These must match the DEPARTMENTS list in your Complaints.jsx frontend

DEPT_ROUTING: dict[str, str] = {
    "Pothole":      "PWD Department",
    "Sewage":       "Municipal Corporation",
    "Waterlogging": "Municipal Corporation",
    "Garbage":      "Municipal Corporation",
    "StreetLight":  "Electricity Dept",
    "Construction": "NHAI",
    "Traffic":      "Traffic Police",
    "Infrastructure":"PWD Department",
    "Other":        "Municipal Corporation",
}

# ─── LOCATION KEYWORDS THAT BOOST SEVERITY ────────────────────────────────────
# If the complaint's location field contains these words, bump severity up

LOCATION_BOOST: dict[str, float] = {
    "highway":    0.10,
    "nhai":       0.10,
    "school":     0.08,
    "hospital":   0.12,
    "market":     0.06,
    "main road":  0.07,
    "national":   0.09,
    "signal":     0.06,
    "bridge":     0.09,
    "overpass":   0.08,
    "junction":   0.06,
}

# ─── TIME-OF-DAY MODIFIERS ────────────────────────────────────────────────────
# Night-time issues (street lights, unsafe roads) are more dangerous

def _time_modifier(hour: int, class_label: str) -> float:
    """Returns a small severity modifier based on time of day."""
    is_night = hour < 6 or hour >= 21

    if class_label == "StreetLight" and is_night:
        return +0.15    # broken light at night is high-risk
    if class_label in ("Waterlogging", "Pothole") and is_night:
        return +0.08    # harder to see at night
    if 7 <= hour <= 10 or 17 <= hour <= 20:
        return +0.04    # peak traffic — any issue is worse
    return 0.0

# ─── RESULT DATACLASS ─────────────────────────────────────────────────────────

@dataclass
class SeverityResult:
    score:         float    # final 0.0–1.0 severity
    priority:      str      # "Low" | "Medium" | "High"
    dept:          str      # suggested department
    escalate:      bool     # True = auto-escalate, skip normal queue
    breakdown:     dict     # for logging/debugging

    def to_dict(self) -> dict:
        return asdict(self)

# ─── PRIORITY THRESHOLDS ──────────────────────────────────────────────────────

def _score_to_priority(score: float) -> tuple[str, bool]:
    if score >= 0.80:
        return "High",   True    # High → escalate immediately
    if score >= 0.50:
        return "Medium", False
    return "Low",        False

# ─── MAIN FUNCTION ────────────────────────────────────────────────────────────

def compute_severity(
    predicted_class: str,
    confidence:      float,
    location_hint:   Optional[str] = None,
    time_of_day:     Optional[int] = None,    # 0–23
) -> SeverityResult:
    """
    Compute severity score for a predicted complaint.

    Parameters
    ----------
    predicted_class : str
        Class label returned by the AI model (e.g. "Pothole").
    confidence : float
        Model confidence [0.0, 1.0].
    location_hint : str, optional
        Free-text location from the complaint form (city, landmark, road name).
    time_of_day : int, optional
        Hour of complaint submission (0–23). Uses current hour if None.

    Returns
    -------
    SeverityResult
    """
    # 1. Base score: blend class weight × model confidence
    base_weight = BASE_SEVERITY.get(predicted_class, 0.5)
    base_score  = 0.6 * base_weight + 0.4 * confidence    # weighted blend

    # 2. Location boost
    location_bonus = 0.0
    if location_hint:
        hint_lower = location_hint.lower()
        for keyword, boost in LOCATION_BOOST.items():
            if keyword in hint_lower:
                location_bonus += boost
        location_bonus = min(location_bonus, 0.20)    # cap at +0.20

    # 3. Time-of-day modifier
    if time_of_day is None:
        from datetime import datetime
        time_of_day = datetime.now().hour
    time_bonus = _time_modifier(time_of_day, predicted_class)

    # 4. Final score (clamped to [0, 1])
    raw_score    = base_score + location_bonus + time_bonus
    final_score  = round(min(max(raw_score, 0.0), 1.0), 4)

    priority, escalate = _score_to_priority(final_score)
    dept = DEPT_ROUTING.get(predicted_class, "Municipal Corporation")

    breakdown = {
        "base_weight":     base_weight,
        "confidence":      round(confidence, 4),
        "base_score":      round(base_score, 4),
        "location_bonus":  round(location_bonus, 4),
        "time_bonus":      round(time_bonus, 4),
        "final_score":     final_score,
    }

    return SeverityResult(
        score    = final_score,
        priority = priority,
        dept     = dept,
        escalate = escalate,
        breakdown= breakdown,
    )

# ─── BATCH UTILITY ────────────────────────────────────────────────────────────

def compute_batch_severity(predictions: list[dict]) -> list[SeverityResult]:
    """
    Convenience wrapper for a list of prediction dicts (as returned by step6).
    Each dict must have: predicted_class, confidence.
    Optional keys: location_hint, time_of_day.
    """
    return [
        compute_severity(
            predicted_class = p["predicted_class"],
            confidence      = p["confidence"],
            location_hint   = p.get("location_hint"),
            time_of_day     = p.get("time_of_day"),
        )
        for p in predictions
    ]

# ─── DEMO / STANDALONE RUN ────────────────────────────────────────────────────

if __name__ == "__main__":
    test_cases = [
        {"predicted_class": "Pothole",      "confidence": 0.92, "location_hint": "highway near school", "time_of_day": 22},
        {"predicted_class": "StreetLight",  "confidence": 0.78, "location_hint": "market road",         "time_of_day": 21},
        {"predicted_class": "Garbage",      "confidence": 0.65, "location_hint": "colony lane",         "time_of_day": 10},
        {"predicted_class": "Waterlogging", "confidence": 0.88, "location_hint": "main road junction",  "time_of_day": 8},
        {"predicted_class": "Other",        "confidence": 0.55, "location_hint": "side street",         "time_of_day": 14},
    ]

    print("NagarSetu — Severity Engine Demo")
    print("="*70)
    print(f"{'Class':<14} {'Conf':>6} {'Score':>7} {'Priority':>8} {'Dept':<22} {'Escalate'}")
    print("-"*70)

    for tc in test_cases:
        r = compute_severity(**tc)
        print(
            f"{tc['predicted_class']:<14} "
            f"{tc['confidence']:>6.2f} "
            f"{r.score:>7.4f} "
            f"{r.priority:>8} "
            f"{r.dept:<22} "
            f"{'🚨 YES' if r.escalate else 'no'}"
        )

    print("\nDetailed breakdown for first case:")
    r = compute_severity(**test_cases[0])
    for k, v in r.breakdown.items():
        print(f"  {k:<18} {v}")