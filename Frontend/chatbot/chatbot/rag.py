
import os
from typing import List
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

# Constants
VECTORSTORE_PATH = "vectorstores/auto_indexed_faiss"
EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Load model
embedder = HuggingFaceEmbeddings(model_name=EMBED_MODEL_NAME)

# Initialize
vectorstore = None

def fetch_and_chunk():
    global vectorstore
    if os.path.exists(VECTORSTORE_PATH):
        print(f"✅ Loading vectorstore from {VECTORSTORE_PATH}")
        # vectorstore = FAISS.load_local(VECTORSTORE_PATH, embedder)
        vectorstore = FAISS.load_local(VECTORSTORE_PATH, embedder, allow_dangerous_deserialization=True)

    else:
        print("❌ No vectorstore found. Run ingest.py first.")

def retrieve_docs(query: str, top_k: int = 1) -> List[str]:
    if not vectorstore:
        print("⚠️ No vectorstore loaded. Run fetch_and_chunk() first.")
        return []

    results = vectorstore.similarity_search(query, k=top_k)
    return [doc.page_content for doc in results]


# Test from CLI
if __name__ == "__main__":
    fetch_and_chunk()
    while True:
        q = input("Ask something: ")
        docs = retrieve_docs(q)
        for i, d in enumerate(docs, 1):
            print(f"\n📚 [{i}] {d[:300]}...\n")





