from memory import UserMemory
from session_state import get_bot_name, get_history

MAX_CHAT_HISTORY = 2
MAX_USER_INPUT_TOKENS = 300

def truncate_text(text, max_words):
    return " ".join(text.split()[:max_words])

def build_prompt(user_id, user_input, extra_context="", wallet_info=None):
    mem = UserMemory()
    bot_name = get_bot_name()
    user_facts = mem.recall(user_id)

    history = get_history(user_id, limit=MAX_CHAT_HISTORY)
    history_text = "\n".join(
        f"User: {truncate_text(u, 200)}\nAssistant: {truncate_text(a, 200)}" for u, a in history
    )

    # ✅ Safely inject ETH balance into extra_context
    if wallet_info and "eth_balance" in wallet_info:
        eth_balance = wallet_info["eth_balance"]
        extra_context += f"\n\n[User ETH Balance: {eth_balance} ETH]"

    system_prompt = f"""
You are a calm, professional crypto assistant.
Avoid emotional or dramatic language. Stick to factual, helpful answers.
The assistant's name is {bot_name}.

{extra_context}
"""

    if user_facts:
        system_prompt += f"\nUser facts:\n{user_facts}"
    if history_text:
        system_prompt += f"\n\nRecent history:\n{history_text}"

    user_input = truncate_text(user_input, MAX_USER_INPUT_TOKENS)

    return f"<|start_header_id|>system<|end_header_id|>\n{system_prompt.strip()}\n<|eot_id|>\n" \
           f"<|start_header_id|>user<|end_header_id|>\n{user_input.strip()}\n<|eot_id|>\n" \
           f"<|start_header_id|>assistant<|end_header_id|>\n"


