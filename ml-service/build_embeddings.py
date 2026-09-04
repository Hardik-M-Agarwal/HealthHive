"""
build_embeddings.py

Run this ONCE (and again only if you edit guideline_corpus.json) to convert
the guideline corpus into searchable vectors.

Input:  guideline_corpus.json   (34 text chunks)
Output: guideline_embeddings.pkl (chunks + their vectors, ready for Flask to load)

Usage:
    python build_embeddings.py
"""

import json
import joblib
from sentence_transformers import SentenceTransformer

CORPUS_PATH = "guideline_corpus.json"
OUTPUT_PATH = "guideline_embeddings.pkl"
MODEL_NAME = "all-MiniLM-L6-v2"   # small, fast, well-tested general-purpose model

def main():
    print(f"Loading corpus from {CORPUS_PATH}...")
    with open(CORPUS_PATH, "r", encoding="utf-8") as f:
        corpus = json.load(f)
    print(f"Loaded {len(corpus)} chunks.")

    print(f"Loading embedding model: {MODEL_NAME} (first run downloads ~80MB)...")
    model = SentenceTransformer(MODEL_NAME)

    texts = [chunk["text"] for chunk in corpus]
    print("Embedding all chunks...")
    embeddings = model.encode(texts, show_progress_bar=True, normalize_embeddings=True)

    # Bundle everything together: the original chunk data + its vector
    data_to_save = {
        "model_name": MODEL_NAME,
        "chunks": corpus,          # original id/category/text
        "embeddings": embeddings,  # numpy array, shape (34, 384)
    }

    joblib.dump(data_to_save, OUTPUT_PATH)
    print(f"Saved embeddings for {len(corpus)} chunks to {OUTPUT_PATH}")
    print(f"Embedding dimension: {embeddings.shape[1]}")

if __name__ == "__main__":
    main()