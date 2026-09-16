import os
import json
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

SYSTEM_PROMPT = """You are a warm, encouraging astrology writer for the Zodiac app.
Your job is to write short, personalized daily astrology guidance that feels like a friendly newspaper horoscope column.

Rules:
- Tone: positive, practical, conversational, encouraging, easy to understand, never technical.
- NEVER use fear, disasters, guaranteed outcomes, medical diagnosis, or guaranteed financial advice.
- Avoid absolute certainty. Use gentle language like "may", "could", "consider", "a good time to".
- Each of love/career/finance/wellbeing must be 1-2 short sentences, personal but broadly relatable.
- Respond ONLY with valid minified JSON, no markdown fences, matching exactly this schema:
{"love": "...", "career": "...", "finance": "...", "wellbeing": "...", "remedy_title": "...", "remedies": ["...", "...", "..."]}
- "remedies" must contain exactly 3 short, positive, safe daily actions (e.g. meditation, gratitude, a peaceful walk, drinking water, helping someone, spending time with family, mindful breathing)."""


def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start:end + 1]
    return json.loads(text)


async def generate_daily_prediction(name: str, zodiac_sign: str, element: str, transits: dict, target_date: str) -> dict:
    prompt = f"""Generate today's personalized astrology guidance.
User: {name}
Zodiac Sign: {zodiac_sign} ({element} element)
Date: {target_date}
Today's cosmic flavor (use as inspiration for tone, do not mention these terms literally):
- Lunar theme: {transits['moon_focus']}
- Mercury: {transits['mercury_status']}
- Overall energy: {transits['energy_theme']}
- Suggested focus: {transits['focus_area']}
- Personal number: {transits['lucky_number']}

Write personalized Love, Career, Finance and Wellbeing guidance (1-2 sentences each) for {name}, plus a short remedy_title and exactly 3 remedies (positive daily actions) inspired by today's energy. Return JSON only."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"zodiac-{zodiac_sign}-{target_date}",
            system_message=SYSTEM_PROMPT,
        ).with_model("gemini", "gemini-2.5-flash")

        response_text = await chat.send_message(UserMessage(text=prompt))
        data = _extract_json(response_text)
        remedies = list(data.get("remedies", []))[:3]
        while len(remedies) < 3:
            remedies.append("Take a few deep breaths and reset your mind.")
        return {
            "love": str(data.get("love", "")).strip(),
            "career": str(data.get("career", "")).strip(),
            "finance": str(data.get("finance", "")).strip(),
            "wellbeing": str(data.get("wellbeing", "")).strip(),
            "remedy_title": str(data.get("remedy_title", "Today's Positive Practice")).strip(),
            "remedies": remedies,
        }
    except Exception as e:
        logger.error(f"AI prediction generation failed, using fallback: {e}")
        return fallback_prediction()


def fallback_prediction() -> dict:
    return {
        "love": "A warm conversation could bring you closer to someone you care about today.",
        "career": "Stay open to small opportunities today — they may lead somewhere good.",
        "finance": "A calm, thoughtful approach to spending will serve you well today.",
        "wellbeing": "Take a little time today just for yourself to recharge.",
        "remedy_title": "Today's Positive Practice",
        "remedies": [
            "Spend 5 minutes in quiet meditation or deep breathing.",
            "Drink enough water and take a short walk outside.",
            "Do one small kind thing for someone today.",
        ],
    }
