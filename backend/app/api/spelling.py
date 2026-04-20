# backend/app/api/spelling.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Set
from datetime import datetime
from collections import Counter
import json
import re

from app.core.deps import get_current_user, get_database, get_optional_user
from app.models.models import User, SpellingError, UserProfile, Prisma

router = APIRouter()


# ============================================
# Schemas
# ============================================

class SpellingCheckRequest(BaseModel):
    text: str


class SpellingErrorSchema(BaseModel):
    original: str
    correction: str
    errorType: str  # LETTER_SWAP, MISSING_VOWEL, EXTRA_LETTER, REVERSAL
    position: int
    suggestions: List[str] = []


class SpellingCheckResponse(BaseModel):
    errors: List[SpellingErrorSchema]
    userPattern: Dict[str, int] = {}  # Common error types
    correctedText: str


class ErrorPatternAnalysis(BaseModel):
    commonErrors: List[Dict]
    strugglingPatterns: List[str]
    averageDifficulty: float
    recommendedExercises: List[str]


# ============================================
# Comprehensive Word Dictionary
# ============================================

def get_comprehensive_word_list() -> Set[str]:
    """
    Return a comprehensive set of English words for spell checking.
    Includes common words, educational terms, and more.
    """
    # Comprehensive word list
    common_words = {
        # Pronouns & articles
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
        'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
        'this', 'that', 'these', 'those', 'a', 'an', 'the',

        # Common verbs
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do',
        'does', 'did', 'doing', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
        'can', 'cannot', 'cant', 'go', 'goes', 'went', 'gone', 'come', 'comes', 'came', 'get', 'gets',
        'got', 'gotten', 'make', 'makes', 'made', 'take', 'takes', 'took', 'taken', 'see', 'sees', 'saw',
        'seen', 'know', 'knows', 'knew', 'known', 'think', 'thinks', 'thought', 'want', 'wants', 'wanted',
        'like', 'likes', 'look', 'looks', 'looked', 'use', 'uses', 'used', 'find', 'finds', 'found',
        'give', 'gives', 'gave', 'given', 'tell', 'tells', 'told', 'ask', 'asks', 'asked', 'work', 'works',
        'worked', 'seem', 'seems', 'seemed', 'feel', 'feels', 'felt', 'try', 'tries', 'tried', 'leave', 'leaves',
        'left', 'call', 'calls', 'called', 'keep', 'keeps', 'kept', 'let', 'lets', 'begin', 'begins', 'began',
        'begun', 'show', 'shows', 'shown', 'hear', 'hears', 'heard', 'play', 'plays', 'played', 'run', 'runs',
        'ran', 'move', 'moves', 'moved', 'live', 'lives', 'lived', 'believe', 'believes', 'believed',
        'bring', 'brings', 'brought', 'write', 'writes', 'wrote', 'written', 'sit', 'sits', 'sat', 'stand',
        'stands', 'stood', 'lose', 'loses', 'lost', 'pay', 'pays', 'paid', 'meet', 'meets', 'met', 'learn',
        'learns', 'learned', 'change', 'changes', 'changed', 'lead', 'leads', 'led', 'understand', 'understands',
        'understood', 'watch', 'watches', 'watched', 'follow', 'follows', 'followed', 'stop', 'stops', 'stopped',
        'create', 'creates', 'created', 'speak', 'speaks', 'spoke', 'spoken', 'read', 'reads', 'reading', 'spend',
        'spends', 'spent', 'grow', 'grows', 'grew', 'grown', 'open', 'opens', 'opened', 'walk', 'walks', 'walked',
        'win', 'wins', 'won', 'offer', 'offers', 'offered', 'remember', 'remembers', 'remembered', 'love', 'loves',
        'loved', 'consider', 'considers', 'considered', 'appear', 'appears', 'appeared', 'buy', 'buys', 'bought',
        'wait', 'waits', 'waited', 'serve', 'serves', 'served', 'die', 'dies', 'died', 'send', 'sends', 'sent',
        'expect', 'expects', 'expected', 'build', 'builds', 'built', 'stay', 'stays', 'stayed', 'fall', 'falls',
        'fell', 'fallen', 'cut', 'cuts', 'put', 'puts', 'end', 'ends', 'ended',

        # Common nouns
        'time', 'year', 'people', 'way', 'day', 'man', 'woman', 'child', 'children', 'world', 'life',
        'part', 'school', 'student', 'system', 'program', 'question', 'work', 'government', 'number',
        'night', 'point', 'home', 'water', 'room', 'mother', 'area', 'money', 'story', 'fact', 'month',
        'lot', 'right', 'study', 'book', 'eye', 'job', 'word', 'business', 'issue', 'side', 'kind', 'head',
        'house', 'service', 'friend', 'father', 'power', 'hour', 'game', 'line', 'end', 'member', 'law',
        'car', 'city', 'community', 'name', 'president', 'team', 'minute', 'idea', 'kid', 'body', 'information',
        'back', 'parent', 'face', 'others', 'level', 'office', 'door', 'health', 'person', 'art', 'war', 'history',
        'party', 'result', 'change', 'morning', 'reason', 'research', 'girl', 'guy', 'food', 'moment', 'air',
        'teacher', 'force', 'education',

        # Educational words
        'science', 'math', 'english', 'history', 'geography', 'physics', 'chemistry', 'biology', 'music',
        'art', 'physical', 'social', 'studies', 'language', 'literature', 'algebra', 'geometry',
        'calculus', 'grammar', 'vocabulary', 'reading', 'writing', 'comprehension', 'lesson', 'homework',
        'class', 'grade', 'test', 'exam', 'quiz', 'project', 'assignment', 'report', 'essay', 'paper', 'notes',
        'school', 'university', 'college', 'library', 'classroom', 'principal', 'education', 'learning',
        'knowledge', 'understanding', 'achievement', 'success', 'failure', 'improvement', 'practice', 'exercise',

        # Nature & animals
        'animal', 'plant', 'tree', 'flower', 'river', 'mountain', 'ocean', 'sea', 'lake', 'forest', 'desert',
        'rain', 'snow', 'wind', 'sun', 'moon', 'star', 'earth', 'planet', 'solar', 'system', 'space',
        'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep', 'chicken', 'duck', 'rabbit', 'lion',
        'tiger', 'bear', 'elephant', 'monkey', 'snake', 'frog', 'butterfly',

        # Colors & shapes
        'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray',
        'circle', 'square', 'triangle', 'rectangle', 'star', 'heart', 'shape', 'color', 'size', 'big', 'small',
        'large', 'tiny', 'huge', 'medium', 'short', 'long', 'tall', 'wide', 'narrow',

        # Food
        'food', 'drink', 'eat', 'bread', 'rice', 'meat', 'fruit', 'vegetable', 'apple', 'banana',
        'orange', 'grape', 'mango', 'pizza', 'burger', 'sandwich', 'soup', 'salad', 'cake', 'cookie',
        'milk', 'water', 'juice', 'tea', 'coffee', 'breakfast', 'lunch', 'dinner',

        # Family & home
        'family', 'mother', 'father', 'brother', 'sister', 'son', 'daughter', 'grandmother', 'grandfather',
        'house', 'home', 'room', 'kitchen', 'bedroom', 'bathroom', 'garden',

        # Numbers
        'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
        'hundred', 'thousand', 'million', 'first', 'second', 'third',

        # Time
        'time', 'hour', 'minute', 'today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening', 'night',

        # Common adjectives
        'good', 'bad', 'big', 'small', 'fast', 'slow', 'hard', 'easy', 'important', 'beautiful',
        'happy', 'sad', 'angry', 'afraid', 'brave', 'tired', 'excited',

        # Prepositions & conjunctions
        'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'about', 'between',
        'and', 'but', 'or', 'nor', 'so', 'yet', 'because', 'although', 'though',

        # Question words
        'what', 'when', 'where', 'who', 'why', 'how', 'which', 'whose', 'whom',

        # Common words
        'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'hello', 'world',
        'please', 'thank', 'sorry', 'excuse', 'help', 'yes', 'no', 'their', 'there', 'theyre',
        'your', 'youre', 'its', 'it', 'were', 'was', 'said', 'says', 'going', 'goes', 'gone',
    }

    # Add plurals
    plurals = set()
    for word in list(common_words):
        if word.endswith('y'):
            plurals.add(word[:-1] + 'ies')
        elif word.endswith('s') or word.endswith('x') or word.endswith('ch') or word.endswith('sh'):
            plurals.add(word + 'es')
        else:
            plurals.add(word + 's')

    return common_words | plurals


