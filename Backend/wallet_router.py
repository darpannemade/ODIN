from contract_config import contract, w3
from web3 import Web3
from fastapi import APIRouter
from pydantic import BaseModel
from eth_account.messages import encode_defunct
from web3.auto import w3 as auto_w3
from router import store_nonce, get_valid_nonce
from session_state import memory_store

wallet_router = APIRouter()

class ChallengeRequest(BaseModel):
    address: str
    user_email: str

@wallet_router.post("/sign-challenge")
def get_sign_challenge(req: ChallengeRequest):
    nonce = store_nonce(req.user_email, req.address)
    return {
        "challenge": f"Sign this message to verify: {nonce}",
        "address": req.address,
        "user_email": req.user_email
    }

class VerifyRequest(BaseModel):
    address: str
    signature: str
    user_email: str

@wallet_router.post("/verify-signature")
def verify_signature(req: VerifyRequest):
    challenge = get_valid_nonce(req.user_email)
    if not challenge:
        return {"verified": False, "error": "No valid challenge found or it expired."}

    message = encode_defunct(text=f"Sign this message to verify: {challenge}")
    recovered = auto_w3.eth.account.recover_message(message, signature=req.signature)
    verified = recovered.lower() == req.address.lower()

    # ✅ STORE VERIFIED STATUS
    if verified:
        if req.user_email not in memory_store:
            memory_store[req.user_email] = {}
        memory_store[req.user_email]["wallet_verified"] = True

    return {"verified": verified}

