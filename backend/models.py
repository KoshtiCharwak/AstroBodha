from datetime import datetime, UTC
from typing import Optional, List, Annotated, Any
from pydantic import BaseModel, Field, BeforeValidator
from bson import ObjectId


def validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str):
        return v
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[str, BeforeValidator(validate_object_id)]


class BaseDocument(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

    @classmethod
    def from_mongo(cls, doc: dict):
        if doc is None:
            return None
        return cls(**doc)

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=True)
        if "_id" in data and isinstance(data["_id"], str):
            data["_id"] = ObjectId(data["_id"])
        return data


class NotificationPrefs(BaseModel):
    daily_reminder: bool = True
    streak_reminder: bool = True
    subscription_updates: bool = True


class User(BaseDocument):
    name: str
    mobile: str
    email: Optional[str] = None
    dob: str  # YYYY-MM-DD
    time_of_birth: Optional[str] = None  # HH:MM
    place_of_birth: str
    zodiac_sign: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    trial_start_date: datetime
    subscription_status: str = "trial"  # trial | active | expired | cancelled
    subscription_start_date: Optional[datetime] = None
    streak_count: int = 0
    last_checkin_date: Optional[str] = None
    notif_prefs: NotificationPrefs = Field(default_factory=NotificationPrefs)


class DailyPrediction(BaseDocument):
    user_id: str
    date: str  # YYYY-MM-DD
    zodiac_sign: str
    love: str
    career: str
    finance: str
    wellbeing: str
    remedy_title: str
    remedies: List[str]
    checked_in: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class Notification(BaseDocument):
    user_id: str
    title: str
    body: str
    type: str  # daily_prediction | reminder | streak | subscription | account
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
