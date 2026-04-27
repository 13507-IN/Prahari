"""
Sentiment Analysis for community verification comments.
Uses a pre-trained RoBERTa model fine-tuned on social media text.
Falls back to keyword-based analysis if the model is not available.
"""
from functools import lru_cache

try:
    from transformers import pipeline
    HF_AVAILABLE = True
except ImportError:
    HF_AVAILABLE = False


POSITIVE_WORDS = [
    "fixed", "done", "completed", "resolved", "great", "good", "excellent",
    "improved", "better", "clean", "working", "repaired", "thank"
]
NEGATIVE_WORDS = [
    "not fixed", "still broken", "worse", "bad", "terrible", "incomplete",
    "fake", "lying", "no work", "useless", "nothing done", "still there"
]


@lru_cache(maxsize=1)
def _get_sentiment_pipeline():
    """Load the HuggingFace sentiment pipeline once."""
    if not HF_AVAILABLE:
        return None
    try:
        # Multilingual model that works well for Indian languages too
        return pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            device=0 if __import__("torch").cuda.is_available() else -1,
        )
    except Exception:
        return None


def analyze_sentiment(text: str) -> dict:
    """
    Analyze the sentiment of a comment.
    
    Returns:
        {
            label: "positive" | "neutral" | "negative",
            score: float,
            method: "model" | "heuristic"
        }
    """
    pipe = _get_sentiment_pipeline()

    if pipe:
        try:
            result = pipe(text[:512])[0]  # Truncate to model max length
            # Map model labels to our labels
            label_map = {
                "LABEL_0": "negative",
                "LABEL_1": "neutral",
                "LABEL_2": "positive",
                "POSITIVE": "positive",
                "NEGATIVE": "negative",
                "NEUTRAL": "neutral",
            }
            label = label_map.get(result["label"].upper(), "neutral")
            return {
                "label": label,
                "score": round(result["score"], 3),
                "method": "model",
            }
        except Exception:
            pass

    # --- Heuristic Fallback ---
    text_lower = text.lower()
    pos_count = sum(1 for w in POSITIVE_WORDS if w in text_lower)
    neg_count = sum(1 for w in NEGATIVE_WORDS if w in text_lower)

    if pos_count > neg_count:
        return {"label": "positive", "score": min(0.5 + pos_count * 0.1, 0.95), "method": "heuristic"}
    elif neg_count > pos_count:
        return {"label": "negative", "score": min(0.5 + neg_count * 0.1, 0.95), "method": "heuristic"}
    else:
        return {"label": "neutral", "score": 0.5, "method": "heuristic"}


def analyze_batch(comments: list[str]) -> dict:
    """
    Analyze a batch of comments and return aggregate sentiment.
    """
    results = [analyze_sentiment(c) for c in comments]
    counts = {"positive": 0, "neutral": 0, "negative": 0}
    for r in results:
        counts[r["label"]] += 1

    total = len(results)
    dominant = max(counts, key=counts.get)
    positivity_ratio = counts["positive"] / total if total > 0 else 0

    return {
        "individual": results,
        "summary": {
            "dominant_sentiment": dominant,
            "positivity_ratio": round(positivity_ratio, 2),
            "counts": counts,
        },
    }