def get_common_word_list() -> set:
    """Return comprehensive word list for spell checking."""
    return get_comprehensive_word_list()


# ============================================
# Error Pattern Detection
# ============================================

ERROR_PATTERNS = {
    'b_d_confusion': {
        'patterns': [r'\bb\b', r'\bd\b'],
        'description': 'b/d letter confusion',
        'exercises': ['letter_discrimination_bd', 'tracing_bd']
    },
    'p_q_confusion': {
        'patterns': [r'\bp\b', r'\bq\b'],
        'description': 'p/q letter confusion',
        'exercises': ['letter_discrimination_pq', 'mirror_writing_detection']
    },
    'missing_vowels': {
        'patterns': [r'([^aeiou])[bcdfghjklmnpqrstvwxyz]\1'],
        'description': 'Omitted vowels',
        'exercises': ['vowel_insertion', 'phonemic_awareness']
    },
    'reversal': {
        'patterns': [r'was\s+saw', r'no\s+on', r'pat\s+tap'],
        'description': 'Word reversals',
        'exercises': ['directional_training', 'sequencing_exercises']
    }
}


def detect_error_type(wrong_word: str, correct_word: str) -> str:
    """
    Detect the type of spelling error based on the difference between
    the wrong and correct words.
    """
    wrong = wrong_word.lower()
    correct = correct_word.lower()

    # Check for letter swaps
    if len(wrong) == len(correct):
        swap_count = sum(1 for i in range(len(wrong)) if wrong[i] != correct[i])
        if swap_count == 2:
            if set(wrong) & set(correct) & {'b', 'd'}:
                return 'B_D_SWAP'
            if set(wrong) & set(correct) & {'p', 'q'}:
                return 'P_Q_SWAP'
            return 'LETTER_SWAP'

    # Check for missing letter
    if len(wrong) < len(correct):
        removed_vowels = [c for c in correct if c not in wrong and c in 'aeiou']
        if removed_vowels:
            return 'MISSING_VOWEL'
        return 'MISSING_LETTER'

    # Check for extra letter
    if len(wrong) > len(correct):
        return 'EXTRA_LETTER'

    # Check for reversal
    reversal_pairs = [
        ('was', 'saw'), ('no', 'on'), ('pat', 'tap'),
        ('bat', 'tab'), ('god', 'dog')
    ]
    for pair in reversal_pairs:
        if (wrong, correct) in [(pair[0], pair[1]), (pair[1], pair[0])]:
            return 'REVERSAL'

    # Check for specific letter confusion
    confusion_pairs = [('b', 'd'), ('p', 'q'), ('m', 'w'), ('u', 'n')]
    for c1, c2 in confusion_pairs:
        if c1 in wrong and c2 in correct:
            return f'{c1.upper()}_{c2.upper()}_CONFUSION'

    return 'UNKNOWN'


