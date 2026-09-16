from datetime import datetime, UTC, timedelta
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from database import db
from auth import get_current_user_id
from models import DailyPrediction, Notification
from services.zodiac_service import simulate_daily_transits, get_zodiac_symbol, get_zodiac_element
from services.ai_service import generate_daily_prediction
from services.subscription_service import get_subscription_info

router = APIRouter(tags=["predictions"])


def today_str() -> str:
    return datetime.now(UTC).strftime("%Y-%m-%d")


@router.get("/api/predictions/today")
async def get_today_prediction(user_id: str = Depends(get_current_user_id)):
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    sub_info = get_subscription_info(user_doc)
    date_str = today_str()

    if sub_info["is_locked"]:
        return {
            "locked": True,
            "subscription": sub_info,
            "date": date_str,
            "zodiac_sign": user_doc["zodiac_sign"],
            "zodiac_symbol": get_zodiac_symbol(user_doc["zodiac_sign"]),
            "streak_count": user_doc.get("streak_count", 0),
        }

    existing = await db.daily_predictions.find_one({"user_id": user_id, "date": date_str})
    if existing:
        prediction = DailyPrediction.from_mongo(existing)
    else:
        transits = simulate_daily_transits(user_id, date_str, user_doc["dob"])
        element = get_zodiac_element(user_doc["zodiac_sign"])
        content = await generate_daily_prediction(
            user_doc["name"], user_doc["zodiac_sign"], element, transits, date_str
        )
        prediction = DailyPrediction(
            user_id=user_id,
            date=date_str,
            zodiac_sign=user_doc["zodiac_sign"],
            love=content["love"],
            career=content["career"],
            finance=content["finance"],
            wellbeing=content["wellbeing"],
            remedy_title=content["remedy_title"],
            remedies=content["remedies"],
        )
        result = await db.daily_predictions.insert_one(prediction.to_mongo())
        prediction.id = str(result.inserted_id)

        notif = Notification(
            user_id=user_id,
            title="Today's Zodiac Prediction is Ready ✨",
            body=f"Your personalized {user_doc['zodiac_sign']} guidance for today has arrived.",
            type="daily_prediction",
        )
        await db.notifications.insert_one(notif.to_mongo())

    return {
        "locked": False,
        "subscription": sub_info,
        "zodiac_sign": user_doc["zodiac_sign"],
        "zodiac_symbol": get_zodiac_symbol(user_doc["zodiac_sign"]),
        "prediction": prediction.model_dump(by_alias=False),
        "streak_count": user_doc.get("streak_count", 0),
    }


@router.post("/api/predictions/checkin")
async def checkin(user_id: str = Depends(get_current_user_id)):
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    date_str = today_str()
    prediction_doc = await db.daily_predictions.find_one({"user_id": user_id, "date": date_str})
    if not prediction_doc:
        raise HTTPException(status_code=400, detail="No prediction generated yet for today")
    if prediction_doc.get("checked_in"):
        return {"streak_count": user_doc.get("streak_count", 0), "already_checked_in": True}

    await db.daily_predictions.update_one({"_id": prediction_doc["_id"]}, {"$set": {"checked_in": True}})

    last_checkin = user_doc.get("last_checkin_date")
    yesterday_str = (datetime.now(UTC).date() - timedelta(days=1)).strftime("%Y-%m-%d")
    current_streak = user_doc.get("streak_count", 0)
    if last_checkin == yesterday_str:
        new_streak = current_streak + 1
    elif last_checkin == date_str:
        new_streak = current_streak
    else:
        new_streak = 1

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"streak_count": new_streak, "last_checkin_date": date_str}},
    )

    if new_streak > 0 and new_streak % 7 == 0:
        notif = Notification(
            user_id=user_id,
            title=f"🔥 {new_streak}-Day Streak!",
            body="Amazing consistency! Keep practicing positivity every day.",
            type="streak",
        )
        await db.notifications.insert_one(notif.to_mongo())

    return {"streak_count": new_streak, "already_checked_in": False}
