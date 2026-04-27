"""
Issue Auto-Categorization using zero-shot semantic similarity.
No labeled training data required.
"""
from utils.embeddings import embed_text, embed_batch, cosine_similarity
import numpy as np

# Category definitions with multiple example phrases for better coverage
CATEGORY_DEFINITIONS = {
    "infrastructure": [
        "road pothole broken pavement",
        "bridge collapse structural damage",
        "building construction public works",
        "electricity power outage streetlight",
        "drainage pipe sewer water supply",
    ],
    "health": [
        "hospital medical clinic doctor nurse",
        "disease outbreak epidemic sick patients",
        "ambulance emergency health services",
        "vaccination sanitation hygiene",
        "mental health disability care",
    ],
    "environment": [
        "pollution air quality smoke factory",
        "garbage waste dumping littering",
        "tree cutting deforestation green space",
        "water contamination river lake",
        "noise pollution environmental hazard",
    ],
    "safety": [
        "crime robbery theft assault harassment",
        "police law enforcement security danger",
        "accident fire explosion hazard",
        "street lighting unsafe dark area",
        "traffic signal road safety violation",
    ],
    "education": [
        "school college university library",
        "teacher student classroom dropout",
        "mid day meal scholarship education",
        "digital literacy computer lab books",
    ],
    "social": [
        "community welfare poverty homeless",
        "women child elderly disabled welfare",
        "public park playground recreation",
        "social gathering community event",
        "unemployment job skills training",
    ],
}

# Pre-compute category embeddings at load time
_category_embeddings: dict[str, np.ndarray] = {}

def _get_category_embeddings() -> dict[str, np.ndarray]:
    global _category_embeddings
    if not _category_embeddings:
        print("Pre-computing category embeddings...")
        for category, phrases in CATEGORY_DEFINITIONS.items():
            phrase_embeddings = embed_batch(phrases)
            # Average the phrase embeddings for the category
            _category_embeddings[category] = np.mean(phrase_embeddings, axis=0)
        print("Category embeddings ready.")
    return _category_embeddings

def categorize_issue(title: str, description: str) -> dict:
    """
    Zero-shot classify the issue into a category.
    Returns category + confidence score.
    """
    text = f"{title}. {description}"
    issue_embedding = embed_text(text)
    category_embeddings = _get_category_embeddings()

    scores = {}
    for category, cat_embedding in category_embeddings.items():
        scores[category] = cosine_similarity(issue_embedding, cat_embedding)

    best_category = max(scores, key=scores.get)
    confidence = float(scores[best_category])

    return {
        "category": best_category,
        "confidence": round(confidence, 3),
        "all_scores": {k: round(v, 3) for k, v in scores.items()},
    }
