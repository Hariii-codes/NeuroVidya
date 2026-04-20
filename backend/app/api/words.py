# backend/app/api/words.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import json

from app.core.deps import get_current_user, get_database, get_optional_user
from app.models.models import User, WordDifficulty, UserWordHistory, Prisma

router = APIRouter()


# ============================================
# Schemas
# ============================================

class WordDifficultyResponse(BaseModel):
    word: str
    difficultyScore: float  # 0-10
    length: int
    syllableCount: int
    syllables: List[str]
    pronunciation: Optional[str]
    simpleMeaning: Optional[str]
    userHistory: Optional[Dict]


class BatchWordDifficultyRequest(BaseModel):
    words: List[str]


class BatchWordDifficultyResponse(BaseModel):
    results: List[WordDifficultyResponse]


class TextComplexityRequest(BaseModel):
    text: str


class TextComplexityResponse(BaseModel):
    averageWordLength: float
    averageSyllablesPerWord: float
    difficultWords: List[WordDifficultyResponse]
    overallDifficulty: float  # 0-10
    readingLevel: str  # Elementary, Middle School, High School, College


class PersonalizedRecommendations(BaseModel):
    focusWords: List[Dict]  # Words user should practice
    masteredWords: List[str]  # Words user has mastered
    trendingWords: List[str]  # Words similar to user's problem areas


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


def split_into_syllables(word: str) -> List[str]:
    """
    Split word into syllables using basic phonetic rules.
    Simplified implementation.
    """
    word = word.lower()
    vowels = 'aeiouy'
    syllables = []
    current_syllable = ''

    # Vowel-consonant-vowel pattern (VCV) - split between consonants
    for i, char in enumerate(word):
        current_syllable += char

        # Check if we should split here
        if char in vowels and i < len(word) - 1:
            next_char = word[i + 1]
            if next_char not in vowels and i < len(word) - 2:
                next_next_char = word[i + 2]
                if next_next_char in vowels:
                    syllables.append(current_syllable)
                    current_syllable = ''

    if current_syllable:
        syllables.append(current_syllable)

    # Fallback: if no syllables found, return whole word
    if not syllables:
        return [word]

    return syllables


def calculate_difficulty_score(word: str) -> float:
    """
    Calculate difficulty score based on multiple factors.
    Returns score from 0-10 (10 = most difficult).
    """
    word_lower = word.lower()

    # Base score from word length
    length = len(word)
    length_score = min(length * 0.3, 5)

    # Syllable count
    syllables = count_syllables(word)
    syllable_score = min(syllables * 1, 3)

    # Consonant clusters (indicating phonetic complexity)
    consonant_clusters = 0
    for i in range(len(word_lower) - 1):
        if word_lower[i] not in 'aeiou' and word_lower[i + 1] not in 'aeiou':
            consonant_clusters += 1
    cluster_score = min(consonant_clusters * 0.5, 2)

    # Total score
    total_score = length_score + syllable_score + cluster_score

    return min(total_score, 10)


def get_pronunciation_guide(word: str) -> str:
    """
    Generate a simple pronunciation guide.
    In production, use a proper phonetic dictionary.
    """
    # Simplified phonetic guide
    phonetic_map = {
        'a': 'ah', 'e': 'eh', 'i': 'ih', 'o': 'ah', 'u': 'uh',
        'c': 'k', 'ph': 'f', 'tion': 'shun', 'sion': 'zhun'
    }

    guide = word.lower()
    for key, value in phonetic_map.items():
        if key in guide:
            guide = guide.replace(key, value)

    return guide.capitalize()


def determine_reading_level(difficulty: float) -> str:
    """Map difficulty score to reading level."""
    if difficulty < 3:
        return "Elementary"
    elif difficulty < 5:
        return "Middle School"
    elif difficulty < 7:
        return "High School"
    else:
        return "College/Advanced"


# ============================================
# API Endpoints
# ============================================

