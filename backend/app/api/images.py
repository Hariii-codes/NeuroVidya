# backend/app/api/images.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import json
import httpx

from app.core.deps import get_optional_user, get_database
from app.core.config import get_settings
from app.models.models import User, Prisma

router = APIRouter()

# Get API keys from settings (which loads from .env)
settings = get_settings()
OPENAI_API_KEY = settings.OPENAI_API_KEY
GLM_API_KEY = settings.GLM_API_KEY
LOCAL_SD_URL = settings.LOCAL_SD_URL  # Automatic1111 WebUI local URL

# Debug logging
print(f"[IMAGE API] OpenAI API Key loaded: {bool(OPENAI_API_KEY)}")
print(f"[IMAGE API] GLM API Key loaded: {bool(GLM_API_KEY)}")
print(f"[IMAGE API] Local SD URL: {LOCAL_SD_URL}")


# ============================================
# Schemas
# ============================================

class GenerateImageRequest(BaseModel):
    prompt: str
    style: Optional[str] = "educational"  # educational, simple, detailed, cartoon
    size: Optional[str] = "1024x1024"  # 256x256, 512x512, 1024x1024, 1792x1024, 1024x1792


class GenerateImageResponse(BaseModel):
    success: bool
    imageUrl: Optional[str] = None
    revisedPrompt: Optional[str] = None
    error: Optional[str] = None


# ============================================
# Helper Functions
# ============================================

def enhance_prompt_for_dyslexia(prompt: str, style: str = "educational") -> str:
    """
    Enhance the prompt to generate dyslexia-friendly educational images.
    """
    # Simple modifiers that work better with image generation APIs
    style_modifiers = {
        "educational": "educational diagram labeled clear simple",
        "simple": "minimalist clean high contrast",
        "detailed": "detailed labeled informative",
        "cartoon": "colorful cartoon friendly"
    }

    modifier = style_modifiers.get(style, style_modifiers["educational"])

    # Keep it simple - avoid special characters that cause URL issues
    enhanced = f"{prompt} {modifier}"

    return enhanced


async def generate_image_dalle(prompt: str, size: str = "1024x1024") -> tuple[bool, Optional[str], Optional[str]]:
    """
    Generate image using DALL-E API.

    Returns:
        tuple: (success, image_url, error_message)
    """
    if not OPENAI_API_KEY:
        return False, None, "OpenAI API key not configured"

    try:
        import openai

        client = openai.OpenAI(api_key=OPENAI_API_KEY)

        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size=size,
            quality="standard",
            n=1,
        )

        image_url = response.data[0].url
        return True, image_url, None

    except Exception as e:
        error_msg = f"Failed to generate image: {str(e)}"
        print(f"[DALL-E ERROR] {error_msg}")
        return False, None, error_msg


async def generate_image_pollinations(prompt: str, size: str = "1024x1024") -> tuple[bool, Optional[str], Optional[str]]:
    """
    Generate image using Pollinations.ai - FREE AI image generation.
    No API key required, uses Stable Diffusion.
    """
    try:
        # Clean the prompt
        words = prompt.split()
        simple_words = [w.lower() for w in words[:3] if w.isalpha() and len(w) > 2]
        search_term = simple_words[0] if simple_words else "education"

        # Create unique seed
        seed = abs(hash(prompt)) % 10000

        # Pollinations.ai URL
        image_url = f"https://image.pollinations.ai/prompt/{search_term}?width=1024&height=1024&seed={seed}&nologo=true&model=flux"

        print(f"[POLLINATIONS] Generated URL for: {search_term}")
        return True, image_url, None

    except Exception as e:
        error_msg = f"Pollinations.ai failed: {str(e)}"
        print(f"[POLLINATIONS ERROR] {error_msg}")
        return False, None, error_msg


async def generate_image_glm(prompt: str, size: str = "1024x1024") -> tuple[bool, Optional[str], Optional[str]]:
    """
    Generate image using GLM-4 (Zhipu AI) API.
    GLM provides free image generation with their API.

    Returns:
        tuple: (success, image_url, error_message)
    """
    if not GLM_API_KEY:
        return False, None, "GLM API key not configured"

    try:
        # GLM API endpoint for image generation
        url = "https://open.bigmodel.cn/api/paas/v4/images/generations"

        # Prepare the request
        headers = {
            "Authorization": f"Bearer {GLM_API_KEY}",
            "Content-Type": "application/json"
        }

        # GLM uses different size format - convert to their format
        size_map = {
            "1024x1024": "1024x1024",
            "512x512": "512x512",
            "256x256": "256x256"
        }
        glm_size = size_map.get(size, "1024x1024")

        payload = {
            "model": "cogview-3",  # GLM's image generation model
            "prompt": prompt,
            "size": glm_size
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers=headers)

            if response.status_code == 200:
                data = response.json()
                # GLM returns image data in data[0].url
                if "data" in data and len(data["data"]) > 0:
                    image_url = data["data"][0].get("url")
                    if image_url:
                        print(f"[GLM] Image generated successfully!")
                        return True, image_url, None

            return False, None, f"GLM API error: {response.status_code} - {response.text}"

    except Exception as e:
        error_msg = f"GLM generation failed: {str(e)}"
        print(f"[GLM ERROR] {error_msg}")
        return False, None, error_msg


