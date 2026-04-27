"""
Shared embedding utilities. 
We use a singleton pattern so the model is only loaded once into GPU memory.
"""
from sentence_transformers import SentenceTransformer
import numpy as np
from functools import lru_cache

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

@lru_cache(maxsize=1)
def get_text_model() -> SentenceTransformer:
    """Load the sentence transformer model once and cache it."""
    print(f"Loading embedding model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)
    print("Embedding model loaded.")
    return model

def embed_text(text: str) -> np.ndarray:
    """Encode a single string to a 384-dim embedding vector."""
    model = get_text_model()
    return model.encode(text, normalize_embeddings=True)

def embed_batch(texts: list[str]) -> np.ndarray:
    """Encode a list of strings to embeddings."""
    model = get_text_model()
    return model.encode(texts, normalize_embeddings=True, show_progress_bar=False)

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two normalized vectors."""
    return float(np.dot(a, b))
