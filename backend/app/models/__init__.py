"""
Database models and Prisma client
"""
from app.models.models import (
    prisma,
    Prisma,
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
    GameType,
    ActivityType,
)

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
