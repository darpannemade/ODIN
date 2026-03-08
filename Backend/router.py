from sentence_transformers import SentenceTransformer, util
from session_state import memory_store
import re
import secrets
import time

# Nonce store with timestamp
time_limited_challenges = {}
CHALLENGE_EXPIRATION_SECONDS = 300  # 5 minutes

def parse_wallet_intent(prompt: str):
    prompt = prompt.lower()
    if match := re.match(r"send ([0-9.]+) eth to (0x[a-fA-F0-9]{40})", prompt):
        return {"intent": "transfer_eth", "amount": match.group(1), "to": match.group(2)}
    elif match := re.match(r"list nft #?([0-9]+) for ([0-9.]+) eth", prompt):
        return {"intent": "list_nft", "token_id": int(match.group(1)), "price": match.group(2)}
    elif match := re.match(r"buy nft #?([0-9]+)", prompt):
        return {"intent": "buy_nft", "token_id": int(match.group(1))}
    elif "fetch my nfts" in prompt:
        return {"intent": "fetch_nfts"}
    return {}

# 🔧 Load sentence transformer model once
model = SentenceTransformer("all-MiniLM-L6-v2")

# Categories returned from this function must match your MODELS dict keys
categories = {
    "bitcoin": "bitcoin",
    "solidity": "general_defi",
    "general": "general"
}

category_prompts = {
    "bitcoin": "This question is about Bitcoin, Satoshi Nakamoto, or BTC transactions.",
    "solidity": "This is about smart contracts, Solidity, or the Ethereum Virtual Machine.",
    "general": "This is a general Web3 or DeFi question."
}

def choose_model(prompt):
    if "bitcoin" in prompt.lower():
        return "bitcoin"
    elif "defi" in prompt.lower():
        return "general_defi"
    else:
        return "general"

def choose_model_zero_shot(user_input: str) -> str:
    input_embedding = model.encode(user_input, convert_to_tensor=True)
    similarities = {}
    for category, desc in category_prompts.items():
        category_embedding = model.encode(desc, convert_to_tensor=True)
        score = util.pytorch_cos_sim(input_embedding, category_embedding).item()
        similarities[category] = score

    best_category = max(similarities, key=similarities.get)
    return categories[best_category]  # ✅ returns one of: "bitcoin", "general_defi", "general"

# ✅ Wallet to user mapping for memory

def map_wallet_to_user(wallet_info: dict):
    wallet = wallet_info.get("address")
    email = wallet_info.get("user_email")

    if wallet and email:
        if email not in memory_store:
            memory_store[email] = {}
        memory_store[email].update({
            "wallet": wallet,
            "eth_balance": wallet_info.get("eth_balance", "0.0")
        })

# ✅ Nonce helper

def generate_secure_nonce():
    return secrets.token_hex(16)

def store_nonce(user_email: str, address: str):
    nonce = generate_secure_nonce()
    time_limited_challenges[user_email] = {
        "nonce": nonce,
        "address": address,
        "created_at": time.time()
    }
    return nonce

def get_valid_nonce(user_email: str):
    data = time_limited_challenges.get(user_email)
    if not data:
        return None
    if time.time() - data["created_at"] > CHALLENGE_EXPIRATION_SECONDS:
        del time_limited_challenges[user_email]  # Cleanup
        return None
    return data["nonce"]

