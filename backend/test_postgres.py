import asyncio
from prisma import Prisma

async def test():
    client = Prisma()
    try:
        await client.connect()
        result = await client.query_raw('SELECT version()')
        print('✅ PostgreSQL connected!')
        print('Version:', result[0])

        # Test creating a user
        # user = await client.user.create({
        #     'email': 'test@example.com',
        #     'passwordHash': 'test123',
        # })
        # print('Test user created')

    finally:
        await client.disconnect()
        print('✅ Database connection test complete')

if __name__ == '__main__':
    asyncio.run(test())
