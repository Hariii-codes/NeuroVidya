# backend/tests/conftest.py
import pytest
from app.models import prisma

@pytest.fixture
async def db():
    """Database connection fixture."""
    await prisma.connect()
    yield prisma
    await prisma.disconnect()


@pytest.fixture(autouse=True)
async def cleanup_db(db):
    """Cleanup database after each test."""
    yield
    # Clean up test users
    users = await db.user.find_many(where={
        "email": {
            "contains": "example.com"
        }
    })
    for user in users:
        await db.user.delete(where={"id": user.id})
