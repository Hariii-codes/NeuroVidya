# backend/app/api/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.core.deps import get_database, get_current_active_user, get_optional_user
from app.models.models import User, ReadingPreferences, Prisma
from app.schemas.preferences import (
    DyslexiaSettingsCreate,
    DyslexiaSettingsResponse,
)

router = APIRouter()


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    createdAt: str

    class Config:
        from_attributes = True


@router.get("/me", response_model=UserResponse)
async def get_user(current_user: User = Depends(get_current_active_user)):
    """Get current user profile."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        createdAt=current_user.createdAt.isoformat()
    )


@router.put("/me", response_model=UserResponse)
async def update_user(
    updates: UserUpdate,
    db: Prisma = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user profile."""
    # Build update data with only provided fields
    update_data = {}
    if updates.name is not None:
        update_data['name'] = updates.name
    if updates.email is not None:
        # Check if email is already taken by another user
        existing = await db.user.find_unique(where={'email': updates.email})
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        update_data['email'] = updates.email

    if not update_data:
        # No updates provided, return current user
        return UserResponse(
            id=current_user.id,
            email=current_user.email,
            name=current_user.name,
            createdAt=current_user.createdAt.isoformat()
        )

    # Update user
    updated_user = await db.user.update(
        where={'id': current_user.id},
        data=update_data
    )

    return UserResponse(
        id=updated_user.id,
        email=updated_user.email,
        name=updated_user.name,
        createdAt=updated_user.createdAt.isoformat()
    )


