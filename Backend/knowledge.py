# knowledge_base = {
#     "blockchain": {
#         "description": "A public, decentralized ledger of records or transaction history.",
#         "types": ["public", "private"],
#         "key_features": ["transparency", "security", "trustless"],
#         "applications": ["digital currencies", "digital assets", "supply chain management"]
#     },
#     "smart_contracts": {
#         "description": "Self-executing with embedded smart code.",
#         "programming_languages": ["solidity", "rust", "java"],
#         "applications": ["digital currencies", "digital assets", "escrow services"]
#     },
#     "decentralized_applications": {
#         "description": "Applications built on a blockchain network.",
#         "types": ["web3 applications", "decentralized data storage"],
#         "key_features": ["interoperability", "mobility", "user control"]
#     },
#     "non_fungible_tokens": {
#         "description": "Unique digital assets.",
#         "standards": ["erc-721", "erc-1155"],
#         "applications": ["digital art", "collectibles", "virtual real estate"]
#     },
#     "erc20_token_standards": {
#         "description": "Standards for fungible tokens on Ethereum (ERC-20).",
#         "fields": ["name", "symbol", "totalSupply", "balanceOf", "transfer"],
#         "used_for": ["stablecoins", "utility tokens", "governance tokens"]
#     }
# }


knowledge_base = {
    "blockchain": "Blockchain is a distributed ledger technology used to record transactions securely.",
    "smart contract": "Smart contracts are self-executing contracts with code directly written into lines of code.",
    "nft": "NFTs (non-fungible tokens) represent unique digital assets stored on the blockchain.",
    "bitcoin": "Bitcoin is the first decentralized digital currency using proof-of-work consensus.",
    "ethereum": "Ethereum is a decentralized platform that runs smart contracts on its own blockchain."
}


def format_knowledge_base(kb: dict) -> str:
    lines = ["Knowledge Base:"]
    for topic, data in kb.items():
        lines.append(f"\n🔹 {topic.replace('_', ' ').title()}:")
        for key, value in data.items():
            if isinstance(value, list):
                value_str = ", ".join(value)
            else:
                value_str = value
            lines.append(f"  - {key.replace('_', ' ').capitalize()}: {value_str}")
    return "\n".join(lines)
    

# ✅ Improved Knowledge Base Lookup
def retrieve_knowledge_snippet(query: str) -> str:
    query_lower = query.lower()

    # Keyword map for simple use-case
    knowledge_map = {
        "blockchain": "Blockchain is a decentralized digital ledger used to record transactions across multiple computers in a secure, tamper-proof way.",
        "bitcoin": "Bitcoin is a decentralized digital currency that operates on a peer-to-peer network and is not controlled by any single authority.",
        "zk-snark": "zk-SNARK stands for Zero-Knowledge Succinct Non-Interactive Argument of Knowledge. It's a cryptographic proof that allows one party to prove it possesses certain information without revealing it.",
        "bip-0310": "BIP-0310 proposes a minimum-difficulty extension in Bitcoin to prevent difficulty drops that could lead to excessive block times, helping defend against 51% attacks.",
        "defi": "DeFi, or decentralized finance, refers to financial services that are built on top of blockchain technology and operate without traditional intermediaries like banks.",
    }

    for key, value in knowledge_map.items():
        if key in query_lower:
            return value

    return ""  # fallback if nothing matched

def search_knowledge_base(query):
    query = query.lower()
    for q, a in KNOWLEDGE.items():
        if q.lower() in query:
            return a
    return None

