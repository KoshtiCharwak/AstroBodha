import os
from datetime import datetime, timedelta, UTC
import jwt
from fastapi import Header, HTTPException

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"


def create_access_token(subject: str, purpose: str = "access", extra: dict = None, expires_minutes: int = 60 * 24 * 30) -> str:
    payload = {
        "sub": subject,
        "purpose": purpose,
        "exp": datetime.now(UTC) + timedelta(minutes=expires_minutes),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user_id(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization token")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if payload.get("purpose") != "access":
        raise HTTPException(status_code=401, detail="Invalid token purpose")
    return payload["sub"]
