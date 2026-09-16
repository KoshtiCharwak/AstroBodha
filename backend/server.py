import logging
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from database import db
from routes import auth_routes, user_routes, prediction_routes, notification_routes, subscription_routes

app = FastAPI()

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(prediction_routes.router)
app.include_router(notification_routes.router)
app.include_router(subscription_routes.router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_db_indexes():
    await db.users.create_index("mobile", unique=True)
    await db.daily_predictions.create_index([("user_id", 1), ("date", 1)], unique=True)
    await db.notifications.create_index([("user_id", 1), ("created_at", -1)])


@app.get("/api/")
async def root():
    return {"message": "Zodiac API running"}
