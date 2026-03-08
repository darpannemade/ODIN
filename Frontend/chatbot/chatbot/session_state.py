DEFAULT_BOT_NAME = "Odin's_Eye"
session_bot_name = None
session_history = {}  # user_id: [(user_input, assistant_response)]

memory_store = {}  # ✅ Add this line

def get_bot_name():
    return session_bot_name or DEFAULT_BOT_NAME

def set_bot_name(new_name):
    global session_bot_name
    session_bot_name = new_name

def append_to_history(user_id: str, user_msg: str, assistant_msg: str):
    if user_id not in session_history:
        session_history[user_id] = []
    session_history[user_id].append((user_msg, assistant_msg))

def get_history(user_id: str, limit: int = 3):
    return session_history.get(user_id, [])[-limit:]

from difflib import SequenceMatcher

def is_similar_response(user_id, new_response, threshold=0.85):
    prev_responses = [r for _, r in session_history.get(user_id, [])[-3:]]
    for prev in prev_responses:
        ratio = SequenceMatcher(None, prev, new_response).ratio()
        if ratio > threshold:
            return True
    return False
