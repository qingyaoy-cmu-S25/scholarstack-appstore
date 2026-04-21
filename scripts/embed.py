"""
Embed course PDFs into Pinecone for DeepReview RAG.
Run once: python3 scripts/embed.py
"""

import os
import sys
import hashlib
from pathlib import Path
from dotenv import load_dotenv
import pdfplumber
import tiktoken
from openai import OpenAI
from pinecone import Pinecone

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "deepreview")
PDF_DIR = Path(__file__).parent.parent / "src" / "data" / "course_material"
EMBEDDING_MODEL = "text-embedding-3-small"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

openai = OpenAI(api_key=OPENAI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)
enc = tiktoken.get_encoding("cl100k_base")


def extract_text_from_pdf(path):
    pages = []
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and text.strip():
                pages.append({"page": i + 1, "text": text.strip()})
    return pages


def chunk_text(pages, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    chunks = []
    all_text = ""
    page_boundaries = []

    for p in pages:
        start = len(enc.encode(all_text))
        all_text += p["text"] + "\n\n"
        end = len(enc.encode(all_text))
        page_boundaries.append({"page": p["page"], "start": start, "end": end})

    tokens = enc.encode(all_text)
    i = 0
    chunk_idx = 0

    while i < len(tokens):
        end = min(i + chunk_size, len(tokens))
        chunk_tokens = tokens[i:end]
        chunk_text_str = enc.decode(chunk_tokens)

        page_num = 1
        for pb in page_boundaries:
            if i >= pb["start"]:
                page_num = pb["page"]

        chunks.append({
            "text": chunk_text_str,
            "page": page_num,
            "chunk_index": chunk_idx,
        })

        chunk_idx += 1
        i += chunk_size - overlap

    return chunks


def get_embeddings(texts, batch_size=100):
    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = openai.embeddings.create(model=EMBEDDING_MODEL, input=batch)
        all_embeddings.extend([e.embedding for e in response.data])
    return all_embeddings


def main():
    pdfs = sorted(PDF_DIR.glob("*.pdf"))
    if not pdfs:
        print(f"No PDFs found in {PDF_DIR}")
        sys.exit(1)

    print(f"Found {len(pdfs)} PDFs in {PDF_DIR}")

    all_chunks = []
    for pdf_path in pdfs:
        filename = pdf_path.name
        print(f"\n  Processing: {filename}")

        pages = extract_text_from_pdf(pdf_path)
        print(f"    Extracted {len(pages)} pages")

        chunks = chunk_text(pages)
        print(f"    Created {len(chunks)} chunks")

        for chunk in chunks:
            chunk["source_file"] = filename
            chunk_id = hashlib.md5(
                f"{filename}:{chunk['chunk_index']}".encode()
            ).hexdigest()
            chunk["id"] = chunk_id

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
                "page": chunk["page"],
                "chunk_index": chunk["chunk_index"],
                "text": chunk["text"][:1000],
            },
        })

    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i : i + batch_size]
        index.upsert(vectors=batch)
        print(f"  Upserted {min(i + batch_size, len(vectors))}/{len(vectors)}")

    print(f"\nDone! {len(vectors)} vectors in Pinecone index '{PINECONE_INDEX_NAME}'")


if __name__ == "__main__":
    main()
