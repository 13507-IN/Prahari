"""
Smart Priority Prediction.
Uses a rule-based scoring system that can be upgraded to a trained Random Forest
once real labeled data is available. Also handles severity escalation from duplicates.
"""
import re
from datetime import datetime

URGENCY_LEVELS = ["low", "medium", "high", "critical"]

# Emergency keywords weighted by urgency contribution
CRITICAL_KEYWORDS = [
    "emergency", "collapse", "died", "death", "fire", "flood", "explosion",
    "blast", "accident", "critical", "life threatening", "ambulance required"
]
HIGH_KEYWORDS = [
    "urgent", "danger", "dangerous", "severe", "serious", "injured",
    "blocked", "leak", "outbreak", "violence", "threat"
]
LOW_KEYWORDS = [
    "minor", "suggestion", "future", "eventually", "low priority",
    "small", "cosmetic", "maintenance"
]

# Categories that inherently carry higher urgency
HIGH_URGENCY_CATEGORIES = {"health", "safety"}
MEDIUM_URGENCY_CATEGORIES = {"infrastructure", "environment"}

def predict_priority(
    title: str,
    description: str,
    category: str,
    duplicate_count: int = 0,  # How many times this issue was reported
    hour_of_day: int | None = None,
) -> dict:
    """
    Predict urgency level for an issue.
    
    Args:
        duplicate_count: Number of times this same issue has been reported.
                         Each additional report escalates severity by 1 level.
    """
    text = (title + " " + description).lower()
    score = 0  # 0=low, 1=medium, 2=high, 3=critical

    # --- Base score from category ---
    if category in HIGH_URGENCY_CATEGORIES:
        score = 2
    elif category in MEDIUM_URGENCY_CATEGORIES:
        score = 1
    else:
        score = 1

    # --- Keyword analysis ---
    if any(kw in text for kw in CRITICAL_KEYWORDS):
        score = max(score, 3)
    elif any(kw in text for kw in HIGH_KEYWORDS):
        score = max(score, 2)
    elif any(kw in text for kw in LOW_KEYWORDS):
        score = min(score, 0)

    # --- Description length heuristic (longer = more detail = more serious) ---
    if len(description) > 300:
        score = min(score + 1, 3)

    # --- SEVERITY ESCALATION: Each duplicate report raises urgency ---
    # 1 duplicate → +1, 3 duplicates → +2, 7+ duplicates → +3 (maxes at critical)
    if duplicate_count >= 7:
        escalation = 3
    elif duplicate_count >= 3:
        escalation = 2
    elif duplicate_count >= 1:
        escalation = 1
    else:
        escalation = 0

    score = min(score + escalation, 3)

    # --- Night-time boost for safety issues ---
    if hour_of_day is not None and category == "safety":
        if hour_of_day >= 22 or hour_of_day <= 5:
            score = min(score + 1, 3)

    urgency = URGENCY_LEVELS[score]
    urgency_score = round((score + 1) / 4, 2)  # Normalized 0.25 to 1.0

    return {
        "urgency": urgency,
        "urgency_score": urgency_score,
        "escalated_by_reports": duplicate_count,
        "base_score": score,
    }
