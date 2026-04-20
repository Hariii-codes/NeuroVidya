from typing import TYPE_CHECKING, AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import get_settings
from app.core.security import decode_access_token
from app.models.models import prisma, Prisma

if TYPE_CHECKING:
    from app.models.models import User

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_database() -> AsyncGenerator[Prisma, None]:
    try:
        await prisma.connect()
    except Exception:
        # Already connected or connection error - continue anyway
        pass
    try:
        yield prisma
    finally:
        # Don't disconnect - keep connection alive for subsequent requests
        pass


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Prisma = Depends(get_database),
) -> "User":
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = await db.user.find_unique(where={"id": user_id})
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: "User" = Depends(get_current_user)) -> "User":
    if not current_user.isActive:
        raise HTTPException(status_code=403, detail="Inactive user")
    return current_user


async def get_optional_user(
    token: str | None = Depends(optional_oauth2_scheme),
    db: Prisma = Depends(get_database),
) -> "User | None":
    """Optional authentication - returns None if no token provided."""
    print(f"DEBUG: get_optional_user called, token={token}")
    if not token:
        print("DEBUG: No token, returning None")
        return None
    try:
        payload = decode_access_token(token)
        print(f"DEBUG: Payload={payload}")
        if payload is None:
            return None
        user_id: str | None = payload.get("sub")
        if user_id is None:
            return None
        user = await db.user.find_unique(where={"id": user_id})
        print(f"DEBUG: User={user}")
        return user
    except Exception as e:
        print(f"DEBUG: Exception={e}")
        return None
