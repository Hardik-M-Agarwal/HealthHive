"""
retrieval.py

Loads the pre-built guideline embeddings once at import time, and exposes
retrieve_for_factors(factors, is_concern) -> list of matching chunks.

This module is imported by app.py — it does not run standalone.
"""

import joblib
import numpy as np
from sentence_transformers import SentenceTransformer

EMBEDDINGS_PATH = "guideline_embeddings.pkl"
MODEL_NAME = "all-MiniLM-L6-v2"  # must match the model used in build_embeddings.py

print("Loading guideline embeddings...")
_data = joblib.load(EMBEDDINGS_PATH)
_chunks = _data["chunks"]            # list of {id, category, text}
_embeddings = _data["embeddings"]    # numpy array, shape (34, 384), normalized

print("Loading embedding model for query encoding...")
_model = SentenceTransformer(MODEL_NAME)

print(f"Retrieval ready — {len(_chunks)} guideline chunks loaded.")


def retrieve(query: str, top_k: int = 2, category_filter=None):
    """
    Given a query string, return the top_k most relevant guideline chunks.

    Input:
        query: a text string, e.g. "High systolic BP (145 mmHg — normal <120)"
        top_k: how many matching chunks to return (default 2)
        category_filter: optional set/list of allowed categories. If given,
                          only chunks whose category is in this set are considered.

    Output:
        list of dicts, each: {id, category, text, score}
        sorted by relevance, most relevant first
    """
    if not query or not query.strip():
        return []

    query_vector = _model.encode([query], normalize_embeddings=True)[0]
    scores = _embeddings @ query_vector  # cosine similarity, shape (34,)

    if category_filter is not None:
        allowed_mask = np.array([c["category"] in category_filter for c in _chunks])
        scores = np.where(allowed_mask, scores, -np.inf)
        if not allowed_mask.any():
            scores = _embeddings @ query_vector

    top_indices = scores.argsort()[::-1][:top_k]

    results = []
    for idx in top_indices:
        if scores[idx] == -np.inf:
            continue
        chunk = _chunks[idx]
        results.append({
            "id": chunk["id"],
            "category": chunk["category"],
            "text": chunk["text"],
            "score": round(float(scores[idx]), 3)
        })
    return results


def retrieve_for_factors(factors: list, is_concern: bool, top_k_per_factor: int = 2):
    """
    Takes a list of factor strings (contributing_factors or positive_factors
    from /predict) and retrieves guidance for each, deduplicating overlaps.

    Input:
        factors: list of strings
        is_concern: True if these are contributing_factors (concerns) —
                    restricts retrieval to non-"_positive" categories.
                    False if these are positive_factors —
                    restricts retrieval to "_positive" categories.
        top_k_per_factor: how many chunks to retrieve per factor

    Output:
        list of unique matched chunks across all factors (deduplicated by id)
    """
    all_categories = set(c["category"] for c in _chunks)

    if is_concern:
        category_filter = {c for c in all_categories if not c.endswith("_positive")}
    else:
        category_filter = {c for c in all_categories if c.endswith("_positive")}

    seen_ids = set()
    all_results = []

    for factor in factors:
        matches = retrieve(factor, top_k=top_k_per_factor, category_filter=category_filter)
        for match in matches:
            if match["id"] not in seen_ids:
                seen_ids.add(match["id"])
                all_results.append(match)

    return all_results