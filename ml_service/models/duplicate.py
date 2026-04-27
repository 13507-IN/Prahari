"""
Duplicate Issue Detection.
Combines semantic text similarity + geospatial proximity.
If an issue is a duplicate, the original issue's severity is escalated.
"""
from utils.embeddings import embed_text, cosine_similarity
import numpy as np
from math import radians, cos, sin, asin, sqrt
from typing import Optional

# Thresholds
TEXT_SIMILARITY_THRESHOLD = 0.82   # >82% similar text = likely duplicate
GEO_RADIUS_METERS = 500            # Within 500m = same physical location


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters between two GPS coordinates."""
    R = 6371000  # Earth radius in meters
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    return 2 * R * asin(sqrt(a))


def detect_duplicates(
    new_title: str,
    new_description: str,
    new_lat: Optional[float],
    new_lon: Optional[float],
    existing_issues: list[dict],  # List of {id, title, description, lat, lon}
) -> dict:
    """
    Check if a new issue is a duplicate of any existing open issue.
    
    Returns:
        {
            is_duplicate: bool,
            duplicate_of: str | None,  # Issue ID of the original
            similarity_score: float,
            similar_issues: list  # All potential duplicates sorted by similarity
        }
    """
    if not existing_issues:
        return {"is_duplicate": False, "duplicate_of": None, "similarity_score": 0, "similar_issues": []}

    new_text = f"{new_title}. {new_description}"
    new_embedding = embed_text(new_text)

    similar_issues = []
    for issue in existing_issues:
        issue_text = f"{issue.get('title', '')}. {issue.get('description', '')}"
        issue_embedding = embed_text(issue_text)
        text_sim = cosine_similarity(new_embedding, issue_embedding)

        # Check geographic proximity if coordinates are available
        geo_match = False
        geo_distance = None
        if new_lat and new_lon and issue.get("lat") and issue.get("lon"):
            geo_distance = haversine_distance_meters(new_lat, new_lon, issue["lat"], issue["lon"])
            geo_match = geo_distance <= GEO_RADIUS_METERS

        # It's a duplicate if BOTH text is similar AND locations are nearby
        # (or if text is extremely similar even without location data)
        is_dup = (text_sim >= TEXT_SIMILARITY_THRESHOLD and (geo_match or new_lat is None))

        if text_sim >= 0.6:  # Include any somewhat similar issue in results
            similar_issues.append({
                "id": issue["id"],
                "similarity_score": round(text_sim, 3),
                "geo_distance_meters": round(geo_distance, 1) if geo_distance else None,
                "is_duplicate": is_dup,
            })

    # Sort by similarity score
    similar_issues.sort(key=lambda x: x["similarity_score"], reverse=True)

    # Find the top duplicate
    duplicates = [x for x in similar_issues if x["is_duplicate"]]
    if duplicates:
        top_dup = duplicates[0]
        return {
            "is_duplicate": True,
            "duplicate_of": top_dup["id"],
            "similarity_score": top_dup["similarity_score"],
            "similar_issues": similar_issues[:5],
        }

    return {
        "is_duplicate": False,
        "duplicate_of": None,
        "similarity_score": similar_issues[0]["similarity_score"] if similar_issues else 0,
        "similar_issues": similar_issues[:5],
    }
