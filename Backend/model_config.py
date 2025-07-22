
import os
from dotenv import load_dotenv
load_dotenv()

def file_exists(path):
    return os.path.exists(path) and os.path.isfile(path)

# Remote fallback config from .env
USE_REMOTE_MODEL = os.getenv("USE_REMOTE_MODEL", "False").lower() == "true"
REMOTE_API_KEY = os.getenv("REMOTE_API_KEY")
REMOTE_API_BASE = os.getenv("REMOTE_API_BASE", "https://openrouter.ai/api/v1")

# Remote models per category
REMOTE_MODELS = {
    "general": os.getenv("REMOTE_GENERAL_MODEL", "meta-llama/Meta-Llama-3-8B-Instruct"),
    "general_defi": os.getenv("REMOTE_DEFI_MODEL", "openchat/openchat-3.5-0106"),
    "bitcoin": os.getenv("REMOTE_BITCOIN_MODEL", "neural-chat/neural-chat-7b-v3"),
}

# Paths to local GGUF models
LOCAL_PATHS = {
    "general": "",
    "general_defi": "",
    "bitcoin": ""
}


MODEL_CONFIG = {}

for key, path in LOCAL_PATHS.items():
    if file_exists(path) and not USE_REMOTE_MODEL:
        MODEL_CONFIG[key] = {
            "path": path,
            "n_gpu_layers": 30 if key != "bitcoin" else 0,
            "n_ctx": 4096 if key != "bitcoin" else 2048,
            "n_batch": 64 if key != "bitcoin" else 32,
            "use_mlock": True if key != "bitcoin" else False,
            "low_vram": False if key != "bitcoin" else True,
            "n_threads": 4 if key == "bitcoin" else None
        }
    else:
        MODEL_CONFIG[key] = {
            "remote": True,
            "api_key": REMOTE_API_KEY,
            "api_base": REMOTE_API_BASE,
            "model": REMOTE_MODELS[key]
        }

