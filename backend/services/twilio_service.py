import os
from twilio.rest import Client

TWILIO_ACCOUNT_SID = os.environ["TWILIO_ACCOUNT_SID"]
TWILIO_AUTH_TOKEN = os.environ["TWILIO_AUTH_TOKEN"]
TWILIO_VERIFY_SID = os.environ["TWILIO_VERIFY_SID"]

TEST_BYPASS_MOBILE = os.environ.get("TEST_OTP_BYPASS_MOBILE", "+919999999999")
TEST_BYPASS_CODE = os.environ.get("TEST_OTP_BYPASS_CODE", "123456")

_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def normalize_mobile(mobile: str) -> str:
    mobile = mobile.strip().replace(" ", "")
    if not mobile.startswith("+"):
        mobile = "+91" + mobile
    return mobile


def send_otp(mobile: str) -> str:
    if mobile == TEST_BYPASS_MOBILE:
        return "pending"
    verification = _client.verify.v2.services(TWILIO_VERIFY_SID).verifications.create(
        to=mobile, channel="sms"
    )
    return verification.status


def check_otp(mobile: str, code: str) -> bool:
    if mobile == TEST_BYPASS_MOBILE:
        return code == TEST_BYPASS_CODE
    check = _client.verify.v2.services(TWILIO_VERIFY_SID).verification_checks.create(
        to=mobile, code=code
    )
    return check.status == "approved"
