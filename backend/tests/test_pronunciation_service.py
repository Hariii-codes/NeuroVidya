"""
Tests for pronunciation analysis service.
"""

import pytest
from app.services.pronunciation_service import (
    PronunciationAnalyzer,
    pronunciation_analyzer
)


class TestPronunciationAnalyzer:
    """Test suite for PronunciationAnalyzer."""

    def test_normalize_text(self):
        """Test text normalization."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.normalize_text("Hello, World!")
        assert result == ["hello", "world"]

    def test_perfect_match(self):
        """Test analysis with perfect pronunciation."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The cat sat",
            spoken_text="The cat sat"
        )
        assert result["accuracyScore"] == 100.0
        assert result["wordsCorrect"] == 3
        assert result["wordsIncorrect"] == 0
        assert len(result["errors"]) == 0

    def test_single_substitution(self):
        """Test analysis with one substituted letter."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The cat sat",
            spoken_text="The cat sut"  # 'sat' -> 'sut'
        )
        assert result["accuracyScore"] < 100
        assert result["wordsIncorrect"] == 1
        assert len(result["errors"]) == 1
        assert result["errors"][0]["word"] == "sat"
        assert result["errors"][0]["actual"] == "sut"

    def test_bd_confusion(self):
        """Test b/d confusion handling (common dyslexic error)."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The big dog",
            spoken_text="The dig bog"  # b/d swap
        )
        # Should detect errors but with higher confidence due to phonetic similarity
        assert len(result["errors"]) >= 1

    def test_missed_word(self):
        """Test analysis when user skips a word."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The cat sat on mat",
            spoken_text="The cat sat mat"  # missed 'on'
        )
        assert result["wordsIncorrect"] >= 1
        # Check for missed word error
        missed_errors = [e for e in result["errors"] if e["actual"] == "[missed]"]
        assert len(missed_errors) >= 1

    def test_phonetic_guide(self):
        """Test phonetic guide generation."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The water cycle",
            spoken_text="The water"
        )
        # Check for phonetic guide on 'cycle' if it was an error
        cycle_error = next((e for e in result["errors"] if e["word"] == "cycle"), None)
        if cycle_error:
            assert cycle_error.get("phoneticGuide") is not None

    def test_confidence_threshold(self):
        """Test different confidence thresholds."""
        analyzer_strict = PronunciationAnalyzer(confidence_threshold=0.95)
        analyzer_lenient = PronunciationAnalyzer(confidence_threshold=0.70)

        result_strict = analyzer_strict.analyze_pronunciation(
            expected_text="cat",
            spoken_text="cut"  # 1-letter edit
        )
        result_lenient = analyzer_lenient.analyze_pronunciation(
            expected_text="cat",
            spoken_text="cut"
        )

        # Strict should flag as error, lenient might not
        assert len(result_strict["errors"]) >= len(result_lenient["errors"])

    def test_empty_spoken_text(self):
        """Test analysis with no spoken text."""
        analyzer = PronunciationAnalyzer()
        result = analyzer.analyze_pronunciation(
            expected_text="The cat sat",
            spoken_text=""
        )
        assert result["accuracyScore"] == 0
        assert result["wordsCorrect"] == 0
        assert result["wordsIncorrect"] == 3

    def test_feedback_messages(self):
        """Test feedback message generation."""
        analyzer = PronunciationAnalyzer()

        # Excellent performance
        result_90 = analyzer.analyze_pronunciation(
            expected_text="cat dog bird fish",
            spoken_text="cat dog bird fish"
        )
        assert "excellent" in result_90["phoneticFeedback"]["message"].lower()

        # Needs practice
        result_50 = analyzer.analyze_pronunciation(
            expected_text="cat dog bird fish",
            spoken_text="cut dig berd"
        )
        assert result_50["phoneticFeedback"]["message"] is not None

    def test_levenshtein_distance(self):
        """Test Levenshtein distance calculation."""
        analyzer = PronunciationAnalyzer()

        assert analyzer.levenshtein_distance("cat", "cat") == 0
        assert analyzer.levenshtein_distance("cat", "cut") == 1
        assert analyzer.levenshtein_distance("cat", "bat") == 1
        assert analyzer.levenshtein_distance("cat", "bats") == 2

    def test_phonetic_similarity(self):
        """Test phonetic similarity calculation."""
        analyzer = PronunciationAnalyzer()

        # Same word
        assert analyzer.calculate_phonetic_similarity("cat", "cat") == 1.0

        # b/d confusion - should have high similarity
        bd_sim = analyzer.calculate_phonetic_similarity("big", "dig")
        assert bd_sim > 0.5

        # Completely different words
        diff_sim = analyzer.calculate_phonetic_similarity("cat", "elephant")
        assert diff_sim < 0.5


class TestPronunciationServiceIntegration:
    """Integration tests using the singleton instance."""

    def test_singleton_available(self):
        """Test that singleton instance is available."""
        assert pronunciation_analyzer is not None
        assert isinstance(pronunciation_analyzer, PronunciationAnalyzer)

    def test_real_passage_analysis(self):
        """Test analysis with real reading passage."""
        passage = "A little seed sleeps in the soil. The sun warms the ground."
        spoken = "A little seed sleeps in the soil. The sun warms the ground."

        result = pronunciation_analyzer.analyze_pronunciation(passage, spoken)
        assert result["accuracyScore"] == 100.0
        assert result["wordsCorrect"] == 14


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
