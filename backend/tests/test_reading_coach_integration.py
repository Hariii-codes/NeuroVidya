"""
Integration tests for Reading Coach API.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


class TestReadingCoachAPI:
    """Integration tests for reading coach endpoints."""

    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/api/reading-coach/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_get_passages(self):
        """Test getting reading passages."""
        response = client.get("/api/reading-coach/passages")
        assert response.status_code == 200
        data = response.json()
        assert "passages" in data
        assert len(data["passages"]) > 0

    def test_get_passages_by_level(self):
        """Test filtering passages by level."""
        response = client.get("/api/reading-coach/passages?level=elementary")
        assert response.status_code == 200
        data = response.json()
        assert all(p["readingLevel"] == "elementary" for p in data["passages"])

    def test_analyze_pronunciation(self):
        """Test pronunciation analysis endpoint."""
        response = client.post(
            "/api/reading-coach/analyze",
            json={
                "expectedText": "The cat sat",
                "spokenText": "The cat sat"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "accuracyScore" in data
        assert "wordsCorrect" in data
        assert "wordsIncorrect" in data
        assert data["accuracyScore"] == 100.0

    def test_analyze_with_errors(self):
        """Test pronunciation analysis with errors."""
        response = client.post(
            "/api/reading-coach/analyze",
            json={
                "expectedText": "The cat sat",
                "spokenText": "The cut sut"  # Two substitutions
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["accuracyScore"] < 100
        assert len(data["errors"]) >= 1

    def test_pronounce_word(self):
        """Test getting pronunciation guide."""
        response = client.post(
            "/api/reading-coach/pronounce-word",
            json={"word": "water"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "word" in data
        assert "phoneticGuide" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
