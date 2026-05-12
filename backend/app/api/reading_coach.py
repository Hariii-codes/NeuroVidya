"""
Reading Coach API Endpoints

Provides endpoints for:
- Starting reading sessions
- Analyzing pronunciation
- Retrieving passages library
- Fetching progress data
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from pathlib import Path

from app.core.deps import get_current_user, get_database, get_optional_user
from app.models.models import User, Prisma
from app.services.pronunciation_service import pronunciation_analyzer

router = APIRouter()


# ============================================
# Schemas
# ============================================

class PronunciationAnalysisRequest(BaseModel):
    expectedText: str
    spokenText: str


class PronunciationAnalysisResponse(BaseModel):
    accuracyScore: float
    wordsCorrect: int
    wordsIncorrect: int
    errors: List[dict]
    phoneticFeedback: Optional[dict] = None


class ReadingSessionRequest(BaseModel):
    passageId: str
    passageText: str
    spokenText: str
    accuracyScore: float
    wordsCorrect: int
    wordsIncorrect: int
    errors: List[dict]


class PronounceWordRequest(BaseModel):
    word: str


# ============================================
# Helper Functions
# ============================================

def load_passages() -> List[dict]:
    """Load reading passages from JSON file."""
    passages_file = Path(__file__).parent.parent / "data" / "reading_passages.json"
    try:
        with open(passages_file, 'r') as f:
            data = json.load(f)
            return data.get("passages", [])
    except FileNotFoundError:
        return []


# ============================================
# API Endpoints
# ============================================

@router.post("/analyze", response_model=PronunciationAnalysisResponse)
async def analyze_pronunciation(
    request: PronunciationAnalysisRequest
):
    """
    Analyze pronunciation by comparing spoken text to expected text.

    Public endpoint - no authentication required for demo/practice use.
    Uses Levenshtein distance and phonetic similarity algorithms
    to detect pronunciation errors and provide feedback.
    """
    try:
        result = pronunciation_analyzer.analyze_pronunciation(
            expected_text=request.expectedText,
            spoken_text=request.spokenText
        )
        return PronunciationAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/submit-reading")
async def submit_reading_session(
    request: ReadingSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Submit a completed reading session for storage.

    Saves the session data and updates user's learning progress.
    """
    try:
        # Create reading session
        session = await db.readingcoachsession.create(
            data={
                "userId": current_user.id,
                "passageText": request.passageText,
                "spokenText": request.spokenText,
                "accuracyScore": request.accuracyScore,
                "wordsCorrect": request.wordsCorrect,
                "wordsIncorrect": request.wordsIncorrect,
                "errors": request.errors,
                "phoneticFeedback": {
                    "overallScore": request.accuracyScore,
                    "improvedWords": [],
                    "needsPractice": []
                }
            }
        )

        # Update learning progress
        progress = await db.learningprogress.find_unique(
            where={"userId": current_user.id}
        )

        if progress:
            # Calculate new average accuracy
            current_sessions = progress.readingCoachSessions + 1
            current_avg = progress.pronunciationAccuracy or 0
            new_avg = ((current_avg * (current_sessions - 1)) + request.accuracyScore) / current_sessions

            await db.learningprogress.update(
                where={"userId": current_user.id},
                data={
                    "readingCoachSessions": current_sessions,
                    "pronunciationAccuracy": new_avg
                }
            )

        return {"success": True, "sessionId": session.id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/passages")
async def get_passages(
    level: Optional[str] = None,
    category: Optional[str] = None
):
    """
    Get reading passages library.

    Public endpoint - no authentication required.
    Can filter by reading level and category.
    """
    try:
        passages = load_passages()

        # Apply filters
        if level:
            passages = [p for p in passages if p.get("readingLevel") == level]
        if category:
            passages = [p for p in passages if p.get("category") == category]

        return {"passages": passages}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/progress/me")
async def get_my_progress():
    """
    Get current user's reading progress.

    Public endpoint for demo use - returns empty data.
    """
    return {
        "sessions": [],
        "overallProgress": None
    }


@router.get("/progress/test")
async def test_progress():
    """Test endpoint for optional auth."""
    return {"status": "no user", "user": None}


@router.get("/progress/{user_id}")
async def get_reading_progress(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get reading progress for a user.

    Returns recent sessions and overall statistics.
    """
    try:
        # Verify user has access (their own data or teacher)
        if current_user.id != user_id and current_user.role != "teacher":
            raise HTTPException(status_code=403, detail="Access denied")

        # Get recent sessions
        sessions = await db.readingcoachsession.find_many(
            where={"userId": user_id},
            order={"createdAt": "desc"},
            take=10
        )

        # Get overall progress
        progress = await db.learningprogress.find_unique(
            where={"userId": user_id}
        )

        return {
            "sessions": sessions,
            "overallProgress": progress
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pronounce-word")
async def get_pronunciation_guide(
    request: PronounceWordRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get pronunciation guide for a word.

    Returns phonetic spelling and can generate audio (TTS).
    """
    try:
        phonetic = pronunciation_analyzer.PHONETIC_GUIDES.get(request.word.lower())

        if not phonetic:
            # Generate basic phonetic guide
            phonetic = f"/{request.word}/"

        return {
            "word": request.word,
            "phoneticGuide": phonetic,
            "canPronounce": True
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "reading-coach"}
