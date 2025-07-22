# suggestions.py
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import random

# ✅ Example follow-ups dataset
SUGGESTIONS = [
    "What is the difference between Bitcoin and Ethereum?",
    "How do smart contracts work?",
    "What are NFTs and how are they created?",
    "Can you explain zk-SNARKs in simple terms?",
    "How does DeFi lending generate yield?",
    "What is a blockchain wallet and how does it work?",
    "How do Ethereum gas fees work?",
    "What is staking and how do I earn rewards?",
    "What's the difference between custodial and non-custodial wallets?"
]

model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.IndexFlatL2(384)  # 384 for MiniLM
suggestion_embeddings = model.encode(SUGGESTIONS)
index.add(np.array(suggestion_embeddings))

def get_semantic_suggestion(prompt: str, wallet_info: dict = None) -> str:
    prompt = prompt.lower()
    wallet_present = bool(wallet_info and wallet_info.get("address"))

    if any(keyword in prompt for keyword in ["nft", "buy", "sell", "mint"]):
        return random.choice([
            "Try listing your NFT using: 'List NFT #123 for 0.1 ETH'",
            "Want to mint a new NFT? Just say: 'Create an NFT with image XYZ'",
            "You can check your owned NFTs by saying: 'Show my NFTs'"
        ])

    if "eth" in prompt or "send" in prompt:
        return random.choice([
            "Try: 'Send 0.01 ETH to 0xABC123...'",
            "Need gas prices? Just ask: 'What is current ETH gas fee?'",
            "You can transfer ETH to anyone just by saying: 'Transfer 0.001 ETH to 0x...'"
        ])

    if "wallet" in prompt or "connect" in prompt or wallet_present:
        return "Say: 'Connect my wallet' or 'Check my NFT balance' to continue."

    return random.choice([
        "Ask anything about Bitcoin, Ethereum, or DeFi!",
        "Try: 'Explain how staking works in Ethereum'",
        "Need NFT ideas? Just say: 'Top NFT trends in 2024?'"
    ])

