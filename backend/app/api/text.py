# backend/app/api/text.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import re
import logging

from app.core.deps import get_database, get_current_active_user
from app.models.models import User, Activity, ActivityType, Prisma
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter()


class SimplifyRequest(BaseModel):
    text: str
    readingLevel: str = "elementary"  # elementary, middle, high


class ExplainRequest(BaseModel):
    concept: str
    context: Optional[str] = None


class SpellCheckRequest(BaseModel):
    text: str


class SpellCorrection(BaseModel):
    original: str
    correction: str
    confidence: str  # high, medium, low
    position: Dict[str, int]  # start, end


@router.post("/simplify")
async def simplify_text(request: SimplifyRequest, db: Prisma = Depends(get_database)):
    """Simplify text to appropriate reading level using AI."""
    if not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty"
        )

    try:
        simplified = await ai_service.simplify_text(request.text, request.readingLevel)

        # Log activity if user is authenticated
        try:
            # Try to get user, but don't require authentication for text simplification
            pass
        except:
            pass

        return {"simplifiedText": simplified}

    except Exception as e:
        logger.error(f"Simplification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to simplify text. Please try again."
        )


@router.post("/explain")
async def explain_concept(request: ExplainRequest):
    """Explain a concept with simple language and examples."""
    if not request.concept.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Concept cannot be empty"
        )

    try:
        result = await ai_service.explain_concept(request.concept, request.context)
        return result

    except Exception as e:
        logger.error(f"Explanation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to explain concept. Please try again."
        )


# Dyslexia-aware spell check patterns
DYSL_EXIA_PATTERNS = {
    'becuse': 'because',
    'definately': 'definitely',
    'wensday': 'wednesday',
    'recieve': 'receive',
    'occured': 'occurred',
    'seperate': 'separate',
    'untill': 'until',
    'wich': 'which',
    'thier': 'their',
    'freind': 'friend',
    'scoll': 'school',
    'enuff': 'enough',
    'fone': 'phone',
    'bizzy': 'busy',
    'nite': 'night',
    'lite': 'light',
    'rite': 'right',
    'wierd': 'weird',
    'teh': 'the',
    'taht': 'that',
    'waht': 'what',
    'whihc': 'which',
    'becuase': 'because',
    'thier': 'their',
    'thier': 'there',
    'your': "you're",
}


def check_bd_confusion(word: str, corrections: list) -> Optional[str]:
    """Check for b/d confusion - very common in dyslexia."""
    if len(word) > 1 and word[0] == 'd':
        variant = 'b' + word[1:]
        if variant in DYSL_EXIA_PATTERNS.values():
            return variant
    if len(word) > 1 and word[0] == 'b':
        variant = 'd' + word[1:]
        if variant in DYSL_EXIA_PATTERNS.values():
            return variant
    return None


def check_vowel_errors(word: str, corrections: list) -> Optional[str]:
    """Check for vowel substitution errors."""
    vowel_patterns = [
        ('ie', 'ei'),
        ('ei', 'ie'),
    ]
    for pattern, replacement in vowel_patterns:
        if pattern in word.lower():
            variant = word.lower().replace(pattern, replacement)
            if variant in DYSL_EXIA_PATTERNS.values():
                return variant
    return None


@router.post("/spell-check")
async def spell_check(request: SpellCheckRequest):
    """Dyslexia-aware spell check with common misspellings database."""
    if not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty"
        )

    corrections = []
    words = request.text.split()
    current_pos = 0

    for word in words:
        # Remove punctuation for checking
        clean_word = re.sub(r'[^\w]', '', word.lower())
        original_with_punct = word

        if not clean_word:
            current_pos += len(word) + 1
            continue

        # Check common dyslexia misspellings
        correction = None
        confidence = "low"

        if clean_word in DYSL_EXIA_PATTERNS:
            correction = DYSL_EXIA_PATTERNS[clean_word]
            confidence = "high"
        else:
            # Check b/d confusion
            bd_result = check_bd_confusion(clean_word, corrections)
            if bd_result:
                correction = bd_result
                confidence = "medium"
            else:
                # Check vowel errors
                vowel_result = check_vowel_errors(clean_word, corrections)
                if vowel_result:
                    correction = vowel_result
                    confidence = "medium"

        if correction:
            start_pos = current_pos
            end_pos = current_pos + len(clean_word)

            corrections.append(SpellCorrection(
                original=clean_word,
                correction=correction,
                confidence=confidence,
                position={"start": start_pos, "end": end_pos}
            ).dict())

        current_pos += len(word) + 1

    return {
        "corrections": corrections,
        "originalText": request.text
    }


@router.post("/ocr")
async def process_ocr(file: UploadFile = File(...)):
    """
    Process OCR on uploaded image.
    Note: This endpoint accepts the file but requires client-side OCR (Tesseract.js)
    or additional server-side setup. Returns instructions for now.
    """
    # Check file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # For MVP, we recommend using client-side OCR with Tesseract.js
    # This endpoint is a placeholder for server-side fallback
    return {
        "message": "OCR processing should be done client-side using Tesseract.js",
        "instructions": "Use the OCRScanner component in the frontend",
        "fallback": "Server-side OCR requires additional setup with Tesseract Python or Google Vision API"
    }
