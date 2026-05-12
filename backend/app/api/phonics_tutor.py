"""
Phonics Tutor API Endpoints

Provides endpoints for:
- Getting phonics data (letters, phonemes, example words)
- Managing pre-generated video library
- Video generation with MeiGen-MultiTalk (future)
- Student progress tracking
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
from pathlib import Path

router = APIRouter()

# ============================================
# Data Loading
# ============================================

PHONICS_DATA_PATH = Path(__file__).parent.parent / "data" / "phonics_data.json"

def load_phonics_data():
    """Load phonics data from JSON file."""
    try:
        with open(PHONICS_DATA_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"letters": [], "commonDigraphs": []}

# ============================================
# Schemas
# ============================================

class Phoneme(BaseModel):
    symbol: str
    sound: str
    exampleWords: List[str]
    mouthPosition: str
    commonMistakes: List[str]
    difficulty: str

class LetterData(BaseModel):
    id: str
    letter: str
    phonemes: List[Phoneme]
    visualAid: str
    practiceTips: List[str]

class VideoResponse(BaseModel):
    letterId: str
    phonemeSymbol: str
    videoUrl: Optional[str]
    isPreGenerated: bool
    posterUrl: Optional[str]
    duration: Optional[float]

class ProgressUpdate(BaseModel):
    letterId: str
    phonemeSymbol: str
    mastered: bool
    attempts: int
    timestamp: str

# ============================================
# API Endpoints
# ============================================

@router.get("/letters", response_model=List[LetterData])
async def get_all_letters():
    """
    Get all letters with their phonemes and teaching data.

    Returns comprehensive phonics data for all 26 letters including:
    - Phonemes (sounds the letter makes)
    - Example words for each phoneme
    - Mouth position descriptions
    - Common mistakes to avoid
    - Practice tips
    """
    try:
        data = load_phonics_data()
        return data.get("letters", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load phonics data: {str(e)}")


@router.get("/letters/{letter_id}", response_model=LetterData)
async def get_letter(letter_id: str):
    """
    Get detailed data for a specific letter.

    Args:
        letter_id: Single letter (A-Z) or digraph (SH, CH, TH, etc.)

    Returns:
        Complete phonics data for the requested letter
    """
    try:
        data = load_phonics_data()

        # Search in letters
        for letter in data.get("letters", []):
            if letter["id"] == letter_id.upper():
                return letter

        # Search in digraphs
        for digraph in data.get("commonDigraphs", []):
            if digraph["id"] == letter_id.upper() or digraph["letters"] == letter_id.upper():
                # Convert digraph to LetterData format
                return LetterData(
                    id=digraph["id"],
                    letter=digraph["letters"],
                    phonemes=[{
                        "symbol": digraph["symbol"],
                        "sound": digraph.get("sound", digraph["letters"].lower()),
                        "exampleWords": digraph["exampleWords"],
                        "mouthPosition": digraph["mouthPosition"],
                        "commonMistakes": [],
                        "difficulty": digraph["difficulty"]
                    }],
                    visualAid=f"{digraph['letters']} sound",
                    practiceTips=[]
                )

        raise HTTPException(status_code=404, detail=f"Letter {letter_id} not found")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get letter data: {str(e)}")


@router.get("/digraphs", response_model=List[Dict])
async def get_digraphs():
    """
    Get common letter combinations (digraphs) like SH, CH, TH, etc.

    Returns:
        List of common digraphs with their pronunciation data
    """
    try:
        data = load_phonics_data()
        return data.get("commonDigraphs", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load digraphs: {str(e)}")


@router.get("/video/{letter_id}", response_model=VideoResponse)
async def get_phonics_video(letter_id: str, phoneme_index: int = 0):
    """
    Get video for a specific letter and phoneme.

    Args:
        letter_id: Letter (A-Z) or digraph
        phoneme_index: Which phoneme (for letters with multiple sounds)

    Returns:
        Video URL and metadata for the requested phoneme
    """
    try:
        data = load_phonics_data()

        # Find the letter
        target_letter = None
        for letter in data.get("letters", []):
            if letter["id"] == letter_id.upper():
                target_letter = letter
                break

        if not target_letter:
            # Check digraphs
            for digraph in data.get("commonDigraphs", []):
                if digraph["id"] == letter_id.upper():
                    target_letter = {
                        "id": digraph["id"],
                        "letter": digraph["letters"],
                        "phonemes": [{
                            "symbol": digraph["symbol"],
                            "sound": digraph.get("sound", digraph["letters"].lower())
                        }]
                    }
                    break

        if not target_letter:
            raise HTTPException(status_code=404, detail=f"Letter {letter_id} not found")

        # Get the specific phoneme
        if phoneme_index >= len(target_letter["phonemes"]):
            raise HTTPException(status_code=400, detail=f"Invalid phoneme index")

        phoneme = target_letter["phonemes"][phoneme_index]

        # For now, return pre-generated video paths
        # In production, these would be actual video files
        video_filename = f"{letter_id.lower()}_{phoneme_index}.mp4"
        video_url = f"/static/phonics_videos/{video_filename}"

        return VideoResponse(
            letterId=target_letter["id"],
            phonemeSymbol=phoneme["symbol"],
            videoUrl=video_url,
            isPreGenerated=True,
            posterUrl=f"/static/phonics_videos/posters/{letter_id.lower()}.jpg",
            duration=3.0
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get video: {str(e)}")


@router.post("/generate-video")
async def generate_phonics_video(letter_id: str, phoneme_index: int = 0):
    """
    Generate a new phonics video using SadTalker.

    This endpoint uses the SadTalker model to generate
    a custom video showing mouth movements for the requested phoneme.

    Args:
        letter_id: Letter (A-Z) or digraph
        phoneme_index: Which phoneme (for letters with multiple sounds)

    Returns:
        Generation result with video URL if successful
    """
    try:
        data = load_phonics_data()

        # Find the letter
        target_letter = None
        for letter in data.get("letters", []):
            if letter["id"] == letter_id.upper():
                target_letter = letter
                break

        if not target_letter:
            raise HTTPException(status_code=404, detail=f"Letter {letter_id} not found")

        if phoneme_index >= len(target_letter["phonemes"]):
            raise HTTPException(status_code=400, detail=f"Invalid phoneme index")

        phoneme = target_letter["phonemes"][phoneme_index]

        # Import SadTalker service
        from app.services.sadtalker_service import sadtalker_service

        # Check service status
        status = sadtalker_service.get_service_status()

        if not status["installed"]:
            return {
                "status": "error",
                "message": "SadTalker is not installed. Please follow the setup guide in docs/SADTALKER_SETUP.md",
                "letterId": letter_id,
                "phonemeSymbol": phoneme["symbol"],
                "serviceStatus": status
            }

        if not status["character_image_exists"]:
            return {
                "status": "error",
                "message": f"Character image not found at {status['character_image_path']}",
                "letterId": letter_id,
                "phonemeSymbol": phoneme["symbol"],
                "serviceStatus": status
            }

        # Generate phoneme text
        sound = phoneme.get("sound", "")
        example_words = phoneme.get("exampleWords", [""])

        if not example_words or not example_words[0]:
            raise HTTPException(status_code=400, detail="No example words found for this phoneme")

        example_word = example_words[0]

        if sound.startswith("long_") or sound.startswith("short_"):
            sound_name = sound.replace("_", " ")
            phoneme_text = f"The {sound_name} sound as in {example_word}. {sound_name}."
        else:
            phoneme_text = f"The letter sound {sound.upper()} as in {example_word}. {sound}."

        # Generate video
        success, message, video_path = sadtalker_service.generate_phonics_video(
            letter_id=letter_id,
            phoneme_text=phoneme_text,
            phoneme_index=phoneme_index
        )

        if success and video_path:
            video_filename = video_path.name
            video_url = f"/static/phonics_videos/{video_filename}"

            return {
                "status": "completed",
                "message": message,
                "letterId": letter_id,
                "phonemeSymbol": phoneme["symbol"],
                "videoUrl": video_url,
                "videoPath": str(video_path)
            }
        else:
            return {
                "status": "failed",
                "message": message,
                "letterId": letter_id,
                "phonemeSymbol": phoneme["symbol"]
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate video: {str(e)}")


@router.get("/difficulty/{level}", response_model=List[LetterData])
async def get_letters_by_difficulty(level: str):
    """
    Get letters filtered by difficulty level.

    Args:
        level: Difficulty level (easy, medium, hard)

    Returns:
        Letters containing phonemes of the specified difficulty
    """
    try:
        data = load_phonics_data()
        letters = data.get("letters", [])

        # Filter letters that have phonemes of the specified difficulty
        result = []
        for letter in letters:
            for phoneme in letter["phonemes"]:
                if phoneme.get("difficulty", "").lower() == level.lower():
                    result.append(letter)
                    break

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to filter by difficulty: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "phonics-tutor"}


@router.get("/service-status")
async def get_service_status():
    """
    Get the current status of the phonics tutor service.

    Returns information about:
    - SadTalker installation status
    - Character image availability
    - Existing video/audio files
    - Directory paths
    """
    try:
        from app.services.sadtalker_service import sadtalker_service
        status = sadtalker_service.get_service_status()

        # Add additional status info
        status["api_status"] = "healthy"
        status["setup_guide"] = "docs/SADTALKER_SETUP.md"

        return status
    except ImportError:
        return {
            "api_status": "healthy",
            "service_status": "sadtalker_service_not_available",
            "message": "SadTalker service not found",
            "setup_guide": "docs/SADTALKER_SETUP.md"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get service status: {str(e)}")
