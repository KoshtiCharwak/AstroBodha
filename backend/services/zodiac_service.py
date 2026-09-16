import hashlib
import random
from datetime import datetime

# (sign, (start_month, start_day), (end_month, end_day))
ZODIAC_RANGES = [
    ("Capricorn", (12, 22), (1, 19)),
    ("Aquarius", (1, 20), (2, 18)),
    ("Pisces", (2, 19), (3, 20)),
    ("Aries", (3, 21), (4, 19)),
    ("Taurus", (4, 20), (5, 20)),
    ("Gemini", (5, 21), (6, 20)),
    ("Cancer", (6, 21), (7, 22)),
    ("Leo", (7, 23), (8, 22)),
    ("Virgo", (8, 23), (9, 22)),
    ("Libra", (9, 23), (10, 22)),
    ("Scorpio", (10, 23), (11, 21)),
    ("Sagittarius", (11, 22), (12, 21)),
]

ZODIAC_SYMBOLS = {
    "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋",
    "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏",
    "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓",
}

ZODIAC_ELEMENTS = {
    "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
    "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
    "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
    "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water",
}


def calculate_zodiac_sign(dob_str: str) -> str:
    dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
    m, d = dob.month, dob.day
    for sign, start, end in ZODIAC_RANGES:
        s_m, s_d = start
        e_m, e_d = end
        if s_m == e_m:
            if m == s_m and s_d <= d <= e_d:
                return sign
        else:
            if (m == s_m and d >= s_d) or (m == e_m and d <= e_d):
                return sign
    return "Aries"


def get_zodiac_symbol(sign: str) -> str:
    return ZODIAC_SYMBOLS.get(sign, "✨")


def get_zodiac_element(sign: str) -> str:
    return ZODIAC_ELEMENTS.get(sign, "Fire")


MOON_PHASES = [
    "New Moon energy", "Waxing Crescent momentum", "First Quarter push",
    "Waxing Gibbous focus", "Full Moon clarity", "Waning Gibbous reflection",
    "Last Quarter release", "Waning Crescent rest",
]

MERCURY_STATES = [
    "moving smoothly, favoring clear communication",
    "in a thoughtful phase, good for careful planning",
    "encouraging you to double-check small details",
    "supporting steady, calm conversations",
]

ENERGY_THEMES = [
    "grounded and practical", "warm and social", "reflective and intuitive",
    "bold and confident", "curious and open-minded", "calm and steady",
    "creative and expressive", "focused and determined",
]

FOCUS_AREAS = [
    "relationships", "personal growth", "career steps", "financial planning",
    "rest and recovery", "family connections", "self-care", "new opportunities",
]


def simulate_daily_transits(user_id: str, target_date: str, dob_str: str) -> dict:
    """Deterministic, per-user pseudo-random planetary transit flavor for personalization."""
    seed_str = f"{user_id}-{target_date}-{dob_str}"
    seed = int(hashlib.sha256(seed_str.encode()).hexdigest(), 16)
    rng = random.Random(seed)
    return {
        "moon_focus": rng.choice(MOON_PHASES),
        "mercury_status": rng.choice(MERCURY_STATES),
        "energy_theme": rng.choice(ENERGY_THEMES),
        "focus_area": rng.choice(FOCUS_AREAS),
        "lucky_number": rng.randint(1, 9),
    }
