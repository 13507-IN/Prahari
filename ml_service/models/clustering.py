"""
Location-Based Issue Clustering using DBSCAN.
Identifies hotspot zones from clusters of reported issues.
"""
import numpy as np
from sklearn.cluster import DBSCAN
from math import radians
from typing import Optional


def cluster_issues(
    issues: list[dict],  # List of {id, lat, lon, category}
    eps_km: float = 2.0,  # Max distance between points in a cluster (in km)
    min_samples: int = 3,  # Minimum reports to form a hotspot
) -> dict:
    """
    Cluster issues using DBSCAN and identify hotspot zones.
    
    Args:
        eps_km: Cluster radius in kilometers
        min_samples: Minimum number of reports to form a hotspot cluster
    
    Returns:
        {
            clusters: list of {cluster_id, centroid_lat, centroid_lon, issue_count, categories, severity},
            noise_points: list of issue ids not in any cluster,
            hotspot_count: int
        }
    """
    if len(issues) < min_samples:
        return {"clusters": [], "noise_points": [i["id"] for i in issues], "hotspot_count": 0}

    coords = np.array([[i["lat"], i["lon"]] for i in issues])
    
    # Convert km to radians for haversine metric
    eps_rad = eps_km / 6371.0

    # DBSCAN with haversine distance metric (works perfectly for lat/lon)
    db = DBSCAN(eps=eps_rad, min_samples=min_samples, algorithm="ball_tree", metric="haversine")
    coords_rad = np.radians(coords)
    labels = db.fit_predict(coords_rad)

    cluster_map: dict[int, list[int]] = {}
    for idx, label in enumerate(labels):
        if label not in cluster_map:
            cluster_map[label] = []
        cluster_map[label].append(idx)

    clusters = []
    noise_points = []

    for label, indices in cluster_map.items():
        if label == -1:
            # Noise points (not in any cluster)
            noise_points.extend([issues[i]["id"] for i in indices])
            continue

        cluster_issues_list = [issues[i] for i in indices]
        cluster_coords = coords[indices]

        # Calculate centroid
        centroid_lat = float(np.mean(cluster_coords[:, 0]))
        centroid_lon = float(np.mean(cluster_coords[:, 1]))

        # Category breakdown
        categories = {}
        for issue in cluster_issues_list:
            cat = issue.get("category", "other")
            categories[cat] = categories.get(cat, 0) + 1

        # Severity is based on cluster size
        count = len(cluster_issues_list)
        if count >= 10:
            severity = "critical"
        elif count >= 6:
            severity = "high"
        elif count >= 3:
            severity = "medium"
        else:
            severity = "low"

        clusters.append({
            "cluster_id": int(label),
            "centroid_lat": centroid_lat,
            "centroid_lon": centroid_lon,
            "issue_count": count,
            "issue_ids": [issues[i]["id"] for i in indices],
            "categories": categories,
            "dominant_category": max(categories, key=categories.get),
            "severity": severity,
        })

    # Sort clusters by size (largest first)
    clusters.sort(key=lambda x: x["issue_count"], reverse=True)

    return {
        "clusters": clusters,
        "noise_points": noise_points,
        "hotspot_count": len(clusters),
    }