@router.get("/{word}", response_model=WordDifficultyResponse)
async def get_word_difficulty(
    word: str,
    current_user: User = Depends(get_optional_user),
    db: Prisma = Depends(get_database)
):
    """
    Get comprehensive difficulty analysis for a single word.
    """
    word_lower = word.lower()

    # Calculate metrics directly (no DB for WordDifficulty in this implementation)
    word_length = len(word)
    syllable_count = count_syllables(word)
    difficulty_score = calculate_difficulty_score(word)
    pronunciation = get_pronunciation_guide(word)
    syllables_list = split_into_syllables(word)

    # For unauthenticated users, return basic difficulty without user history
    if not current_user:
        return WordDifficultyResponse(
            word=word,
            difficultyScore=round(difficulty_score, 1),
            length=word_length,
            syllableCount=syllable_count,
            syllables=syllables_list,
            pronunciation=pronunciation,
            simpleMeaning=None,
            userHistory=None
        )

    # Authenticated user path - would check database here
    # For now, return the same result
    return WordDifficultyResponse(
        word=word,
        difficultyScore=round(difficulty_score, 1),
        length=word_length,
        syllableCount=syllable_count,
        syllables=syllables_list,
        pronunciation=pronunciation,
        simpleMeaning=None,
        userHistory=None
    )

    if not word_difficulty:
        # Calculate metrics
        word_length = len(word)
        syllable_count = count_syllables(word)
        difficulty_score = calculate_difficulty_score(word)

        word_difficulty = WordDifficulty(
            word=word_lower,
            length=word_length,
            syllableCount=syllable_count,
            difficultyScore=difficulty_score,
            pronunciation=get_pronunciation_guide(word),
            syllables=json.dumps(split_into_syllables(word))
        )
        db.add(word_difficulty)
        db.commit()
        db.refresh(word_difficulty)

    # Get user's history with this word
    user_history = db.query(UserWordHistory).filter(
        UserWordHistory.userId == current_user.id,
        UserWordHistory.wordId == word_difficulty.id
    ).first()

    # Calculate user-specific score
    base_score = word_difficulty.difficultyScore

    if user_history and user_history.timesSeen > 0:
        error_rate = user_history.timesErrored / user_history.timesSeen
        user_adjustment = error_rate * 2  # User finds this word harder
        final_score = min(base_score + user_adjustment, 10)
    else:
        final_score = base_score

    return WordDifficultyResponse(
        word=word,
        difficultyScore=round(final_score, 1),
        length=word_difficulty.length,
        syllableCount=word_difficulty.syllableCount,
        syllables=json.loads(word_difficulty.syllables) if word_difficulty.syllables else [word_lower],
        pronunciation=word_difficulty.pronunciation,
        simpleMeaning=word_difficulty.simpleMeaning,
        userHistory={
            "timesSeen": user_history.timesSeen if user_history else 0,
            "timesCorrect": user_history.timesCorrect if user_history else 0,
            "timesErrored": user_history.timesErrored if user_history else 0,
            "lastSeenAt": user_history.lastSeenAt.isoformat() if user_history else None
        } if user_history else None
    )


