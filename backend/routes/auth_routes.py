from datetime import datetime, UTC
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import db
from models import User, Notification
from services.twilio_service import send_otp, check_otp, normalize_mobile
from services.zodiac_service import calculate_zodiac_sign
from auth import create_access_token, decode_token

router = APIRouter(tags=["auth"])


class SendOtpRequest(BaseModel):
    mobile: str


class VerifyOtpRequest(BaseModel):
    mobile: str
    code: str


class SignupRequest(BaseModel):
    signup_token: str
    name: str
    dob: str
    place_of_birth: str
    time_of_birth: Optional[str] = None
    email: Optional[str] = None


@router.post("/api/auth/send-otp")
async def send_otp_route(payload: SendOtpRequest):
    mobile = normalize_mobile(payload.mobile)
    try:
        send_otp(mobile)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not send OTP: {str(e)}")
    existing = await db.users.find_one({"mobile": mobile})
    return {"status": "sent", "is_new_user": existing is None}


@router.post("/api/auth/verify-otp")
async def verify_otp_route(payload: VerifyOtpRequest):
    mobile = normalize_mobile(payload.mobile)
    is_valid = check_otp(mobile, payload.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user_doc = await db.users.find_one({"mobile": mobile})
    if user_doc:
        user = User.from_mongo(user_doc)
        token = create_access_token(user.id)
        return {"is_new_user": False, "token": token, "user": user.model_dump(by_alias=False)}

    signup_token = create_access_token(mobile, purpose="signup", expires_minutes=15)
    return {"is_new_user": True, "signup_token": signup_token}


@router.post("/api/auth/signup")
async def signup_route(payload: SignupRequest):
    token_data = decode_token(payload.signup_token)
    if token_data.get("purpose") != "signup":
        raise HTTPException(status_code=401, detail="Invalid signup token")
    mobile = token_data["sub"]

    existing = await db.users.find_one({"mobile": mobile})
    if existing:
        raise HTTPException(status_code=400, detail="Account already exists, please login")

    zodiac_sign = calculate_zodiac_sign(payload.dob)
    now = datetime.now(UTC)
    user = User(
        name=payload.name,
        mobile=mobile,
        email=payload.email,
        dob=payload.dob,
        time_of_birth=payload.time_of_birth,
        place_of_birth=payload.place_of_birth,
        zodiac_sign=zodiac_sign,
        created_at=now,
        trial_start_date=now,
    )
    result = await db.users.insert_one(user.to_mongo())
    user.id = str(result.inserted_id)

    welcome = Notification(
        user_id=user.id,
        title="Welcome to Zodiac ✨",
        body=f"Hi {user.name}, your {zodiac_sign} journey begins now. Enjoy 2 days of free daily predictions!",
        type="account",
    )
    await db.notifications.insert_one(welcome.to_mongo())

    access_token = create_access_token(user.id)
    return {"token": access_token, "user": user.model_dump(by_alias=False)}
