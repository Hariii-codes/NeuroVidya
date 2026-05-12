"""
Story Summariser API Endpoints

Provides endpoints for:
- Generating comic summaries from text
- Getting available illustration categories
- Saving and retrieving summaries
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.services.story_service import story_summariser_service

router = APIRouter()


# ============================================
# Schemas
# ============================================

class GenerateSummaryRequest(BaseModel):
    text: str
    title: Optional[str] = None
    level: str = "elementary"


class PanelData(BaseModel):
    panelNumber: int
    caption: str
    narration: str
    illustration: str
    category: str


class StorySummaryResponse(BaseModel):
    title: str
    panels: List[PanelData]
    panelCount: int
    originalLength: int
    level: str


class IllustrationCategory(BaseModel):
    name: str
    concepts: List[str]


# ============================================
# API Endpoints
# ============================================

@router.post("/generate", response_model=StorySummaryResponse)
async def generate_story_summary(request: GenerateSummaryRequest):
    """
    Generate a 5-panel comic summary from text.

    The summary includes:
    - 5 panels with illustrations
    - Simple captions for each panel
    - Narration text for TTS
    """
    try:
        if not request.text or len(request.text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Text is too short. Please provide at least 50 characters."
            )

        if len(request.text) > 5000:
            raise HTTPException(
                status_code=400,
                detail="Text is too long. Please keep it under 5000 characters."
            )

        # Generate summary
        summary = story_summariser_service.generate_from_passage(
            passage_text=request.text,
            passage_title=request.title or "Story Summary"
        )

        return StorySummaryResponse(**summary)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")


@router.get("/categories")
async def get_illustration_categories():
    """
    Get available illustration categories and concepts.

    Returns all categories with their available concepts
    for illustration matching.
    """
    try:
        from app.services.story_service import ILLUSTRATION_LIBRARY

        categories = []
        for category_name, concepts in ILLUSTRATION_LIBRARY.items():
            categories.append({
                "name": category_name,
                "concepts": list(concepts.keys())
            })

        return {"categories": categories}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "story-summariser"}
