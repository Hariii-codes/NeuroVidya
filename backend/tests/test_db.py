"""
Database connection tests
"""
import pytest
from app.models import prisma


@pytest.mark.asyncio
async def test_database_connection():
    """Test that we can connect to the database."""
    await prisma.connect()
    result = await prisma.query_raw('SELECT 1 as result')
    assert result[0]['result'] == 1
    await prisma.disconnect()


@pytest.mark.asyncio
async def test_create_user():
    """Test creating a user."""
    await prisma.connect()

    user = await prisma.user.create({
        'email': 'test@example.com',
        'passwordHash': 'hashed_password_here',
        'name': 'Test User'
    })

    assert user.email == 'test@example.com'
    assert user.id is not None

    # Cleanup
    await prisma.user.delete(where={'id': user.id})
    await prisma.disconnect()
