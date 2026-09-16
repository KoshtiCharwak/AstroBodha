from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from bson import ObjectId

from database import db
from models import User, NotificationPrefs
from auth import get_current_user_id

router = APIRouter(tags=["users"])


@router.get("/api/users/me")
async def get_me(user_id: str = Depends(get_current_user_id)):
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    user = User.from_mongo(doc)
    return user.model_dump(by_alias=False)


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    place_of_birth: Optional[str] = None
    time_of_birth: Optional[str] = None
    notif_prefs: Optional[NotificationPrefs] = None


@router.put("/api/users/me")
async def update_me(payload: UpdateProfileRequest, user_id: str = Depends(get_current_user_id)):
    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    user = User.from_mongo(doc)
    return user.model_dump(by_alias=False)
