import os
import json
import uuid
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

try:
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        DATA_DIR = Path("/tmp") / "orca_data"
    else:
        DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
    DATA_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    DATA_DIR = Path("/tmp") / "orca_data"
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass

USERS_FILE = DATA_DIR / "users.json"
HISTORY_FILE = DATA_DIR / "chat_history.json"

class AuthHistoryStore:
    def __init__(self):
        self.users = {}
        self.history = {}
        self._load_data()

    def _load_data(self):
        try:
            if not USERS_FILE.exists():
                USERS_FILE.write_text(json.dumps({}), encoding="utf-8")
        except Exception:
            pass

        try:
            if not HISTORY_FILE.exists():
                HISTORY_FILE.write_text(json.dumps({}), encoding="utf-8")
        except Exception:
            pass

        try:
            if USERS_FILE.exists():
                self.users = json.loads(USERS_FILE.read_text(encoding="utf-8"))
        except Exception:
            self.users = {}

        try:
            if HISTORY_FILE.exists():
                self.history = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
        except Exception:
            self.history = {}

    def _save_users(self):
        try:
            USERS_FILE.write_text(json.dumps(self.users, indent=2), encoding="utf-8")
        except Exception:
            pass

    def _save_history(self):
        try:
            HISTORY_FILE.write_text(json.dumps(self.history, indent=2), encoding="utf-8")
        except Exception:
            pass

    def _hash_pw(self, password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def register(self, email: str, password: str, name: Optional[str] = None) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        if not email_clean or "@" not in email_clean:
            raise ValueError("Please provide a valid email address.")
        
        # Validation: password must contain only letters/alphabetical characters as requested
        pw_clean = password.strip()
        if not pw_clean:
            raise ValueError("Password cannot be empty.")
        if not pw_clean.isalpha():
            raise ValueError("Password must contain only letters and name characters (A-Z, a-z).")
        if len(pw_clean) < 3:
            raise ValueError("Password must be at least 3 characters.")

        if email_clean in self.users:
            raise ValueError("An account with this email already exists.")

        user_id = f"user_{uuid.uuid4().hex[:10]}"
        user_name = name.strip() if name else email_clean.split("@")[0].capitalize()

        user_record = {
            "id": user_id,
            "email": email_clean,
            "name": user_name,
            "password_hash": self._hash_pw(pw_clean),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.users[email_clean] = user_record
        self._save_users()

        token = f"orca_token_{uuid.uuid4().hex}"
        return {
            "user": {
                "id": user_id,
                "email": email_clean,
                "name": user_name,
                "created_at": user_record["created_at"]
            },
            "token": token
        }

    def login(self, email: str, password: str) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        pw_clean = password.strip()

        user = self.users.get(email_clean)
        if not user:
            raise ValueError("No account found with this email.")

        if user.get("password_hash") != self._hash_pw(pw_clean):
            raise ValueError("Incorrect password. Please try again.")

        token = f"orca_token_{uuid.uuid4().hex}"
        return {
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "created_at": user["created_at"]
            },
            "token": token
        }

    def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        return self.history.get(user_id, [])

    def append_user_chat(self, user_id: str, query: str, answer_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        if user_id not in self.history:
            self.history[user_id] = []

        chat_item = {
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "query": query,
            "data": answer_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.history[user_id].append(chat_item)
        self._save_history()
        return self.history[user_id]

auth_store = AuthHistoryStore()
