# backend/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core.deps import get_database, get_current_active_user
from app.core.security import (
    create_access_token,
    verify_password,
    get_password_hash,
)
from app.core.config import get_settings
from app.schemas.auth import UserCreate, UserResponse, Token, UserLogin
from app.models.models import User, ReadingPreferences, Prisma

router = APIRouter()
settings = get_settings()


@router.post("/register")
async def register(user_data: UserCreate, db: Prisma = Depends(get_database)):
    """Register a new user and return access token with user info."""
    # Check if user exists
    existing_user = await db.user.find_unique(where={"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password
    password_hash = get_password_hash(user_data.password)

    # Create user
    user = await db.user.create({
        "email": user_data.email,
        "passwordHash": password_hash,
        "name": user_data.name,
    })

    # Create default reading preferences
    await db.readingpreferences.create({
        "userId": user.id,
    })

    # Create access token (auto-login after registration)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires
    )

    # Return both user and token (frontend expects this format)
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "createdAt": user.createdAt.isoformat()
        },
        "token": access_token
    }


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: Prisma = Depends(get_database)
):
    """Login user and return access token."""
    # Find user
    user = await db.user.find_unique(where={"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Verify password
    if not verify_password(credentials.password, user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires
    )

    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current user info."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        createdAt=current_user.createdAt.isoformat()
    )


@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)."""
    # JWT is stateless, actual logout is handled client-side
    return {"message": "Successfully logged out"}
