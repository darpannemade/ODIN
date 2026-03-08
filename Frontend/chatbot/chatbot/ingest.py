import os
import time
import hashlib
import requests
from bs4 import BeautifulSoup
from typing import List

from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings

# Constants
TRUSTED_SOURCES = [
    "https://bitcoin.org/en/bitcoin-paper",
    "https://ethereum.org/en/whitepaper/",
    "https://bips.xyz",
    # Add more official or educational crypto URLs as needed
]

DATA_DIR = "data/auto_ingested"
SEEN_HASHES_FILE = "data/seen_hashes.txt"
VECTORSTORE_PATH = "vectorstores/auto_indexed_faiss"
EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Ensure required directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(os.path.dirname(SEEN_HASHES_FILE), exist_ok=True)

# Hashing

def hash_text(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def load_seen_hashes() -> set:
    if not os.path.exists(SEEN_HASHES_FILE):
        return set()
    with open(SEEN_HASHES_FILE, "r") as f:
        return set(line.strip() for line in f.readlines())


def save_seen_hash(hash_str: str):
    with open(SEEN_HASHES_FILE, "a") as f:
        f.write(hash_str + "\n")

# Fetch and clean

def fetch_text_from_url(url: str) -> str:
    try:
        res = requests.get(url, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        text = soup.get_text(separator="\n")
        return text.strip()
    except Exception as e:
        print(f"❌ Failed to fetch {url}: {e}")
        return None

# Embed logic

def embed_texts_to_vectorstore(texts: List[str]):
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
    docs = []
    for i, text in enumerate(texts):
        docs.extend(splitter.create_documents([text]))

    embedder = HuggingFaceEmbeddings(model_name=EMBED_MODEL_NAME)
    vectorstore = FAISS.from_documents(docs, embedder)
    vectorstore.save_local(VECTORSTORE_PATH)

# Main logic

def auto_ingest():
    print("\n🚀 Starting auto-ingestion...")
    seen = load_seen_hashes()
    new_texts = []

    for url in TRUSTED_SOURCES:
        print(f"🌐 Fetching: {url}")
        text = fetch_text_from_url(url)
        if not text:
            continue

        hash_val = hash_text(text)
        if hash_val in seen:
            print("⏭ Already ingested")
            continue

        filename = os.path.join(DATA_DIR, f"doc_{hash_val[:10]}.txt")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(text)

        new_texts.append(text)
        save_seen_hash(hash_val)
        print(f"✅ Ingested: {filename}")

    if new_texts:
        print("📦 Embedding and storing in vectorstore...")
        embed_texts_to_vectorstore(new_texts)
        print(f"✅ Done embedding to {VECTORSTORE_PATH}")
    else:
        print("📭 No new documents to ingest.")

if __name__ == "__main__":
    auto_ingest()
