# backend/app/schemas/preferences.py
from pydantic import BaseModel, Field
from typing import Literal

class DyslexiaSettingsBase(BaseModel):
    """Base dyslexia settings schema"""
    font: str = "Lexend"
    fontSize: int = Field(default=22, ge=16, le=32)
    letterSpacing: float = Field(default=0.15, ge=0, le=0.3)
    wordSpacing: float = Field(default=0.5, ge=0, le=1)
    lineHeight: float = Field(default=1.8, ge=1.4, le=2.2)
    theme: str = "cream"
    accentColor: str = "#2196F3"
    contrastLevel: Literal["normal", "high", "very-high"] = "normal"

    # Reading aids
    lineFocusEnabled: bool = False
    lineFocusColor: str = "#4CAF50"
    lineDimIntensity: float = Field(default=0.3, ge=0, le=0.8)
    lineFocusAutoScroll: bool = False
    phoneticChunkingEnabled: bool = False
    chunkStyle: Literal["syllables", "sounds", "both"] = "syllables"
    useAIForChunking: bool = False

    # Audio
    focusMode: bool = False
    ttsAlwaysVisible: bool = False
    speechSpeed: float = Field(default=1.0, ge=0.5, le=2)
    wordByWordMode: bool = False
    voiceSelection: str = "default"

    # Preset
    presetLevel: Literal["mild", "moderate", "significant", "custom"] = "custom"

class DyslexiaSettingsCreate(DyslexiaSettingsBase):
    """Schema for creating/updating dyslexia settings"""
    pass

class DyslexiaSettingsResponse(DyslexiaSettingsBase):
    """Schema for dyslexia settings response"""
    id: str
    userId: str
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True
