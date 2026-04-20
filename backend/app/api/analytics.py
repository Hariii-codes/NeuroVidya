# backend/app/api/analytics.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/reading-chart")
async def get_reading_chart_data(days: int = 30):
    """Get reading progress chart data."""
    # Mock data - would come from database
    dates = []
    words_read = []
    for i in range(days):
        date = (datetime.now() - timedelta(days=days-i-1)).strftime("%Y-%m-%d")
        dates.append(date)
        words_read.append(100 + (i * 10) % 500)  # Mock values

    return {
        "dates": dates,
        "wordsRead": words_read,
        "goal": 500,
    }


@router.get("/game-scores")
async def get_game_scores():
    """Get game scores history."""
    # Mock data - would come from database
    return {
        "games": [
            {"date": "2026-03-12", "gameType": "WORD_IMAGE_MATCHING", "score": 90, "accuracy": 95},
            {"date": "2026-03-11", "gameType": "LETTER_RECOGNITION", "score": 85, "accuracy": 88},
            {"date": "2026-03-10", "gameType": "SYLLABLE_BUILDER", "score": 78, "accuracy": 82},
        ],
        "averageScore": 84.3,
        "averageAccuracy": 88.3,
    }


@router.get("/streak-info")
async def get_streak_info():
    """Get user's learning streak information."""
    # Mock data - would come from database
    return {
        "currentStreak": 7,
        "longestStreak": 14,
        "totalDays": 45,
        "streakHistory": [
            {"date": "2026-03-12", "activities": 3},
            {"date": "2026-03-11", "activities": 2},
            {"date": "2026-03-10", "activities": 4},
        ],
    }
