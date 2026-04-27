"""
Prahari ML Service — FastAPI Entry Point
Runs on Google Colab T4 GPU, exposed via ngrok tunnel.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Import all model modules
from models.categorizer import categorize_issue
from models.priority import predict_priority
from models.duplicate import detect_duplicates
from models.image_verify import verify_completion
from models.clustering import cluster_issues
from models.sentiment import analyze_sentiment, analyze_batch

app = FastAPI(
    title="Prahari ML Service",
    description="AI/ML microservice for the Prahari civic issue management platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    title: str
    description: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    category: Optional[str] = None
    duplicate_count: int = 0
    existing_issues: list[dict] = []

class ImageVerifyRequest(BaseModel):
    before_image_url: str
    after_image_url: str

class ClusterRequest(BaseModel):
    issues: list[dict]  # [{id, lat, lon, category}]
    eps_km: float = 2.0
    min_samples: int = 3

class SentimentRequest(BaseModel):
    comments: list[str]

class DuplicateCheckRequest(BaseModel):
    title: str
    description: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    existing_issues: list[dict] = []


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.get("/health")
def health():
    import torch
    return {
        "status": "ok",
        "gpu_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
    }


@app.post("/analyze")
def analyze_issue(req: AnalyzeRequest):
    """
    Full pipeline: categorize + predict priority + check duplicates.
    Called by the Node.js backend when a new issue is submitted.
    """
    # Step 1: Auto-categorize
    cat_result = categorize_issue(req.title, req.description)
    category = req.category or cat_result["category"]

    # Step 2: Check for duplicates
    dup_result = detect_duplicates(
        req.title, req.description, req.lat, req.lon, req.existing_issues
    )
    duplicate_count = req.duplicate_count + (1 if dup_result["is_duplicate"] else 0)

    # Step 3: Predict priority (with escalation from duplicates)
    priority_result = predict_priority(
        req.title, req.description, category, duplicate_count
    )

    # Step 4: Generate summary
    summary = f"{category.capitalize()} issue detected with {priority_result['urgency']} urgency. {req.description[:80]}..."

    return {
        "category": category,
        "category_confidence": cat_result["confidence"],
        "urgency": priority_result["urgency"],
        "urgency_score": priority_result["urgency_score"],
        "summary": summary,
        "duplicate": dup_result,
        "severity_escalated": duplicate_count > 0,
    }


@app.post("/verify-image")
def verify_image(req: ImageVerifyRequest):
    """
    Compare before and after images to determine work completion.
    Requires GPU for best performance.
    """
    result = verify_completion(req.before_image_url, req.after_image_url)
    return result


@app.post("/cluster")
def cluster(req: ClusterRequest):
    """
    Cluster issues by location to identify hotspot zones.
    """
    result = cluster_issues(req.issues, req.eps_km, req.min_samples)
    return result


@app.post("/sentiment")
def sentiment(req: SentimentRequest):
    """
    Analyze sentiment of community verification comments.
    """
    result = analyze_batch(req.comments)
    return result


@app.post("/detect-duplicate")
def detect_duplicate(req: DuplicateCheckRequest):
    """
    Check if a new issue is a duplicate of existing ones.
    """
    result = detect_duplicates(
        req.title, req.description, req.lat, req.lon, req.existing_issues
    )
    return result


@app.post("/categorize")
def categorize(req: AnalyzeRequest):
    """Standalone categorization endpoint."""
    return categorize_issue(req.title, req.description)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
