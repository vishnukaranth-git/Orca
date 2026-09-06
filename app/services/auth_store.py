import os
import json
import uuid
import hashlib
import httpx
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
USERS_FILE = DATA_DIR / "users.json"
HISTORY_FILE = DATA_DIR / "chat_history.json"

class AuthHistoryStore:
    @property
    def supabase_url(self) -> str:
        url = os.getenv("SUPABASE_URL", "")
        if not url:
            try:
                from app.config import get_settings
                url = get_settings().supabase_url or ""
            except Exception:
                url = ""
        return url.strip().rstrip("/")

    @property
    def supabase_key(self) -> str:
        key = os.getenv("SUPABASE_KEY", "")
        if not key:
            try:
                from app.config import get_settings
                key = get_settings().supabase_key or ""
            except Exception:
                key = ""
        return key.strip()

    @property
    def use_supabase(self) -> bool:
        return bool(self.supabase_url and self.supabase_key)

    def __init__(self):
        self._load_data()

    def _get_supabase_headers(self) -> Dict[str, str]:
        key = self.supabase_key
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def _load_data(self):
        if not USERS_FILE.exists():
            USERS_FILE.write_text(json.dumps({}), encoding="utf-8")
        if not HISTORY_FILE.exists():
            HISTORY_FILE.write_text(json.dumps({}), encoding="utf-8")

        try:
            self.users = json.loads(USERS_FILE.read_text(encoding="utf-8"))
        except Exception:
            self.users = {}

        try:
            self.history = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
        except Exception:
            self.history = {}

    def _save_users(self):
        USERS_FILE.write_text(json.dumps(self.users, indent=2), encoding="utf-8")

    def _save_history(self):
        HISTORY_FILE.write_text(json.dumps(self.history, indent=2), encoding="utf-8")

    def _hash_pw(self, password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def register(self, email: str, password: str, name: Optional[str] = None) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        if not email_clean or "@" not in email_clean:
            raise ValueError("Please provide a valid email address.")
        
        pw_clean = password.strip()
        if not pw_clean:
            raise ValueError("Password cannot be empty.")
        if len(pw_clean) < 4:
            raise ValueError("Password must be at least 4 characters.")

        user_name = name.strip() if name else email_clean.split("@")[0].capitalize()
        password_hash = self._hash_pw(pw_clean)

        # 1. Supabase Cloud Database Path
        if self.use_supabase:
            try:
                headers = self._get_supabase_headers()
                check_url = f"{self.supabase_url}/rest/v1/orca_users?email=eq.{email_clean}&select=id"
                with httpx.Client(timeout=8.0) as client:
                    check_res = client.get(check_url, headers=headers)
                    if check_res.status_code == 200 and len(check_res.json()) > 0:
                        raise ValueError("An account with this maritime email already exists in Supabase.")

                    insert_url = f"{self.supabase_url}/rest/v1/orca_users"
                    insert_body = {
                        "email": email_clean,
                        "name": user_name,
                        "password_hash": password_hash
                    }
                    ins_res = client.post(insert_url, headers=headers, json=insert_body)
                    if ins_res.status_code in (200, 201):
                        records = ins_res.json()
                        user_rec = records[0] if isinstance(records, list) and len(records) > 0 else insert_body
                        user_id = str(user_rec.get("id", uuid.uuid4().hex[:10]))
                        created_at = str(user_rec.get("created_at", datetime.now(timezone.utc).isoformat()))

                        token = f"orca_token_{uuid.uuid4().hex}"
                        # Also cache locally
                        self.users[email_clean] = {
                            "id": user_id,
                            "email": email_clean,
                            "name": user_name,
                            "password_hash": password_hash,
                            "created_at": created_at
                        }
                        self._save_users()

                        return {
                            "user": {
                                "id": user_id,
                                "email": email_clean,
                                "name": user_name,
                                "created_at": created_at
                            },
                            "token": token
                        }
            except ValueError:
                raise
            except Exception as e:
                print(f"[Supabase Auth Warning] Register failed with Supabase: {e}. Falling back to local storage.")

        # 2. Local Fallback
        if email_clean in self.users:
            raise ValueError("An account with this email already exists.")

        user_id = f"user_{uuid.uuid4().hex[:10]}"
        user_record = {
            "id": user_id,
            "email": email_clean,
            "name": user_name,
            "password_hash": password_hash,
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
        expected_hash = self._hash_pw(pw_clean)

        # 1. Supabase Database Path
        if self.use_supabase:
            try:
                headers = self._get_supabase_headers()
                fetch_url = f"{self.supabase_url}/rest/v1/orca_users?email=eq.{email_clean}&select=*"
                with httpx.Client(timeout=8.0) as client:
                    res = client.get(fetch_url, headers=headers)
                    if res.status_code == 200:
                        records = res.json()
                        if records and len(records) > 0:
                            user_rec = records[0]
                            if user_rec.get("password_hash") != expected_hash:
                                raise ValueError("Incorrect security password. Please try again.")

                            token = f"orca_token_{uuid.uuid4().hex}"
                            # Also cache locally
                            self.users[email_clean] = {
                                "id": str(user_rec["id"]),
                                "email": user_rec["email"],
                                "name": user_rec["name"],
                                "password_hash": user_rec["password_hash"],
                                "created_at": str(user_rec.get("created_at", ""))
                            }
                            self._save_users()
                            return {
                                "user": {
                                    "id": str(user_rec["id"]),
                                    "email": user_rec["email"],
                                    "name": user_rec["name"],
                                    "created_at": str(user_rec.get("created_at", ""))
                                },
                                "token": token
                            }
            except ValueError:
                raise
            except Exception as e:
                print(f"[Supabase Auth Warning] Login failed with Supabase: {e}. Falling back to local storage.")

        # 2. Local Fallback & Cloud Sync
        user = self.users.get(email_clean)
        if user:
            if user.get("password_hash") != expected_hash:
                raise ValueError("Incorrect security password. Please try again.")

            # If user was found locally but not in Supabase, auto-sync to Supabase cloud
            if self.use_supabase:
                try:
                    headers = self._get_supabase_headers()
                    insert_url = f"{self.supabase_url}/rest/v1/orca_users"
                    insert_body = {
                        "email": user["email"],
                        "name": user.get("name", user["email"].split("@")[0]),
                        "password_hash": user["password_hash"]
                    }
                    with httpx.Client(timeout=5.0) as client:
                        client.post(insert_url, headers=headers, json=insert_body)
                except Exception as sync_e:
                    print(f"[Supabase Sync Notice] Cloud user backfill notice: {sync_e}")

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

        raise ValueError("No registered station account found with this email. Please click 'Create Account' to sign up.")


    def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        if self.use_supabase:
            try:
                # UUID check or lookup
                headers = self._get_supabase_headers()
                fetch_url = f"{self.supabase_url}/rest/v1/orca_chat_history?user_id=eq.{user_id}&order=created_at.asc&select=*"
                with httpx.Client(timeout=8.0) as client:
                    res = client.get(fetch_url, headers=headers)
                    if res.status_code == 200:
                        rows = res.json()
                        return [
                            {
                                "id": str(r.get("id")),
                                "query": r.get("query"),
                                "data": r.get("data"),
                                "timestamp": str(r.get("created_at"))
                            }
                            for r in rows
                        ]
            except Exception as e:
                print(f"[Supabase History Warning] Failed to fetch chat history: {e}")

        return self.history.get(user_id, [])

    def append_user_chat(self, user_id: str, query: str, answer_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        # 1. Supabase Database Path
        if self.use_supabase:
            try:
                headers = self._get_supabase_headers()
                insert_url = f"{self.supabase_url}/rest/v1/orca_chat_history"
                insert_body = {
                    "user_id": user_id,
                    "query": query,
                    "data": answer_data
                }
                with httpx.Client(timeout=8.0) as client:
                    res = client.post(insert_url, headers=headers, json=insert_body)
                    if res.status_code in (200, 201):
                        return self.get_user_history(user_id)
            except Exception as e:
                print(f"[Supabase History Warning] Failed to save chat to Supabase: {e}")

        # 2. Local Fallback
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
