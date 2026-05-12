"""
Pronunciation Analysis Service

Analyzes spoken text against expected text using:
- Levenshtein distance for word alignment
- Phonetic similarity scoring
- Confidence threshold analysis
"""

from typing import List, Dict, Tuple, Optional
import re
from difflib import SequenceMatcher
import json


class PronunciationError:
    def __init__(
        self,
        word: str,
        expected: str,
        actual: str,
        position: int,
        confidence: float,
        phonetic_guide: Optional[str] = None
    ):
        self.word = word
        self.expected = expected
        self.actual = actual
        self.position = position
        self.confidence = confidence
        self.phonetic_guide = phonetic_guide

    def to_dict(self) -> dict:
        return {
            "word": self.word,
            "expected": self.expected,
            "actual": self.actual,
            "position": self.position,
            "confidence": self.confidence,
            "phoneticGuide": self.phonetic_guide
        }


class PronunciationAnalyzer:
    """Analyzes pronunciation by comparing spoken vs expected text."""

    # Common phonetic substitutions for dyslexic readers
    PHONETIC_SIMILARITY = {
        # b/d confusion
        ("b", "d"): 0.7, ("d", "b"): 0.7,
        # p/q confusion
        ("p", "q"): 0.7, ("q", "p"): 0.7,
        # m/n confusion
        ("m", "n"): 0.8, ("n", "m"): 0.8,
        # vowel substitutions
        ("a", "e"): 0.8, ("e", "a"): 0.8,
        ("i", "e"): 0.8, ("e", "i"): 0.8,
        ("o", "u"): 0.8, ("u", "o"): 0.8,
    }

    # Phonetic guides for common words
    PHONETIC_GUIDES = {
        "food": "/fuːd/",
        "sunlight": "/ˈsʌn.laɪt/",
        "water": "/ˈwɔː.tər/",
        "photosynthesis": "/ˌfoʊ.təʊˈsɪn.θə.sɪs/",
        "evaporation": "/ɪˌvæp.əˈreɪ.ʃən/",
        "precipitation": "/prɪˌsɪp.ɪˈteɪ.ʃən/",
        "chlorophyll": "/ˈklɔː.rə.fɪl/",
        "glucose": "/ˈɡluː.koʊs/",
        "pyramid": "/ˈpɪr.ə.mɪd/",
        "hieroglyphics": "/ˌhaɪ.ə.rəˈɡlɪf.ɪks/",
    }

    def __init__(self, confidence_threshold: float = 0.85):
        self.confidence_threshold = confidence_threshold

    def normalize_text(self, text: str) -> List[str]:
        """Clean and split text into words."""
        # Remove punctuation and convert to lowercase
        cleaned = re.sub(r'[^\w\s]', '', text.lower())
        return cleaned.split()

    def levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate edit distance between two strings."""
        if len(s1) < len(s2):
            return self.levenshtein_distance(s2, s1)

        if len(s2) == 0:
            return len(s1)

        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row

        return previous_row[-1]

    def calculate_phonetic_similarity(self, word1: str, word2: str) -> float:
        """Calculate phonetic similarity between two words."""
        if word1 == word2:
            return 1.0

        # Check phonetic similarity table
        key = (word1[0] if word1 else "", word2[0] if word2 else "")
        similarity = self.PHONETIC_SIMILARITY.get(key)

        if similarity:
            # Adjust based on full word similarity
            ratio = SequenceMatcher(None, word1, word2).ratio()
            return similarity * ratio

        # Use string similarity as fallback
        return SequenceMatcher(None, word1, word2).ratio()

    def align_words(
        self,
        expected: List[str],
        spoken: List[str]
    ) -> List[Tuple[Optional[str], Optional[str]]]:
        """
        Align spoken words to expected words using dynamic programming.

        Uses similarity-based matching to align mispronounced words.
        Returns list of (expected_word, spoken_word) tuples.
        None indicates insertion or deletion.
        """
        m, n = len(expected), len(spoken)

        # Handle empty cases
        if m == 0:
            return [(None, word) for word in spoken]
        if n == 0:
            return [(word, None) for word in expected]

        # Calculate similarity matrix
        sim = [[0.0] * (n + 1) for _ in range(m + 1)]

        # Fill similarity matrix (1.0 = exact match, 0.0 = completely different)
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if expected[i - 1] == spoken[j - 1]:
                    sim[i][j] = 1.0
                else:
                    # Use string similarity for partial matches
                    sim[i][j] = SequenceMatcher(None, expected[i - 1], spoken[j - 1]).ratio()

        # Dynamic programming for optimal alignment
        # We want to maximize similarity, so we use negative costs
        dp = [[float('-inf')] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = 0

        for i in range(m + 1):
            dp[i][0] = -i  # Cost of deleting i expected words
        for j in range(n + 1):
            dp[0][j] = -j  # Cost of inserting j spoken words

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                # Match/mismatch: use similarity as reward
                match_score = dp[i - 1][j - 1] + sim[i][j] - 1
                delete_cost = dp[i - 1][j] - 1
                insert_cost = dp[i][j - 1] - 1
                dp[i][j] = max(match_score, delete_cost, insert_cost)

        # Backtrack to find alignment
        alignment = []
        i, j = m, n

        while i > 0 or j > 0:
            if i > 0 and j > 0:
                # Check if this was a match/substitution
                match_score = dp[i - 1][j - 1] + sim[i][j] - 1
                if dp[i][j] == match_score:
                    # Align these words (even if not exact match)
                    alignment.append((expected[i - 1], spoken[j - 1]))
                    i -= 1
                    j -= 1
                    continue

            # Prefer deletion over insertion when tied
            if i > 0 and (j == 0 or dp[i][j] == dp[i - 1][j] - 1):
                alignment.append((expected[i - 1], None))  # Deletion (missed word)
                i -= 1
            else:
                alignment.append((None, spoken[j - 1]))  # Insertion (extra word)
                j -= 1

        return list(reversed(alignment))

    def analyze_pronunciation(
        self,
        expected_text: str,
        spoken_text: str
    ) -> Dict:
        """
        Analyze pronunciation by comparing texts.

        Returns:
            Dict with accuracy score, error details, and feedback
        """
        expected_words = self.normalize_text(expected_text)
        spoken_words = self.normalize_text(spoken_text)

        if not expected_words:
            return {
                "accuracyScore": 100.0,
                "wordsCorrect": 0,
                "wordsIncorrect": 0,
                "errors": [],
                "phoneticFeedback": None
            }

        # Align words
        alignment = self.align_words(expected_words, spoken_words)

        # Analyze each alignment
        errors = []
        correct_count = 0
        incorrect_count = 0
        position = 0

        for expected_word, spoken_word in alignment:
            if expected_word is None:
                # Extra word spoken - skip
                continue

            position += 1

            if spoken_word is None:
                # Missed word
                incorrect_count += 1
                errors.append(PronunciationError(
                    word="[skipped]",  # Show that the word was skipped
                    expected=expected_word,  # The correct word they should have said
                    actual="[missed]",
                    position=position,
                    confidence=0.0,
                    phonetic_guide=self.PHONETIC_GUIDES.get(expected_word)
                ))
                continue

            # Compare words
            edit_distance = self.levenshtein_distance(expected_word, spoken_word)
            phonetic_sim = self.calculate_phonetic_similarity(expected_word, spoken_word)

            # Calculate confidence score
            if expected_word == spoken_word:
                confidence = 1.0
                correct_count += 1
            elif edit_distance == 1:
                confidence = 0.7
                incorrect_count += 1
            elif edit_distance == 2:
                confidence = 0.4
                incorrect_count += 1
            else:
                confidence = phonetic_sim
                incorrect_count += 1

            # Flag as error if below threshold
            if confidence < self.confidence_threshold:
                errors.append(PronunciationError(
                    word=spoken_word,  # Show what the user actually said
                    expected=expected_word,  # The correct word
                    actual=spoken_word,
                    position=position,
                    confidence=confidence,
                    phonetic_guide=self.PHONETIC_GUIDES.get(expected_word)
                ))

        # Calculate overall accuracy
        total_words = correct_count + incorrect_count
        accuracy_score = (correct_count / total_words * 100) if total_words > 0 else 0

        # Generate phonetic feedback
        phonetic_feedback = self._generate_feedback(errors, correct_count, incorrect_count)

        return {
            "accuracyScore": round(accuracy_score, 2),
            "wordsCorrect": correct_count,
            "wordsIncorrect": incorrect_count,
            "errors": [error.to_dict() for error in errors],
            "phoneticFeedback": phonetic_feedback
        }

    def _generate_feedback(
        self,
        errors: List[PronunciationError],
        correct: int,
        incorrect: int
    ) -> Dict:
        """Generate personalized feedback based on performance."""
        total = correct + incorrect
        if total == 0:
            return {}

        # Identify problem patterns
        problem_words = [e.word for e in errors if e.confidence < 0.5]
        improved_words = [e.word for e in errors if 0.5 <= e.confidence < 0.85]

        return {
            "overallScore": round((correct / total) * 100, 2),
            "improvedWords": improved_words,
            "needsPractice": problem_words,
            "message": self._get_feedback_message(correct / total)
        }

    def _get_feedback_message(self, accuracy: float) -> str:
        """Get encouraging feedback message."""
        if accuracy >= 0.9:
            return "Excellent reading! You're doing great!"
        elif accuracy >= 0.8:
            return "Good job! Keep practicing to improve further."
        elif accuracy >= 0.7:
            return "Nice effort! Let's work on those tricky words together."
        elif accuracy >= 0.6:
            return "Good start! Take your time with each word."
        else:
            return "That's okay! Reading takes practice. Let's try again."


# Singleton instance
pronunciation_analyzer = PronunciationAnalyzer()