def find_similar_words(word: str, max_distance: int = 2) -> List[str]:
    """
    Find similar words using improved edit distance.
    More accurate to reduce false positives.
    """
    word_dict = get_comprehensive_word_list()

    def edit_distance(a: str, b: str) -> int:
        """Calculate Levenshtein edit distance."""
        if len(a) < len(b):
            return edit_distance(b, a)
        if len(b) == 0:
            return len(a)
        previous_row = range(len(b) + 1)
        for i, c1 in enumerate(a):
            current_row = [i + 1]
            for j, c2 in enumerate(b):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        return previous_row[-1]

    word_lower = word.lower()

    # Word is in dictionary - not an error
    if word_lower in word_dict:
        return []

    similar = []
    for dict_word in word_dict:
        dict_word_lower = dict_word.lower()

        # Calculate edit distance
        distance = edit_distance(word_lower, dict_word_lower)

        # Only consider words within max_distance
        if distance <= max_distance and distance > 0:
            similar.append((dict_word, distance))

    # Sort by edit distance and return top 5
    similar.sort(key=lambda x: x[1])
    result = [word for word, distance in similar[:5]]

    return result


# ============================================
# API Endpoints
# ============================================

@router.post("/check", response_model=SpellingCheckResponse)
async def check_spelling(
    data: SpellingCheckRequest,
    current_user: User = Depends(get_optional_user),
    db: Prisma = Depends(get_database)
):
    """
    Check text for spelling errors with improved accuracy.
    """
    text = data.text
    words = text.split()
    errors = []

    # Get comprehensive word list
    word_dict = get_comprehensive_word_list()

    for i, word in enumerate(words):
        # Clean word of punctuation
        clean_word = word.strip('.,!?;:"\'()[]{}').lower()

        # Skip empty, very short words, or numbers
        if len(clean_word) < 3:
            continue

        # Skip if it's a number
        if clean_word.isdigit():
            continue

        # Skip if word contains numbers
        if any(c.isdigit() for c in clean_word):
            continue

        # Check if word is in dictionary
        if clean_word in word_dict:
            continue

        # Find similar words
        suggestions = find_similar_words(clean_word)

        # Only mark as error if we found close matches
        if suggestions and suggestions[0].lower() != clean_word:
            error_type = detect_error_type(clean_word, suggestions[0])

            spelling_error = SpellingErrorSchema(
                original=word,
                correction=suggestions[0],
                errorType=error_type,
                position=i,
                suggestions=suggestions
            )
            errors.append(spelling_error)

            # Store error in database for pattern learning
            if current_user:
                db_error = db.query(SpellingError).filter(
                    SpellingError.userId == current_user.id,
                    SpellingError.errorWord == clean_word,
                    SpellingError.correctWord == suggestions[0]
                ).first()

                if db_error:
                    db_error.timesSeen += 1
                    db_error.lastSeenAt = datetime.now()
                else:
                    db_error = SpellingError(
                        userId=current_user.id,
                        errorWord=clean_word,
                        correctWord=suggestions[0],
                        errorType=error_type,
                        context=text[max(0, i-10):i+len(word)+10],
                        timesSeen=1
                    )
                    db.add(db_error)

    if current_user:
        db.commit()

    # Generate corrected text
    corrected_words = []
    for word in words:
        # Check if this word was marked as error
        corrected = False
        for error in errors:
            if error.position < len(words) and words[error.position] == word:
                corrected_words.append(error.correction)
                corrected = True
                break

        if not corrected:
            corrected_words.append(word)

    corrected_text = ' '.join(corrected_words)

    # Get user's error pattern
    user_pattern = {}
    if current_user:
        all_errors = db.query(SpellingError).filter(
            SpellingError.userId == current_user.id
        ).all()

        error_counter = Counter(e.errorType for e in all_errors)
        user_pattern = dict(error_counter)

    return SpellingCheckResponse(
        errors=errors,
        userPattern=user_pattern,
        correctedText=corrected_text
    )


