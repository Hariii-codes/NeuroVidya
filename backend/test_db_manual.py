"""
Manual database connection test
"""
import asyncio
from app.models import prisma


async def test_database_connection():
    """Test that we can connect to the database."""
    print("Testing database connection...")
    await prisma.connect()
    result = await prisma.query_raw('SELECT 1 as result')
    assert result[0]['result'] == 1
    print("[PASS] Database connection test passed!")
    await prisma.disconnect()


async def test_create_user():
    """Test creating a user."""
    print("\nTesting user creation...")
    await prisma.connect()

    user = await prisma.user.create({
        'email': 'test@example.com',
        'passwordHash': 'hashed_password_here',
        'name': 'Test User'
    })

    assert user.email == 'test@example.com'
    assert user.id is not None
    print(f"[PASS] User created successfully with ID: {user.id}")

    # Cleanup
    await prisma.user.delete(where={'id': user.id})
    print("[PASS] User deleted successfully")

    await prisma.disconnect()
    print("[PASS] User creation test passed!")


async def main():
    """Run all tests."""
    print("=" * 60)
    print("NeuroVidya Database Tests")
    print("=" * 60)

    try:
        await test_database_connection()
        await test_create_user()
        print("\n" + "=" * 60)
        print("All tests passed successfully!")
        print("=" * 60)
    except Exception as e:
        print(f"\n[FAIL] Test failed with error: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
