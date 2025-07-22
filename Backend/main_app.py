from fastapi import FastAPI
from pydantic import BaseModel
from llama_cpp import Llama
from fastapi.middleware.cors import CORSMiddleware
from concurrent.futures import ThreadPoolExecutor
import asyncio
import sys
import os
import re
from typing import List, Tuple
import time
from router import map_wallet_to_user
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from intent_handler import handle_wallet_intent
from router import parse_wallet_intent, choose_model_zero_shot
from apscheduler.schedulers.background import BackgroundScheduler
from ingest import auto_ingest
from contract_config import contract, w3
from session_state import memory_store
from model_loader import call_model
from model_config import MODEL_CONFIG as MODELS



# Load sentiment model (CPU is fine for this)
tokenizer = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")
sentiment_model = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")

def detect_sentiment(text: str):
    inputs = tokenizer(text[:512], return_tensors="pt", truncation=True, padding=True)
    outputs = sentiment_model(**inputs)
    scores = outputs.logits[0].detach().numpy()
    probs = np.exp(scores) / np.sum(np.exp(scores))
    labels = ["NEGATIVE", "NEUTRAL", "POSITIVE"]
    max_idx = int(np.argmax(probs))
    return labels[max_idx], float(probs[max_idx])

# Append chatbot logic path
sys.path.append(os.path.join(os.path.dirname("C:\\Users\\Darpan\\Odin's Eye"), "chatbot"))

from rag import retrieve_docs
from memory import UserMemory
from prompt_builder import build_prompt
from session_state import set_bot_name, get_bot_name, append_to_history, is_similar_response
from suggestions import get_semantic_suggestion
from ingest import auto_ingest

loaded = {}
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = BackgroundScheduler()

from wallet_router import wallet_router
app.include_router(wallet_router)

@app.on_event("startup")
def startup_tasks():
    preload_models()
    auto_ingest()  # Run once immediately
    from rag import fetch_and_chunk
    fetch_and_chunk()
    scheduler.add_job(auto_ingest, 'interval', hours=6)  # 🕓 every 6 hours
    scheduler.start()



def preload_models():
    for key, config in MODELS.items():
        if config.get("remote"):
            print(f"🌐 Skipping load for remote model: {key} (will be used via API)")
            continue
        print(f"🔄 Loading local model: {key}")
        loaded[key] = Llama(
            model_path=config["path"],
            n_ctx=config["n_ctx"],
            n_gpu_layers=config.get("n_gpu_layers", 0),
            n_threads=config.get("n_threads", os.cpu_count()),
            chat_format="llama-3",
            n_batch=config.get("n_batch", 64),
            use_mlock=config.get("use_mlock", False),
            low_vram=config.get("low_vram", False)
        )
    print("✅ Local models loaded. Remote models will be used dynamically.")



def get_model(key: str) -> Llama:
    if key in loaded:
        return loaded[key]
    elif "general" in loaded:
        return loaded["general"]
    else:
        raise RuntimeError(f"🚨 No models loaded. Cannot find '{key}' or fallback 'general'.")

class ChatRequest(BaseModel):
    user_id: str
    prompt: str
    wallet_info: dict = {}

executor = ThreadPoolExecutor()

def run_model_async(model, prompt):
    return asyncio.get_event_loop().run_in_executor(
        executor,
        lambda: model(
            prompt,
            max_tokens=512,
            temperature=0.5,
            top_p=0.9,
            stop=["</s>", "<|eot_id|>"]
        )
    )

def extract_memory_facts(user_input: str) -> List[Tuple[str, str]]:
    facts = []
    if match := re.search(r"my name is ([a-zA-Z]+)", user_input, re.I):
        facts.append(("name", match.group(1)))
    if match := re.search(r"i live in ([a-zA-Z\s]+)", user_input, re.I):
        facts.append(("location", match.group(1).strip()))
    if match := re.search(r"0x[a-fA-F0-9]{40}", user_input):
        facts.append(("wallet", match.group(0)))
    if match := re.search(r"(?:remember )?your name is ([a-zA-Z\s]+)", user_input, re.I):
        facts.append(("__bot_name__", match.group(1).strip()))
    return facts