@router.get("/patterns", response_model=ErrorPatternAnalysis)
async def get_error_patterns(
    current_user: User = Depends(get_optional_user),
    db: Prisma = Depends(get_database)
):
    """
    Analyze user's error patterns and provide recommendations.
    """
    # Return empty analysis for unauthenticated users
    if not current_user:
        return ErrorPatternAnalysis(
            commonErrors=[],
            strugglingPatterns=[],
            averageDifficulty=0.0,
            recommendedExercises=["Start with basic spelling exercises"]
        )

    # Get all errors for user
    errors = db.query(SpellingError).filter(
        SpellingError.userId == current_user.id
    ).all()

    if not errors:
        return ErrorPatternAnalysis(
            commonErrors=[],
            strugglingPatterns=[],
            averageDifficulty=0.0,
            recommendedExercises=["Start with basic spelling exercises"]
        )

    # Count error types
    error_counter = Counter(e.errorType for e in errors)
    common_errors = [
        {"type": error_type, "count": count}
        for error_type, count in error_counter.most_common(5)
    ]

    # Identify struggling patterns
    struggling_patterns = []
    for error in errors:
        if error.errorType == 'B_D_SWAP':
            struggling_patterns.append("b/d letter confusion")
        elif error.errorType == 'P_Q_SWAP':
            struggling_patterns.append("p/q letter confusion")
        elif error.errorType == 'MISSING_VOWEL':
            struggling_patterns.append("Vowel omission")

    struggling_patterns = list(set(struggling_patterns))

    # Calculate average difficulty
    total_errors = sum(e.timesSeen for e in errors)
    avg_difficulty = min(total_errors / 10, 10)

    # Get recommended exercises
    recommended_exercises = []
    for error_type, _ in error_counter.most_common(3):
        if error_type in ['B_D_SWAP', 'P_Q_SWAP']:
            recommended_exercises.extend(['letter_discrimination', 'tracing_practice'])
        elif error_type == 'MISSING_VOWEL':
            recommended_exercises.extend(['vowel_insertion', 'phonemic_awareness'])
        elif error_type == 'REVERSAL':
            recommended_exercises.extend(['directional_training', 'sequencing'])

    # Update user profile
    profile = db.query(UserProfile).filter(
        UserProfile.userId == current_user.id
    ).first()

    if profile:
        profile.commonErrors = json.dumps(common_errors)
        profile.strugglingPatterns = json.dumps(struggling_patterns)
        profile.averageDifficulty = avg_difficulty
        profile.targetExercises = json.dumps(recommended_exercises)
    else:
        profile = UserProfile(
            userId=current_user.id,
            commonErrors=json.dumps(common_errors),
            strugglingPatterns=json.dumps(struggling_patterns),
            averageDifficulty=avg_difficulty,
            targetExercises=json.dumps(recommended_exercises)
        )
        db.add(profile)

    db.commit()

    return ErrorPatternAnalysis(
        commonErrors=common_errors,
        strugglingPatterns=struggling_patterns,
        averageDifficulty=avg_difficulty,
        recommendedExercises=recommended_exercises[:5]
    )


@router.get("/history")
async def get_spelling_history(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get user's spelling error history with mastery status.
    """
    errors = db.query(SpellingError).filter(
        SpellingError.userId == current_user.id
    ).order_by(SpellingError.timesSeen.desc()).limit(50).all()

    return {
        "errors": [
            {
                "id": e.id,
                "errorWord": e.errorWord,
                "correctWord": e.correctWord,
                "errorType": e.errorType,
                "timesSeen": e.timesSeen,
                "lastSeenAt": e.lastSeenAt.isoformat(),
                "masteredAt": e.masteredAt.isoformat() if e.masteredAt else None
            }
            for e in errors
        ]
    }


@router.post("/words/{word_id}/mark-mastered")
async def mark_word_mastered(
    word_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Mark a specific word as mastered by the user.
    """
    error = db.query(SpellingError).filter(
        SpellingError.id == word_id,
        SpellingError.userId == current_user.id
    ).first()

    if not error:
        raise HTTPException(status_code=404, detail="Spelling error not found")

    error.masteredAt = datetime.now()
    db.commit()

    return {"success": True, "word": error.correctWord}
