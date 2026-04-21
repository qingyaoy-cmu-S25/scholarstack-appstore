"""
Embed lecture transcripts into Pinecone for DeepReview RAG.
Run once: python3 scripts/embed_lectures.py
"""

import os
import json
import hashlib
from pathlib import Path
from dotenv import load_dotenv
import tiktoken
from openai import OpenAI
from pinecone import Pinecone

load_dotenv()

openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME", "deepreview"))
enc = tiktoken.get_encoding("cl100k_base")

LECTURE_DIR = Path(__file__).parent.parent / "src" / "data" / "lecture"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50


def chunk_transcript(data):
    segments = data["segments"]
    source_file = data["source_file"]
    chunks = []
    current_text = ""
    current_start = segments[0]["start"] if segments else 0
    current_tokens = 0

    for seg in segments:
        seg_tokens = len(enc.encode(seg["text"]))

        if current_tokens + seg_tokens > CHUNK_SIZE and current_text:
            chunks.append({
                "text": current_text.strip(),
                "start_time": current_start,
                "end_time": seg["start"],
                "source_file": source_file,
                "source_type": "lecture",
            })
            overlap_text = current_text.strip().split()
            overlap_words = overlap_text[-30:] if len(overlap_text) > 30 else overlap_text
            current_text = " ".join(overlap_words) + " " + seg["text"]
            current_start = max(0, seg["start"] - 10)
            current_tokens = len(enc.encode(current_text))
        else:
            current_text += " " + seg["text"]
            current_tokens += seg_tokens

    if current_text.strip():
        chunks.append({
            "text": current_text.strip(),
            "start_time": current_start,
            "end_time": segments[-1]["end"] if segments else 0,
            "source_file": source_file,
            "source_type": "lecture",
        })

    return chunks


def get_embeddings(texts, batch_size=100):
    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = openai.embeddings.create(model="text-embedding-3-small", input=batch)
        all_embeddings.extend([e.embedding for e in response.data])
    return all_embeddings


def fmt_time(seconds):
    m = int(seconds) // 60
    s = int(seconds) % 60
    return f"{m}:{s:02d}"


def main():
    jsons = sorted(LECTURE_DIR.glob("*.json"))
    if not jsons:
        print("No transcript JSON files found")
        return

    print(f"Found {len(jsons)} lecture transcripts\n")

    all_chunks = []
    for json_path in jsons:
        print(f"  Processing: {json_path.name}")
        with open(json_path) as f:
            data = json.load(f)

        chunks = chunk_transcript(data)
        print(f"    Created {len(chunks)} chunks")

        for i, chunk in enumerate(chunks):
            chunk["chunk_index"] = i
            chunk["id"] = hashlib.md5(
                f"lecture:{chunk['source_file']}:{i}".encode()
            ).hexdigest()

        all_chunks.extend(chunks)

    print(f"\nTotal chunks: {len(all_chunks)}")
    print("Generating embeddings...")

    texts = [c["text"] for c in all_chunks]
    embeddings = get_embeddings(texts)
    print(f"Generated {len(embeddings)} embeddings")

    print("Upserting to Pinecone...")
    vectors = []
    for chunk, embedding in zip(all_chunks, embeddings):
        vectors.append({
            "id": chunk["id"],
            "values": embedding,
            "metadata": {
                "source_file": chunk["source_file"],
                "source_type": "lecture",
                "start_time": chunk["start_time"],
                "end_time": chunk["end_time"],
                "chunk_index": chunk["chunk_index"],
                "text": chunk["text"][:1000],
            },
        })

    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i : i + batch_size]
        index.upsert(vectors=batch)
        print(f"  Upserted {min(i + batch_size, len(vectors))}/{len(vectors)}")

    print(f"\nDone! {len(vectors)} lecture vectors added to Pinecone")


if __name__ == "__main__":
    main()
