"""
Image Verification using OpenAI CLIP.
Compares before/after images to determine if work was actually completed.
Runs on GPU (T4 on Colab).
"""
import open_clip
import torch
from PIL import Image
import requests
from io import BytesIO
import numpy as np
from functools import lru_cache

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_NAME = "ViT-B-32"
PRETRAINED = "openai"

# Text prompts for CLIP-based classification
COMPLETION_PROMPTS = {
    "fixed": [
        "a repaired road with no potholes",
        "a clean area after garbage removal",
        "a fixed pipe with no leaking water",
        "completed construction work",
        "a clean and well-maintained public space",
        "work completed successfully",
    ],
    "not_fixed": [
        "a broken road with potholes",
        "garbage and waste dumped illegally",
        "a damaged and broken infrastructure",
        "unfinished construction work",
        "a dirty neglected public area",
        "problem still present and unresolved",
    ],
    "fake": [
        "a stock photo downloaded from internet",
        "an indoor staged photograph",
        "a completely unrelated image",
    ],
}


@lru_cache(maxsize=1)
def get_clip_model():
    """Load CLIP model once and cache it on GPU."""
    print(f"Loading CLIP model on {DEVICE}...")
    model, _, preprocess = open_clip.create_model_and_transforms(MODEL_NAME, pretrained=PRETRAINED)
    model = model.to(DEVICE)
    model.eval()
    tokenizer = open_clip.get_tokenizer(MODEL_NAME)
    print("CLIP model loaded.")
    return model, preprocess, tokenizer


def _load_image(image_url: str) -> Image.Image:
    """Load an image from a URL."""
    response = requests.get(image_url, timeout=10)
    response.raise_for_status()
    return Image.open(BytesIO(response.content)).convert("RGB")


def _get_image_embedding(image: Image.Image) -> np.ndarray:
    """Get CLIP image embedding."""
    model, preprocess, _ = get_clip_model()
    img_tensor = preprocess(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        features = model.encode_image(img_tensor)
        features = features / features.norm(dim=-1, keepdim=True)
    return features.cpu().numpy()[0]


def _get_text_embeddings(texts: list[str]) -> np.ndarray:
    """Get CLIP text embeddings for a list of prompts."""
    model, _, tokenizer = get_clip_model()
    tokens = tokenizer(texts).to(DEVICE)
    with torch.no_grad():
        features = model.encode_text(tokens)
        features = features / features.norm(dim=-1, keepdim=True)
    return features.cpu().numpy()


def _classify_against_prompts(image_embedding: np.ndarray, prompts: list[str]) -> float:
    """Get the average similarity score between image and a set of prompts."""
    text_embeddings = _get_text_embeddings(prompts)
    similarities = np.dot(text_embeddings, image_embedding)
    return float(np.mean(similarities))


def verify_completion(before_image_url: str, after_image_url: str) -> dict:
    """
    Analyze before and after images to determine if work was completed.
    
    Returns:
        {
            completion_score: int (0-100),
            verdict: "Completed" | "Mostly Done" | "Partially Done" | "Not Done",
            is_fake_image: bool,
            confidence: float,
            details: dict
        }
    """
    try:
        before_img = _load_image(before_image_url)
        after_img = _load_image(after_image_url)
    except Exception as e:
        return {
            "completion_score": 0,
            "verdict": "Error",
            "is_fake_image": False,
            "confidence": 0.0,
            "details": {"error": str(e)},
        }

    before_embedding = _get_image_embedding(before_img)
    after_embedding = _get_image_embedding(after_img)

    # 1. Check if after image looks fake / is a stock photo
    fake_score = _classify_against_prompts(after_embedding, COMPLETION_PROMPTS["fake"])
    is_fake = fake_score > 0.28  # Empirical threshold

    # 2. Measure how much the after image looks "fixed"
    fixed_score = _classify_against_prompts(after_embedding, COMPLETION_PROMPTS["fixed"])
    not_fixed_score = _classify_against_prompts(after_embedding, COMPLETION_PROMPTS["not_fixed"])

    # 3. Measure visual change between before and after (higher = more change = more work done)
    visual_change = 1.0 - float(np.dot(before_embedding, after_embedding))

    # Combine: weighted score from CLIP classification + visual change
    raw_score = (0.5 * fixed_score + 0.3 * visual_change + 0.2 * (fixed_score - not_fixed_score))
    # Normalize to 0-100
    completion_score = max(0, min(100, int(raw_score * 200)))

    if is_fake:
        completion_score = max(0, completion_score - 30)  # Penalize for fake image

    # Map score to verdict
    if completion_score >= 80:
        verdict = "Completed"
    elif completion_score >= 55:
        verdict = "Mostly Done"
    elif completion_score >= 30:
        verdict = "Partially Done"
    else:
        verdict = "Not Done"

    confidence = min(1.0, abs(fixed_score - not_fixed_score) * 3)

    return {
        "completion_score": completion_score,
        "verdict": verdict,
        "is_fake_image": is_fake,
        "confidence": round(confidence, 2),
        "details": {
            "fixed_score": round(fixed_score, 3),
            "not_fixed_score": round(not_fixed_score, 3),
            "visual_change": round(visual_change, 3),
            "fake_score": round(fake_score, 3),
        },
    }
