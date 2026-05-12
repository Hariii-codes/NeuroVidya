# backend/app/api/games.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.core.deps import get_database, get_current_active_user
from app.models.models import User, GameScore, GameType, Prisma

router = APIRouter()


# Mock game data (would come from database in production)
MOCK_WORD_IMAGES = [
    {"id": "wim-001", "image": "🍎", "correctWord": "Apple", "options": ["Apple", "Banana", "Orange", "Grape"], "difficulty": "easy", "category": "food"},
    {"id": "wim-002", "image": "🐕", "correctWord": "Dog", "options": ["Dog", "Cat", "Bird", "Fish"], "difficulty": "easy", "category": "animals"},
    {"id": "wim-003", "image": "☀️", "correctWord": "Sun", "options": ["Sun", "Moon", "Star", "Cloud"], "difficulty": "easy", "category": "nature"},
    {"id": "wim-004", "image": "🌈", "correctWord": "Rainbow", "options": ["Rainbow", "Cloud", "Storm", "Sky"], "difficulty": "medium", "category": "nature"},
]

MOCK_LETTERS = [
    {"id": "lr-001", "targetLetter": "b", "options": ["b", "d", "p", "q"], "difficulty": "easy", "type": "similar-letters"},
    {"id": "lr-002", "targetLetter": "d", "options": ["b", "d", "p", "q"], "difficulty": "easy", "type": "similar-letters"},
    {"id": "lr-003", "targetLetter": "p", "options": ["b", "d", "p", "q"], "difficulty": "easy", "type": "similar-letters"},
    {"id": "lr-004", "targetLetter": "q", "options": ["b", "d", "p", "q"], "difficulty": "easy", "type": "similar-letters"},
]

MOCK_SYLLABLES = [
    {"id": "sb-001", "targetWord": "information", "syllables": ["in", "for", "ma", "tion"], "hint": "Something you learn from reading", "difficulty": "medium"},
    {"id": "sb-002", "targetWord": "basketball", "syllables": ["bas", "ket", "ball"], "hint": "A sport with hoops", "difficulty": "easy"},
    {"id": "sb-003", "targetWord": "celebration", "syllables": ["cel", "e", "bra", "tion"], "hint": "A happy event", "difficulty": "hard"},
]

MOCK_SENTENCES = [
    {"id": "sent-001", "correctSentence": "The cat is sleeping", "shuffledWords": ["cat", "the", "sleeping", "is"], "hintImage": "😺", "difficulty": "easy"},
    {"id": "sent-002", "correctSentence": "I like to read books", "shuffledWords": ["read", "books", "I", "like", "to"], "hintImage": "📚", "difficulty": "easy"},
    {"id": "sent-003", "correctSentence": "The sun is bright today", "shuffledWords": ["bright", "sun", "today", "The", "is"], "hintImage": "☀️", "difficulty": "medium"},
]

MOCK_STORIES = [
    {
        "id": "story-001",
        "title": "The Little Seed",
        "readingLevel": "elementary",
        "topic": "nature",
        "pages": [
            {"image": "🌱", "sentence": "A little seed sleeps in the soil.", "wordHighlights": [{"word": "seed", "definition": "A small part of a plant"}]},
            {"image": "🌧️", "sentence": "The rain falls and waters the seed."},
            {"image": "☀️", "sentence": "The sun warms the soil and helps it grow."},
            {"image": "🌱", "sentence": "A small green sprout pushes up from the ground!"},
            {"image": "🌻", "sentence": "The seed grows into a beautiful flower!"}
        ],
        "quiz": [
            {"question": "What does the seed need to grow?", "options": ["Only sun", "Rain and sun", "Only rain", "Nothing"], "correctAnswer": 1}
        ]
    }
]

MOCK_CONCEPTS = [
    {
        "id": "vc-water-cycle",
        "title": "The Water Cycle",
        "category": "science",
        "steps": [
            {"label": "Evaporation", "visual": "💧↑", "explanation": "The sun warms water and it rises as gas"},
            {"label": "Condensation", "visual": "☁️", "explanation": "Water gas cools and forms clouds"},
            {"label": "Precipitation", "visual": "🌧️", "explanation": "Water falls as rain, snow, or hail"},
            {"label": "Collection", "visual": "🌊💧", "explanation": "Water flows into rivers and oceans"}
        ],
        "summary": "Water keeps moving from Earth to sky and back again"
    }
]


