from fastapi import APIRouter, Depends

from database import db
from auth import get_current_user_id
from models import Notification

router = APIRouter(tags=["notifications"])


@router.get("/api/notifications")
async def list_notifications(user_id: str = Depends(get_current_user_id)):
    docs = await db.notifications.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    notifications = [Notification.from_mongo(d).model_dump(by_alias=False) for d in docs]
    unread_count = sum(1 for n in notifications if not n["read"])
    return {"notifications": notifications, "unread_count": unread_count}


@router.post("/api/notifications/read-all")
async def mark_all_read(user_id: str = Depends(get_current_user_id)):
    await db.notifications.update_many({"user_id": user_id, "read": False}, {"$set": {"read": True}})
    return {"status": "ok"}
