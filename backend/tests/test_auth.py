# backend/tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_register_user():
    """Test user registration."""
    response = client.post("/api/auth/register", json={
        "email": "testuser@example.com",
        "password": "SecurePassword123!",
        "name": "Test User"
    })
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["email"] == "testuser@example.com"


def test_login_user():
    """Test user login."""
    # First register
    client.post("/api/auth/register", json={
        "email": "login@example.com",
        "password": "SecurePassword123!",
    })

    # Then login
    response = client.post("/api/auth/login", data={
        "username": "login@example.com",
        "password": "SecurePassword123!",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_invalid_login():
    """Test login with invalid credentials."""
    response = client.post("/api/auth/login", data={
        "username": "nonexistent@example.com",
        "password": "WrongPassword123!",
    })
    assert response.status_code == 401


def test_get_me_without_token():
    """Test getting current user without token."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401
