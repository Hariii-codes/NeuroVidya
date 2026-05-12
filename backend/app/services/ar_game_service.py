"""
AR Reading Game Service

Provides game levels, scoring, and adaptive difficulty
for the AR letter/word catching game.
"""

from typing import List, Dict, Optional
import random


class GameLevel:
    """Represents a single game level."""

    def __init__(
        self,
        level: int,
        game_type: str,
        prompt: str,
        target: str,
        options: List[str],
        difficulty: str
    ):
        self.level = level
        self.game_type = game_type  # 'letter', 'word', 'sentence'
        self.prompt = prompt
        self.target = target
        self.options = options
        self.difficulty = difficulty  # 'easy', 'medium', 'hard'


class ARGameService:
    """Manages AR game levels, scoring, and difficulty progression."""

    # Commonly confused letters for dyslexic readers
    CONFUSED_LETTERS = {
        'easy': ['b', 'd', 'p', 'q'],
        'medium': ['b', 'd', 'p', 'q', 'm', 'n', 'u', 'w'],
        'hard': ['b', 'd', 'p', 'q', 'm', 'n', 'u', 'w', 'v', 'y']
    }

    # Simple words for spelling game
    WORDS_BY_LEVEL = {
        'easy': ['cat', 'dog', 'sun', 'bat', 'hat'],
        'medium': ['tree', 'frog', 'duck', 'jump', 'swim'],
        'hard': ['clock', 'sleep', 'truck', 'plant', 'dream']
    }

    def __init__(self):
        self.current_level = 1
        self.current_streak = 0
        self.total_score = 0

    def get_level_data(self, level: int, game_type: str = 'letter') -> Dict:
        """
        Get level data for the AR game.

        Args:
            level: Level number (1+)
            game_type: 'letter', 'word', or 'sentence'

        Returns:
            Level configuration with target and options
        """
        if game_type == 'letter':
            return self._get_letter_level(level)
        elif game_type == 'word':
            return self._get_word_level(level)
        else:
            return self._get_sentence_level(level)

    def _get_letter_level(self, level: int) -> Dict:
        """Generate a letter finding level."""
        difficulty = 'easy' if level <= 3 else 'medium' if level <= 6 else 'hard'

        # Select target letter
        pool = self.CONFUSED_LETTERS[difficulty]
        target = random.choice(pool)

        # Generate options (include target + distractors)
        num_options = min(4 + level // 2, 8)
        options = [target] + random.sample([l for l in pool if l != target], num_options - 1)
        random.shuffle(options)

        # Generate prompt
        prompts = [
            f"Find the letter {target.upper()}!",
            f"Tap the letter {target.upper()}",
            f"Can you find {target.upper()}?",
            f"Where is {target.upper()}?",
            f"Point to {target.upper()}"
        ]

        return {
            'level': level,
            'gameType': 'letter',
            'prompt': random.choice(prompts),
            'target': target,
            'options': options,
            'difficulty': difficulty,
            'points': level * 10
        }

    def _get_word_level(self, level: int) -> Dict:
        """Generate a word spelling level."""
        difficulty = 'easy' if level <= 3 else 'medium' if level <= 6 else 'hard'

        pool = self.WORDS_BY_LEVEL[difficulty]
        target_word = random.choice(pool)

        # For word game, user spells the word by tapping letters
        letters = list(target_word)
        random.shuffle(letters)

        return {
            'level': level,
            'gameType': 'word',
            'prompt': f"Spell the word: {target_word.upper()}",
            'target': target_word,
            'options': letters,  # Letters to tap in order
            'difficulty': difficulty,
            'points': level * 15
        }

    def _get_sentence_level(self, level: int) -> Dict:
        """Generate a sentence recognition level."""
        # Simple sentences about dyslexia-friendly topics
        sentences = [
            "The cat sat on the mat",
            "I like to read books",
            "The sun is bright today",
            "My dog likes to play",
            "We go to school together"
        ]

        sentence = random.choice(sentences)
        target_word = random.choice(sentence.split())

        return {
            'level': level,
            'gameType': 'sentence',
            'prompt': f"Find the word: {target_word.upper()}",
            'target': target_word,
            'options': sentence.split(),  # Show all words as floating options
            'difficulty': 'medium',
            'points': level * 20
        }

    def calculate_score(
        self,
        correct: bool,
        time_taken: float,
        level: int
    ) -> Dict:
        """Calculate score based on correctness and time."""
        base_score = level * 10

        if correct:
            time_bonus = max(0, int((30 - time_taken) * 2))  # Bonus for speed
            streak_bonus = self.current_streak * 5
            total = base_score + time_bonus + streak_bonus
            self.current_streak += 1
            self.total_score += total
        else:
            self.current_streak = 0
            total = 0

        return {
            'base': base_score,
            'timeBonus': time_bonus if correct else 0,
            'streakBonus': self.current_streak * 5 if correct else 0,
            'total': total,
            'streak': self.current_streak
        }

    def get_next_level(self, current_level: int) -> int:
        """Determine the next level based on performance."""
        # Simple progression: each level advances
        return current_level + 1

    def get_confused_letters_stats(self, mistakes: Dict[str, int]) -> Dict:
        """Get statistics about commonly confused letters."""
        return {
            'totalMistakes': sum(mistakes.values()),
            'mostConfused': max(mistakes.items(), key=lambda x: x[1])[0] if mistakes else None,
            'breakdown': mistakes
        }


# Singleton instance
ar_game_service = ARGameService()
