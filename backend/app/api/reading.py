# backend/app/api/reading.py
from fastapi import APIRouter, Depends

router = APIRouter()


# ============================================
# Schemas
# ============================================

class DifficultyAnalysisRequest:
    text: str
    readingTimeSeconds: float
    wordClicks: list = []
    pauses: list = []


class DifficultyAnalysisResponse:
    difficultyScore: int
    wpm: float
    hesitationCount: int
    skippedWords: int
    recommendations: list


# ============================================
# Helper Functions
# ============================================

def count_syllables(word: str) -> int:
    """Simple syllable counter for English words."""
    word = word.lower()
    vowels = "aeiouy"
    syllable_count = 0
    prev_char_was_vowel = False

    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_char_was_vowel:
            syllable_count += 1
        prev_char_was_vowel = is_vowel

    return max(syllable_count, 1)


# ============================================
# Difficulty Analysis
# ============================================

@router.post("/analyze")
async def analyze_reading_difficulty(data: dict):
    """
    Analyze reading difficulty based on tracked behavior.
    """
    text = data.get("text", "")
    reading_time_seconds = data.get("readingTimeSeconds", 0)
    word_clicks = data.get("wordClicks", [])
    pauses = data.get("pauses", [])

    words = text.split()
    word_count = len(words)

    # Calculate WPM
    if reading_time_seconds > 0:
        wpm = (word_count / reading_time_seconds) * 60
    else:
        wpm = 0

    # Count hesitations (pauses > 2 seconds)
    hesitation_count = len([p for p in pauses if p > 2.0])

    # Count "skipped" words (words clicked = confusion)
    skipped_words = len(word_clicks)

    # Calculate base difficulty score
    score = 100

    # WPM impact
    if wpm < 80:
        score -= 30
    elif wpm < 120:
        score -= 15

    # Hesitation impact
    score -= min(hesitation_count * 5, 30)

    # Word clicks indicate difficulty
    score -= min(skipped_words * 3, 25)

    # Text complexity factors
    if word_count > 0:
        avg_word_length = sum(len(w) for w in words) / word_count
        if avg_word_length > 6:
            score -= 10

    difficulty_score = max(score, 0)

    # Generate recommendations
    recommendations = []

    if difficulty_score < 50:
        recommendations.append("Text is quite challenging - consider simplification")
        recommendations.append("Try line-by-line focus mode")
        recommendations.append("Enable text-to-speech for support")

    if wpm < 80:
        recommendations.append("Reading speed is slow - practice with shorter texts")

    if hesitation_count > 3:
        recommendations.append("Many hesitations detected - try phonetic chunking")

    if skipped_words > 5:
        recommendations.append("Consider using word prediction assistance")

    return {
        "difficultyScore": difficulty_score,
        "wpm": round(wpm, 1),
        "hesitationCount": hesitation_count,
        "skippedWords": skipped_words,
        "recommendations": recommendations
    }


# ============================================
# Word Difficulty
# ============================================

@router.get("/words/difficulty/{word}")
async def get_word_difficulty(word: str):
    """
    Get difficulty score for a specific word.
    """
    syllable_count = count_syllables(word)
    word_length = len(word)

    # Estimate difficulty score
    difficulty = (word_length * 0.4) + (syllable_count * 0.4)

    return {
        "word": word,
        "difficultyScore": round(difficulty, 1),
        "syllables": word.lower(),
        "length": word_length,
        "pronunciation": None,
        "simpleMeaning": None,
        "userHistory": None
    }
