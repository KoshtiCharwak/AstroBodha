from datetime import datetime, UTC, timedelta

TRIAL_DAYS = 2
MONTHLY_PRICE_INR = 99


def get_subscription_info(user: dict) -> dict:
    now = datetime.now(UTC)
    trial_start = user["trial_start_date"]
    if trial_start.tzinfo is None:
        trial_start = trial_start.replace(tzinfo=UTC)
    trial_end = trial_start + timedelta(days=TRIAL_DAYS)
    status = user.get("subscription_status", "trial")
    days_left_in_trial = 0

    if status == "active":
        is_locked = False
    elif status == "trial":
        days_left = (trial_end - now).total_seconds() / 86400
        if days_left <= 0:
            status = "expired"
            is_locked = True
        else:
            is_locked = False
            days_left_in_trial = max(0, round(days_left, 1))
    else:
        is_locked = True

    return {
        "status": status,
        "is_locked": is_locked,
        "days_left_in_trial": days_left_in_trial,
        "trial_end_date": trial_end.isoformat(),
        "plan_price": MONTHLY_PRICE_INR,
        "plan_currency": "INR",
    }
