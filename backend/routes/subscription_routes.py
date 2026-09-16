from datetime import datetime, UTC
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from database import db
from auth import get_current_user_id
from models import Notification
from services.subscription_service import get_subscription_info

router = APIRouter(tags=["subscription"])


@router.get("/api/subscription/status")
async def subscription_status(user_id: str = Depends(get_current_user_id)):
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return get_subscription_info(doc)


@router.post("/api/subscription/subscribe")
async def subscribe(user_id: str = Depends(get_current_user_id)):
    now = datetime.now(UTC)
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"subscription_status": "active", "subscription_start_date": now}},
    )
    notif = Notification(
        user_id=user_id,
        title="Zodiac Premium Activated 🎉",
        body="You're all set! Enjoy unlimited daily predictions, love, career, finance & wellbeing guidance.",
        type="subscription",
    )
    await db.notifications.insert_one(notif.to_mongo())
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    return get_subscription_info(doc)


@router.post("/api/subscription/cancel")
async def cancel_subscription(user_id: str = Depends(get_current_user_id)):
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"subscription_status": "expired"}},
    )
    notif = Notification(
        user_id=user_id,
        title="Subscription Cancelled",
        body="Your Zodiac Premium subscription has been cancelled. You can resubscribe anytime.",
        type="subscription",
    )
    await db.notifications.insert_one(notif.to_mongo())
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    return get_subscription_info(doc)