@app.post("/chat")
async def chat(req: ChatRequest):
    wallet_info = req.wallet_info or {}
    map_wallet_to_user(wallet_info)
    email = wallet_info.get("user_email")

    # ✅ ENFORCE verification before proceeding
    if not memory_store.get(email, {}).get("wallet_verified", False):
        return {"response": "🔒 Wallet not verified. Please sign the challenge to continue."}

    timings = {}
    t0 = time.perf_counter()

    mem = UserMemory()
    user_input = req.prompt.lower().strip()

    # 🔍 Wallet intent
    intent = parse_wallet_intent(req.prompt)
    if intent:
        action_result = handle_wallet_intent(intent)
        if isinstance(action_result, dict):
            return {
                "response": action_result["text"],
                "action": action_result
            }
        else:
            return {"response": action_result}

    
    extracted = extract_memory_facts(req.prompt)
    if extracted:
        for key, value in extracted:
            if key == "__bot_name__":
                set_bot_name(value)
            else:
                mem.remember(req.user_id, key, value)
        return {"response": f"🧠 Remembered: {', '.join(f'{k} = {v}' for k, v in extracted)}"}

    if user_input.startswith("remember "):
        try:
            _, key, value = req.prompt.split(" ", 2)
            mem.remember(req.user_id, key, value)
            return {"response": f"🧠 Remembered {key} = {value}"}
        except:
            return {"response": "⚠️ Format should be: remember <key> <value>"}

            

    # 🔎 RAG
    t1 = time.perf_counter()
    rag_context = ""
    rag_results = retrieve_docs(req.prompt, top_k=1)
    if rag_results:
        rag_context = f"Here is some relevant information you can use:\n{rag_results[0]}"
    timings["🔍 RAG retrieval"] = time.perf_counter() - t1

    # 🔧 Prompt
    t2 = time.perf_counter()
    full_prompt = build_prompt(
    req.user_id,
    req.prompt,
    extra_context=rag_context,
    wallet_info=wallet_info
)

    timings["🧱 Prompt building"] = time.perf_counter() - t2

    # 🤖 Inference
    t3 = time.perf_counter()
    model_key = choose_model_zero_shot(req.prompt)

    if MODELS[model_key].get("remote"):
        reply = call_model(full_prompt).strip()
    else:
        model = get_model(model_key)
        output = await run_model_async(model, full_prompt)
        reply = output["choices"][0]["text"].strip()

    timings["🚀 LLM inference"] = time.perf_counter() - t3

    # ⚠️ Duplicate?
    t4 = time.perf_counter()
    if is_similar_response(req.user_id, reply):
        return {"response": "⚠️ I feel like I already answered that. Try asking it differently?"}
    timings["⚠️ Repetition check"] = time.perf_counter() - t4

    # 😊 Tone
    t5 = time.perf_counter()
    sentiment, score = detect_sentiment(req.prompt)
    if sentiment == "NEGATIVE" and score > 0.85:
        reply = f"It sounds like this might be frustrating. Let me help clarify.\n\n{reply}"
    elif sentiment == "POSITIVE" and score > 0.90:
        reply = f"Appreciate the positivity! Here's what you need to know:\n\n{reply}"
    timings["🧠 Sentiment analysis"] = time.perf_counter() - t5

    # ✨ Post format
    t6 = time.perf_counter()
    for fluff in ["A great topic!", "I'd be happy to help clarify!", "Let me help you understand"]:
        reply = reply.replace(fluff, "")
    follow_up = get_semantic_suggestion(req.prompt, wallet_info=wallet_info)
    full_reply = f"{reply}\n\n💡 {follow_up}"
    append_to_history(req.user_id, req.prompt, reply)
    timings["🎁 Post-processing"] = time.perf_counter() - t6

    total_time = time.perf_counter() - t0
    print(f"\n📊 Timing breakdown:")
    for k, v in timings.items():
        print(f"{k}: {v:.2f} seconds")
    print(f"⏱️ Total chat processing time: {total_time:.2f} seconds\n")

    return {"response": full_reply}

    

@app.get("/wallet-nfts/{address}")
def get_user_nfts(address: str):
    try:
        nfts = contract.functions.fetchMyNFTs().call({'from': address})
        items = [
            {
                "tokenId": nft[0],
                "seller": nft[1],
                "owner": nft[2],
                "price": w3.fromWei(nft[3], "ether"),
                "sold": nft[4]
            }
            for nft in nfts
        ]
        return {"nfts": items}
    except Exception as e:
        return {"error": str(e)}






