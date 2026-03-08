import json, os
from session_state import get_bot_name
class UserMemory:
    def __init__(self, memory_file=r"C:\\Users\\Darpan\\Odin's Eye\\user_memory.json"):
        self.memory_file = memory_file
        self.memory = {}
        self.load_memory()

    def load_memory(self):
        if os.path.exists(self.memory_file):
            try:
                with open(self.memory_file, "r") as f:
                    content = f.read().strip()
                    self.memory = json.loads(content) if content else {}
            except json.JSONDecodeError:
                print("⚠️ Warning: Memory file is corrupted or invalid. Resetting.")
                self.memory = {}

    def save_memory(self):
        with open(self.memory_file, "w") as f:
            json.dump(self.memory, f, indent=2)

    def remember(self, user_id, key, value):
        if user_id not in self.memory:
            self.memory[user_id] = {}
        self.memory[user_id][key] = value
        self.save_memory()

    def recall(self, user_id):
        memory_lines = []
        if user_id in self.memory:
            for k, v in self.memory[user_id].items():
                memory_lines.append(f"The user's {k} is {v}.")
        return "\n".join(memory_lines)