async def generate_image_local_sd(prompt: str, size: str = "1024x1024") -> tuple[bool, Optional[str], Optional[str]]:
    """
    Generate image using local Stable Diffusion (Automatic1111 WebUI).
    Runs completely offline on your machine.

    Returns:
        tuple: (success, image_url, error_message)
    """
    if not LOCAL_SD_URL:
        return False, None, "Local SD URL not configured"

    try:
        # Automatic1111 WebUI API endpoint
        url = f"{LOCAL_SD_URL}/sdapi/v1/txt2img"

        # Convert size format
        width, height = map(int, size.split("x"))

        # Prepare the payload for Automatic1111
        payload = {
            "prompt": prompt,
            "negative_prompt": "ugly, blurry, low quality, distorted",
            "width": width,
            "height": height,
            "steps": 20,
            "cfg_scale": 7,
            "sampler_name": "Euler a"
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload)

            if response.status_code == 200:
                data = response.json()
                # Automatic1111 returns base64 encoded image
                if "images" in data and len(data["images"]) > 0:
                    # Return base64 data URL
                    import base64
                    img_b64 = data["images"][0]
                    image_url = f"data:image/png;base64,{img_b64}"
                    print(f"[LOCAL SD] Image generated successfully!")
                    return True, image_url, None

            return False, None, f"Local SD error: {response.status_code}"

    except Exception as e:
        error_msg = f"Local SD failed: {str(e)}"
        print(f"[LOCAL SD ERROR] {error_msg}")
        return False, None, error_msg


async def generate_image_fallback(prompt: str) -> tuple[bool, Optional[str], Optional[str]]:
    """
    Generate image using LoremFlickr fallback.
    Uses keyword-based photos that always work.
    """
    try:
        # Extract a simple keyword from prompt
        words = prompt.split()
        simple_words = [w.lower() for w in words[:3] if w.isalpha() and len(w) > 2]
        search_term = simple_words[0] if simple_words else "education"

        # LoremFlickr URL
        import random
        random_seed = random.randint(1, 10000)
        image_url = f"https://loremflickr.com/1024/1024/{search_term}?lock={random_seed}"

        print(f"[FALLBACK] Using LoremFlickr with keyword: {search_term}")
        return True, image_url, None

    except Exception as e:
        error_msg = f"Fallback service failed: {str(e)}"
        print(f"[FALLBACK ERROR] {error_msg}")
        return False, None, error_msg


# ============================================
# API Endpoints
# ============================================

@router.post("/generate", response_model=GenerateImageResponse)
async def generate_image(
    data: GenerateImageRequest,
    current_user: User = Depends(get_optional_user),
    db: Prisma = Depends(get_database)
):
    """
    Generate an AI image from text description.
    Optimized for dyslexic learners with clear, simple visuals.

    Tries services in order:
    1. Pollinations.ai - FREE AI images (no API key needed)
    2. GLM-4 (Zhipu AI) - Free tier available
    3. DALL-E 3 (if API key has credits)
    4. LoremFlickr fallback (keyword-based photos)
    """
    try:
        # Enhance prompt for dyslexia-friendly output
        enhanced_prompt = enhance_prompt_for_dyslexia(data.prompt, data.style)

        # Try Pollinations.ai first (FREE AI images!)
        print(f"[IMAGE] Attempting Pollinations.ai...")
        success, image_url, error = await generate_image_pollinations(enhanced_prompt, data.size)
        if success:
            print(f"[IMAGE] Pollinations.ai success!")
            return GenerateImageResponse(
                success=True,
                imageUrl=image_url,
                revisedPrompt=enhanced_prompt
            )
        print(f"[IMAGE] Pollinations.ai failed: {error}")

        # Try GLM-4 (Zhipu AI) - has free tier!
        if GLM_API_KEY:
            print(f"[IMAGE] Attempting GLM-4 generation...")
            success, image_url, error = await generate_image_glm(enhanced_prompt, data.size)
            if success:
                print(f"[IMAGE] GLM-4 success!")
                return GenerateImageResponse(
                    success=True,
                    imageUrl=image_url,
                    revisedPrompt=enhanced_prompt
                )
            print(f"[IMAGE] GLM-4 failed: {error}")

        # Try DALL-E 3 if API key is available
        if OPENAI_API_KEY and OPENAI_API_KEY.startswith("sk-"):
            print(f"[IMAGE] Attempting DALL-E 3 generation...")
            success, image_url, error = await generate_image_dalle(enhanced_prompt, data.size)
            if success:
                print(f"[IMAGE] DALL-E 3 success!")
                return GenerateImageResponse(
                    success=True,
                    imageUrl=image_url,
                    revisedPrompt=enhanced_prompt
                )
            print(f"[IMAGE] DALL-E 3 failed: {error}")

        # Fallback to LoremFlickr (keyword-based images, always works)
        print(f"[IMAGE] Using fallback service...")
        success, image_url, error = await generate_image_fallback(enhanced_prompt)

        if success and image_url:
            return GenerateImageResponse(
                success=True,
                imageUrl=image_url,
                revisedPrompt=enhanced_prompt
            )
        else:
            return GenerateImageResponse(
                success=False,
                error=error or "Failed to generate image"
            )

    except Exception as e:
        return GenerateImageResponse(
            success=False,
            error=f"An error occurred: {str(e)}"
        )


