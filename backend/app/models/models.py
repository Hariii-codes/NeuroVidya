"""
Prisma models and database client
"""
from enum import Enum
from .prisma_client.models import (
    User,
    ReadingPreferences,
    LearningProgress,
    GameScore,
    Activity,
    WordDifficulty,
    UserWordHistory,
    SpellingError,
    UserProfile,
    ConceptDiagram,
    DailyProgress,
    SkillMastery,
    ReadingSession,
    ReadingEvent,
)
from .prisma_client import Prisma

# Game types enum for validation
class GameType(str, Enum):
    WORD_IMAGE_MATCHING = "WORD_IMAGE_MATCHING"
    LETTER_RECOGNITION = "LETTER_RECOGNITION"
    SYLLABLE_BUILDER = "SYLLABLE_BUILDER"
    SENTENCE_BUILDER = "SENTENCE_BUILDER"
    ILLUSTRATED_STORY = "ILLUSTRATED_STORY"
    VISUAL_CONCEPT = "VISUAL_CONCEPT"

# Activity types enum for validation
class ActivityType(str, Enum):
    READ = "READ"
    SIMPLIFY_TEXT = "SIMPLIFY_TEXT"
    SPELL_CHECK = "SPELL_CHECK"
    TTS_PLAY = "TTS_PLAY"
    GAME_PLAYED = "GAME_PLAYED"
    OCR_SCAN = "OCR_SCAN"
    AI_QUESTION = "AI_QUESTION"

# Create a singleton Prisma client instance
prisma = Prisma()

# Export Prisma models and client
__all__ = [
    'prisma',
    'Prisma',
    'User',
    'ReadingPreferences',
    'LearningProgress',
    'GameScore',
    'Activity',
    'WordDifficulty',
    'UserWordHistory',
    'SpellingError',
    'UserProfile',
    'ConceptDiagram',
    'DailyProgress',
    'SkillMastery',
    'ReadingSession',
    'ReadingEvent',
    'GameType',
    'ActivityType',
]
