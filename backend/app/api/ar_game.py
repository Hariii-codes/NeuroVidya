"""
AR Reading Game API Endpoints

Provides endpoints for:
- Getting game level data
- Submitting scores
- Leaderboard
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict

from app.services.ar_game_service import ar_game_service

router = APIRouter()


# ============================================
# Schemas
# ============================================

class LevelDataResponse(BaseModel):
    level: int
    gameType: str
    prompt: str
    target: str
    options: List[str]
    difficulty: str
    points: int


class SubmitScoreRequest(BaseModel):
    level: int
    gameType: str
    correct: bool
    timeTaken: float  # in seconds


class ScoreResponse(BaseModel):
    base: int
    timeBonus: int
    streakBonus: int
    total: int
    streak: int


# ============================================
# API Endpoints
# ============================================

@router.get("/level/{level}/{game_type}", response_model=LevelDataResponse)
async def get_level_data(level: int, game_type: str):
    """
    Get game level data.

    Returns the target letter/word and available options
    for the specified level and game type.
    """
    try:
        if level < 1:
            raise HTTPException(status_code=400, detail="Level must be 1 or greater")

        if game_type not in ['letter', 'word', 'sentence']:
            raise HTTPException(status_code=400, detail="Game type must be 'letter', 'word', or 'sentence'")

        level_data = ar_game_service.get_level_data(level, game_type)
        return LevelDataResponse(**level_data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get level data: {str(e)}")


@router.post("/submit-score", response_model=ScoreResponse)
async def submit_score(request: SubmitScoreRequest):
    """
    Submit game score for a level.

    Calculates the score based on:
    - Base points for the level
    - Time bonus for fast completion
    - Streak bonus for consecutive correct answers
    """
    try:
        score_data = ar_game_service.calculate_score(
            correct=request.correct,
            time_taken=request.timeTaken,
            level=request.level
        )

        return ScoreResponse(**score_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit score: {str(e)}")


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    """
    Get top scores leaderboard.

    Returns the top scores across all game types.
    """
    # Placeholder - in production this would query the database
    return {
        "leaderboard": [
            {"name": "Player 1", "score": 500, "level": 5, "gameType": "letter"},
            {"name": "Player 2", "score": 450, "level": 4, "gameType": "word"},
            {"name": "Player 3", "score": 400, "level": 4, "gameType": "letter"},
        ]
    }


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "ar-game"}