class GameScoreRequest(BaseModel):
    gameType: str
    score: int
    accuracy: Optional[float] = None
    timeTaken: Optional[int] = None


@router.get("/word-images")
async def get_word_image_games():
    """Get word-image matching game data."""
    return MOCK_WORD_IMAGES


@router.get("/letters")
async def get_letter_recognition_games():
    """Get letter recognition game data."""
    return MOCK_LETTERS


@router.get("/syllables")
async def get_syllable_games():
    """Get syllable building game data."""
    return MOCK_SYLLABLES


@router.get("/sentences")
async def get_sentence_games():
    """Get sentence building game data."""
    return MOCK_SENTENCES


@router.get("/stories")
async def get_illustrated_stories():
    """Get illustrated story game data."""
    return MOCK_STORIES


@router.get("/concepts")
async def get_visual_concepts():
    """Get visual concept explainer data."""
    return MOCK_CONCEPTS


@router.post("/score")
async def submit_game_score(
    score_data: GameScoreRequest,
    db: Prisma = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Submit a game score and update user progress."""
    try:
        # Create game score record
        game_score = await db.gamescore.create({
            "userId": current_user.id,
            "gameType": score_data.gameType,
            "score": score_data.score,
            "accuracy": score_data.accuracy,
            "timeTaken": score_data.timeTaken,
        })

        # Update user progress
        progress = await db.learningprogress.find_unique(
            where={"userId": current_user.id}
        )

        if progress:
            await db.learningprogress.update(
                where={"userId": current_user.id},
                data={
                    "gamesCompleted": progress.gamesCompleted + 1,
                }
            )
        else:
            await db.learningprogress.create({
                "userId": current_user.id,
                "gamesCompleted": 1,
            })

        # Log activity
        await db.activity.create({
            "userId": current_user.id,
            "activityType": "GAME_PLAYED",
            "description": f"Completed {score_data.gameType} with score {score_data.score}",
        })

        return {
            "success": True,
            "scoreId": game_score.id,
            "totalGames": (progress.gamesCompleted if progress else 0) + 1,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save score: {str(e)}"
        )


@router.get("/scores")
async def get_user_game_scores(
    db: Prisma = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get all game scores for the current user."""
    scores = await db.gamescore.find_many(
        where={"userId": current_user.id},
        order={"createdAt": "desc"},
        take=50
    )

    return {
        "scores": [
            {
                "id": score.id,
                "gameType": score.gameType,
                "score": score.score,
                "accuracy": score.accuracy,
                "timeTaken": score.timeTaken,
                "createdAt": score.createdAt.isoformat(),
            }
            for score in scores
        ]
    }


@router.get("/leaderboard")
async def get_leaderboard(
    gameType: Optional[str] = None,
    db: Prisma = Depends(get_database)
):
    """Get leaderboard for a specific game type or overall."""
    query = {"take": 10}

    if gameType:
        query["where"] = {"gameType": gameType}
        query["order"] = {"score": "desc"}
    else:
        # Get overall scores (sum of all games per user)
        # This would require a more complex query with aggregation
        # For now, return recent scores
        query["order"] = {"score": "desc"}

    scores = await db.gamescore.find_many(**query)

    # Group by user and sum scores (simplified version)
    user_scores = {}
    for score in scores:
        if score.userId not in user_scores:
            user_scores[score.userId] = 0
        user_scores[score.userId] += score.score

    # Sort and get top 10
    sorted_users = sorted(user_scores.items(), key=lambda x: x[1], reverse=True)[:10]

    # Get user details
    user_ids = [uid for uid, _ in sorted_users]
    users = await db.user.find_many(
        where={"id": {"in": user_ids}}
    )
    user_map = {u.id: u for u in users}

    leaderboard = [
        {
            "rank": index + 1,
            "name": user_map[uid].name if user_map.get(uid) else "Anonymous",
            "score": score,
        }
        for index, (uid, score) in enumerate(sorted_users)
    ]

    return {"leaderboard": leaderboard}