@router.get("/preferences")
async def get_preferences(
    db: Prisma = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's reading preferences."""
    preferences = await db.readingpreferences.find_unique(
        where={'userId': current_user.id}
    )

    if not preferences:
        # Create default preferences if they don't exist
        preferences = await db.readingpreferences.create({
            'userId': current_user.id,
        })

    return {
        'id': preferences.id,
        'userId': preferences.userId,
        'font': preferences.font,
        'fontSize': preferences.fontSize,
        'letterSpacing': preferences.letterSpacing,
        'lineHeight': preferences.lineHeight,
        'theme': preferences.theme,
        'focusMode': preferences.focusMode,
        'speechSpeed': preferences.speechSpeed,
    }


class PreferencesUpdate(BaseModel):
    font: Optional[str] = None
    fontSize: Optional[int] = None
    letterSpacing: Optional[float] = None
    lineHeight: Optional[float] = None
    theme: Optional[str] = None
    focusMode: Optional[bool] = None
    speechSpeed: Optional[float] = None


@router.put("/preferences")
async def update_preferences(
    updates: PreferencesUpdate,
    db: Prisma = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user's reading preferences."""
    # Build update data with only provided fields
    update_data = {}
    if updates.font is not None:
        update_data['font'] = updates.font
    if updates.fontSize is not None:
        update_data['fontSize'] = updates.fontSize
    if updates.letterSpacing is not None:
        update_data['letterSpacing'] = updates.letterSpacing
    if updates.lineHeight is not None:
        update_data['lineHeight'] = updates.lineHeight
    if updates.theme is not None:
        update_data['theme'] = updates.theme
    if updates.focusMode is not None:
        update_data['focusMode'] = updates.focusMode
    if updates.speechSpeed is not None:
        update_data['speechSpeed'] = updates.speechSpeed

    # Check if preferences exist
    existing = await db.readingpreferences.find_unique(
        where={'userId': current_user.id}
    )

    if existing:
        # Update existing preferences
        preferences = await db.readingpreferences.update(
            where={'userId': current_user.id},
            data=update_data
        )
    else:
        # Create new preferences
        preferences = await db.readingpreferences.create({
            'userId': current_user.id,
            **update_data
        })

    return {
        'id': preferences.id,
        'userId': preferences.userId,
        'font': preferences.font,
        'fontSize': preferences.fontSize,
        'letterSpacing': preferences.letterSpacing,
        'lineHeight': preferences.lineHeight,
        'theme': preferences.theme,
        'focusMode': preferences.focusMode,
        'speechSpeed': preferences.speechSpeed,
    }

# ============================================
# Dyslexia Settings Endpoints
# ============================================

@router.get("/me/dyslexia-settings", response_model=DyslexiaSettingsResponse)
async def get_dyslexia_settings(
    db: Prisma = Depends(get_database),
    current_user: User = Depends(get_optional_user)
):
    """Get current user's dyslexia settings. Returns defaults if not authenticated."""
    # Default settings for unauthenticated users (matching schema constraints)
    default_response = {
        'id': 'default',
        'userId': 'default',
        'font': 'Lexend',
        'fontSize': 20,
        'letterSpacing': 0.12,
        'wordSpacing': 0.15,
        'lineHeight': 1.6,
        'theme': 'cream',
        'accentColor': '#5C8DF6',
        'contrastLevel': 'normal',
        'lineFocusEnabled': False,
        'lineFocusColor': '#E8F4FC',
        'lineDimIntensity': 0.3,
        'lineFocusAutoScroll': False,
        'phoneticChunkingEnabled': False,
        'chunkStyle': 'syllables',
        'useAIForChunking': False,
        'focusMode': False,
        'ttsAlwaysVisible': False,
        'speechSpeed': 1.0,
        'wordByWordMode': False,
        'voiceSelection': 'default',
        'presetLevel': 'custom',
        'createdAt': '2024-01-01T00:00:00',
        'updatedAt': '2024-01-01T00:00:00',
    }

    if not current_user:
        return DyslexiaSettingsResponse(**default_response)

    preferences = await db.readingpreferences.find_unique(
        where={'userId': current_user.id}
    )

    if not preferences:
        # Create default preferences if they don't exist
        preferences = await db.readingpreferences.create({
            'userId': current_user.id,
        })

    return DyslexiaSettingsResponse(
        id=preferences.id,
        userId=preferences.userId,
        font=preferences.font,
        fontSize=preferences.fontSize,
        letterSpacing=preferences.letterSpacing,
        wordSpacing=preferences.wordSpacing,
        lineHeight=preferences.lineHeight,
        theme=preferences.theme,
        accentColor=preferences.accentColor,
        contrastLevel=preferences.contrastLevel,
        lineFocusEnabled=preferences.lineFocusEnabled,
        lineFocusColor=preferences.lineFocusColor,
        lineDimIntensity=preferences.lineDimIntensity,
        lineFocusAutoScroll=preferences.lineFocusAutoScroll,
        phoneticChunkingEnabled=preferences.phoneticChunkingEnabled,
        chunkStyle=preferences.chunkStyle,
        useAIForChunking=preferences.useAIForChunking,
        focusMode=preferences.focusMode,
        ttsAlwaysVisible=preferences.ttsAlwaysVisible,
        speechSpeed=preferences.speechSpeed,
        wordByWordMode=preferences.wordByWordMode,
        voiceSelection=preferences.voiceSelection,
        presetLevel=preferences.presetLevel,
        createdAt=preferences.createdAt.isoformat(),
        updatedAt=preferences.updatedAt.isoformat(),
    )


@router.put("/me/dyslexia-settings", response_model=DyslexiaSettingsResponse)
async def update_dyslexia_settings(
    settings_update: DyslexiaSettingsCreate,
    db: Prisma = Depends(get_database),
    current_user: User = Depends(get_optional_user)
):
    """Update current user's dyslexia settings. Returns defaults if not authenticated."""
    # Default settings for unauthenticated users (just return the update)
    if not current_user:
        from datetime import datetime
        return DyslexiaSettingsResponse(
            id='default',
            userId='default',
            font=settings_update.font or 'Lexend',
            fontSize=settings_update.fontSize or 20,
            letterSpacing=settings_update.letterSpacing or 0.12,
            wordSpacing=settings_update.wordSpacing or 0.15,
            lineHeight=settings_update.lineHeight or 1.6,
            theme=settings_update.theme or 'cream',
            accentColor=settings_update.accentColor or '#5C8DF6',
            contrastLevel=settings_update.contrastLevel or 'normal',
            lineFocusEnabled=settings_update.lineFocusEnabled or False,
            lineFocusColor=settings_update.lineFocusColor or '#E8F4FC',
            lineDimIntensity=settings_update.lineDimIntensity or 0.3,
            lineFocusAutoScroll=settings_update.lineFocusAutoScroll or False,
            phoneticChunkingEnabled=settings_update.phoneticChunkingEnabled or False,
            chunkStyle=settings_update.chunkStyle or 'syllables',
            useAIForChunking=settings_update.useAIForChunking or False,
            focusMode=settings_update.focusMode or False,
            ttsAlwaysVisible=settings_update.ttsAlwaysVisible or False,
            speechSpeed=settings_update.speechSpeed or 1.0,
            wordByWordMode=settings_update.wordByWordMode or False,
            voiceSelection=settings_update.voiceSelection or 'default',
            presetLevel=settings_update.presetLevel or 'custom',
            createdAt=datetime.now().isoformat(),
            updatedAt=datetime.now().isoformat(),
        )

    # Check if preferences exist
    existing = await db.readingpreferences.find_unique(
        where={'userId': current_user.id}
    )

    # Build update data with only provided fields
    update_data = settings_update.model_dump(exclude_unset=True)

    if existing:
        # Update existing preferences
        preferences = await db.readingpreferences.update(
            where={'userId': current_user.id},
            data=update_data
        )
    else:
        # Create new preferences
        preferences = await db.readingpreferences.create({
            'userId': current_user.id,
            **update_data
        })

    return DyslexiaSettingsResponse(
        id=preferences.id,
        userId=preferences.userId,
        font=preferences.font,
        fontSize=preferences.fontSize,
        letterSpacing=preferences.letterSpacing,
        wordSpacing=preferences.wordSpacing,
        lineHeight=preferences.lineHeight,
        theme=preferences.theme,
        accentColor=preferences.accentColor,
        contrastLevel=preferences.contrastLevel,
        lineFocusEnabled=preferences.lineFocusEnabled,
        lineFocusColor=preferences.lineFocusColor,
        lineDimIntensity=preferences.lineDimIntensity,
        lineFocusAutoScroll=preferences.lineFocusAutoScroll,
        phoneticChunkingEnabled=preferences.phoneticChunkingEnabled,
        chunkStyle=preferences.chunkStyle,
        useAIForChunking=preferences.useAIForChunking,
        focusMode=preferences.focusMode,
        ttsAlwaysVisible=preferences.ttsAlwaysVisible,
        speechSpeed=preferences.speechSpeed,
        wordByWordMode=preferences.wordByWordMode,
        voiceSelection=preferences.voiceSelection,
        presetLevel=preferences.presetLevel,
        createdAt=preferences.createdAt.isoformat(),
        updatedAt=preferences.updatedAt.isoformat(),
    )