@router.post("/batch", response_model=BatchWordDifficultyResponse)
async def get_batch_difficulty(
    data: BatchWordDifficultyRequest,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get difficulty scores for multiple words at once.
    """
    results = []

    for word in data.words:
        if len(word.strip()) < 2:
            continue

        word_lower = word.lower()

        word_difficulty = db.query(WordDifficulty).filter(
            WordDifficulty.word == word_lower
        ).first()

        if not word_difficulty:
            word_length = len(word)
            syllable_count = count_syllables(word)
            difficulty_score = calculate_difficulty_score(word)

            word_difficulty = WordDifficulty(
                word=word_lower,
                length=word_length,
                syllableCount=syllable_count,
                difficultyScore=difficulty_score,
                pronunciation=get_pronunciation_guide(word),
                syllables=json.dumps(split_into_syllables(word))
            )
            db.add(word_difficulty)

        db.commit()
        db.refresh(word_difficulty)

        user_history = db.query(UserWordHistory).filter(
            UserWordHistory.userId == current_user.id,
            UserWordHistory.wordId == word_difficulty.id
        ).first()

        base_score = word_difficulty.difficultyScore
        if user_history and user_history.timesSeen > 0:
            error_rate = user_history.timesErrored / user_history.timesSeen
            final_score = min(base_score + error_rate * 2, 10)
        else:
            final_score = base_score

        results.append(WordDifficultyResponse(
            word=word,
            difficultyScore=round(final_score, 1),
            length=word_difficulty.length,
            syllableCount=word_difficulty.syllableCount,
            syllables=json.loads(word_difficulty.syllables) if word_difficulty.syllables else [word_lower],
            pronunciation=word_difficulty.pronunciation,
            simpleMeaning=word_difficulty.simpleMeaning,
            userHistory=None
        ))

    return BatchWordDifficultyResponse(results=results)


@router.post("/analyze-text", response_model=TextComplexityResponse)
async def analyze_text_complexity(
    data: TextComplexityRequest,
    current_user: User = Depends(get_optional_user),
    db: Prisma = Depends(get_database)
):
    """
    Analyze the complexity of a text passage.
    """
    words = data.text.split()

    if not words:
        return TextComplexityResponse(
            averageWordLength=0,
            averageSyllablesPerWord=0,
            difficultWords=[],
            overallDifficulty=0,
            readingLevel="Elementary"
        )

    # Calculate metrics
    total_length = sum(len(w.strip('.,!?;:')) for w in words)
    avg_word_length = total_length / len(words)

    total_syllables = sum(count_syllables(w.strip('.,!?;:')) for w in words)
    avg_syllables = total_syllables / len(words)

    # Find difficult words (score > 5)
    difficult_words_data = []
    for word in words:
        clean_word = word.strip('.,!?;:').lower()
        if len(clean_word) < 3:
            continue

        score = calculate_difficulty_score(clean_word)
        if score > 5:
            syllables_list = split_into_syllables(clean_word)
            difficult_words_data.append(WordDifficultyResponse(
                word=clean_word,
                difficultyScore=round(score, 1),
                length=len(clean_word),
                syllableCount=count_syllables(clean_word),
                syllables=syllables_list,
                pronunciation=get_pronunciation_guide(clean_word),
                simpleMeaning=None,
                userHistory=None
            ))

    # Calculate overall difficulty
    length_difficulty = min(avg_word_length * 0.3, 3)
    syllable_difficulty = min(avg_syllables * 1.5, 4)
    vocab_difficulty = min(len(difficult_words_data) * 0.2, 3)

    overall_difficulty = length_difficulty + syllable_difficulty + vocab_difficulty

    return TextComplexityResponse(
        averageWordLength=round(avg_word_length, 2),
        averageSyllablesPerWord=round(avg_syllables, 2),
        difficultWords=difficult_words_data[:10],  # Top 10
        overallDifficulty=round(overall_difficulty, 1),
        readingLevel=determine_reading_level(overall_difficulty)
    )


@router.get("/recommendations/personalized", response_model=PersonalizedRecommendations)
async def get_personalized_recommendations(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get personalized word recommendations based on user's error patterns.
    """
    # Get words user struggles with (high error rate)
    struggling_words = db.query(UserWordHistory).filter(
        UserWordHistory.userId == current_user.id,
        UserWordHistory.timesSeen > 2
    ).all()

    focus_words = []
    mastered_words = []

    for history in struggling_words:
        if history.timesErrored > 0:
            error_rate = history.timesErrored / history.timesSeen
            if error_rate > 0.3:  # More than 30% error rate
                word = db.query(WordDifficulty).filter(
                    WordDifficulty.id == history.wordId
                ).first()

                if word:
                    focus_words.append({
                        "word": word.word,
                        "errorRate": round(error_rate, 2),
                        "timesSeen": history.timesSeen,
                        "difficulty": word.difficultyScore
                    })
            elif error_rate == 0 and history.timesSeen > 5:
                word = db.query(WordDifficulty).filter(
                    WordDifficulty.id == history.wordId
                ).first()
                if word:
                    mastered_words.append(word.word)

    # Get trending words (similar to problem words)
    trending_words = []
    if focus_words:
        # Find words with similar difficulty or patterns
        avg_difficulty = sum(w["difficulty"] for w in focus_words) / len(focus_words)

        similar_words = db.query(WordDifficulty).filter(
            WordDifficulty.difficultyScore.between(avg_difficulty - 1, avg_difficulty + 1),
            WordDifficulty.word.not_in([w["word"] for w in focus_words])
        ).limit(10).all()

        trending_words = [w.word for w in similar_words]

    return PersonalizedRecommendations(
        focusWords=focus_words[:5],
        masteredWords=mastered_words[:10],
        trendingWords=trending_words[:10]
    )


@router.post("/{word}/track")
async def track_word_interaction(
    word: str,
    correct: bool,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Track user's interaction with a word (correct/incorrect).
    """
    word_lower = word.lower()

    # Get or create word difficulty record
    word_difficulty = db.query(WordDifficulty).filter(
        WordDifficulty.word == word_lower
    ).first()

    if not word_difficulty:
        word_difficulty = WordDifficulty(
            word=word_lower,
            length=len(word),
            syllableCount=count_syllables(word),
            difficultyScore=calculate_difficulty_score(word),
            pronunciation=get_pronunciation_guide(word)
        )
        db.add(word_difficulty)
        db.commit()
        db.refresh(word_difficulty)

    # Get or create user history
    user_history = db.query(UserWordHistory).filter(
        UserWordHistory.userId == current_user.id,
        UserWordHistory.wordId == word_difficulty.id
    ).first()

    if user_history:
        user_history.timesSeen += 1
        user_history.lastSeenAt = datetime.now()
        if correct:
            user_history.timesCorrect += 1
        else:
            user_history.timesErrored += 1
    else:
        user_history = UserWordHistory(
            userId=current_user.id,
            wordId=word_difficulty.id,
            timesSeen=1,
            timesCorrect=1 if correct else 0,
            timesErrored=0 if correct else 1
        )
        db.add(user_history)

    db.commit()

    return {"success": True}
