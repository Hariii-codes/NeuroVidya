# backend/app/api/progress.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

router = APIRouter()


class ActivityRequest(BaseModel):
    activityType: str
    metadata: Optional[Dict[str, Any]] = None


@router.get("/overview")
async def get_progress_overview():
    """Get user's learning progress overview."""
    # Mock data - would come from database
    return {
        "userId": "user123",
        "readingSpeed": 120,
        "spellingAccuracy": 85,
        "gamesCompleted": 12,
        "totalTimeMinutes": 450,
        "currentStreak": 7,
        "todayWordsRead": 650,
        "weeklyGoalProgress": 0.65,
    }


@router.post("/activity")
async def log_activity(request: ActivityRequest):
    """Log a learning activity."""
    # In production, save to database
    return {"status": "logged", "timestamp": datetime.now().isoformat()}


@router.get("/history")
async def get_activity_history(days: int = 30):
    """Get activity history for the last N days."""
    # Mock data - would come from database
    return {
        "activities": [
            {
                "date": "2026-03-12",
                "type": "reading",
                "duration": 15,
                "wordsRead": 350,
            },
            {
                "date": "2026-03-11",
                "type": "game",
                "gameType": "WORD_IMAGE_MATCHING",
                "score": 80,
            },
        ]
    }