@router.post("/generate-concept")
async def generate_concept_image(
    concept: str,
    description: str,
    current_user: User = Depends(get_optional_user),
    db: Prisma = Depends(get_database)
):
    """
    Generate an educational image for a concept.
    Automatically optimized for dyslexic learners.
    """
    # Create a detailed, educational prompt
    enhanced_prompt = f"""
    Educational diagram showing: {concept}

    Description: {description}

    Style requirements:
    - Clear, simple, labeled diagram
    - High contrast colors (dark text on light background)
    - Large, readable labels
    - Dyslexia-friendly font (like Lexend or OpenDyslexic)
    - Minimal visual clutter
    - Color-coded sections
    - Educational and easy to understand

    The image should help someone with dyslexia understand the concept visually.
    """

    success, image_url, error = await generate_image_dalle(enhanced_prompt, "1024x1024")

    if not success:
        success, image_url, error = await generate_image_fallback(concept)

    return {
        "success": success,
        "imageUrl": image_url,
        "concept": concept,
        "error": error
    }


@router.get("/styles")
async def get_available_styles():
    """
    Get available image styles for dyslexia-friendly images.
    """
    return {
        "styles": [
            {
                "id": "educational",
                "name": "Educational Diagram",
                "description": "Clear, labeled diagrams with educational value",
                "icon": "📚"
            },
            {
                "id": "simple",
                "name": "Simple & Clean",
                "description": "Minimalist design with high contrast",
                "icon": "✨"
            },
            {
                "id": "detailed",
                "name": "Detailed",
                "description": "Informative with labels and annotations",
                "icon": "📝"
            },
            {
                "id": "cartoon",
                "name": "Cartoon Style",
                "description": "Friendly, colorful illustrations",
                "icon": "🎨"
            }
        ]
    }


@router.get("/sizes")
async def get_available_sizes():
    """
    Get available image sizes.
    """
    return {
        "sizes": [
            {"value": "256x256", "label": "Small (256x256)", "icon": "📱"},
            {"value": "512x512", "label": "Medium (512x512)", "icon": "📱"},
            {"value": "1024x1024", "label": "Large (1024x1024)", "icon": "💻"},
            {"value": "1792x1024", "label": "Wide (1792x1024)", "icon": "🖥️"},
            {"value": "1024x1792", "label": "Tall (1024x1792)", "icon": "📄"}
        ]
    }


@router.get("/status")
async def get_image_generation_status():
    """
    Get the status of available image generation services.
    """
    status = {
        "local_sd": {
            "available": LOCAL_SD_URL is not None,
            "url": LOCAL_SD_URL,
            "description": "Local Stable Diffusion (Automatic1111) - FREE, runs offline"
        },
        "glm": {
            "available": GLM_API_KEY is not None and len(GLM_API_KEY) > 0,
            "description": "GLM-4 (Zhipu AI) - Free tier available"
        },
        "dalle": {
            "available": OPENAI_API_KEY is not None and OPENAI_API_KEY.startswith("sk-"),
            "description": "DALL-E 3 (OpenAI) - Requires credits"
        },
        "fallback": {
            "available": True,
            "description": "LoremFlickr - Keyword-based photos (always available)"
        }
    }
    return status
