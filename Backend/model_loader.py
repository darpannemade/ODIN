from model_config import MODEL_CONFIG as MODELS
from llama_cpp import Llama

clients = {}
local_models = {}

for key, config in MODELS.items():
    if "remote" in config:
        from openai import OpenAI
        clients[key] = OpenAI(
            api_key=config["api_key"],
            base_url=config["api_base"]
        )
    else:
        local_models[key] = Llama(
            model_path=config["path"],
            n_ctx=config["n_ctx"],
            n_gpu_layers=config["n_gpu_layers"],
            n_batch=config["n_batch"],
            use_mlock=config["use_mlock"],
            low_vram=config["low_vram"]
        )

def call_model(prompt, key="general"):
    if key in local_models:
        return local_models[key](prompt)["choices"][0]["text"]
    elif key in clients:
        response = clients[key].chat.completions.create(
            model=MODELS[key]["model"],
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    else:
        raise ValueError(f"No model available for key: {key}")


