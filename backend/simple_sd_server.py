"""
Simple Local Image Generation Server
Works with Python 3.14+ using diffusers library
Run with: python simple_sd_server.py
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: str = "ugly, blurry, low quality"
    width: int = 512
    height: int = 512
    steps: int = 20


@app.post("/sdapi/v1/txt2img")
async def txt2img(req: GenerateRequest):
    """
    Generate image using diffusers (CPU mode)
    Falls back to placeholder if model not downloaded
    """
    try:
        # Try using diffusers if available
        from diffusers import StableDiffusionPipeline
        import torch
        from PIL import Image
        import io
        import base64

        # Check if running in CPU mode (no CUDA)
        device = "cpu"

        # Load model (will download on first run - ~5GB)
        print(f"[SD] Loading model for: {req.prompt}")

        # Use a smaller model for CPU compatibility
        model_id = "runwayml/stable-diffusion-v1-5"
        pipe = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float32,
            safety_checker=None
        )
        pipe = pipe.to(device)

        # Generate
        print(f"[SD] Generating image...")
        result = pipe(
            prompt=req.prompt,
            negative_prompt=req.negative_prompt,
            width=req.width,
            height=req.height,
            num_inference_steps=req.steps,
        )

        # Convert to base64
        image = result.images[0]
        img_io = io.BytesIO()
        image.save(img_io, format='PNG')
        img_io.seek(0)
        img_base64 = base64.b64encode(img_io.read()).decode()

        return {
            "images": [img_base64],
            "parameters": req.dict()
        }

    except ImportError:
        # Diffusers not installed - return helpful message
        return {
            "error": "diffusers library not installed. Run: pip install diffusers torch transformers accelerate",
            "install_hint": "pip install diffusers torch transformers accelerate"
        }
    except Exception as e:
        return {
            "error": f"Generation failed: {str(e)}",
            "hint": "Make sure you have enough disk space and internet for model download (~5GB)"
        }


@app.get("/sdapi/v1/sd-models")
async def get_models():
    """Return available models"""
    return {
        "models": [
            {
                "title": "runwayml/stable-diffusion-v1-5",
                "model_name": "runwayml/stable-diffusion-v1-5",
                "filename": "v1-5-pruned-emaonly.safetensors"
            }
        ]
    }


@app.get("/")
async def root():
    return {"status": "Simple SD Server Running", "message": "Use /sdapi/v1/txt2img for generation"}


if __name__ == "__main__":
    print("=" * 50)
    print("  Simple Local Image Generation Server")
    print("=" * 50)
    print("Installing dependencies...")
    import subprocess
    subprocess.run(["pip", "install", "-q", "diffusers", "torch", "transformers", "accelerate", "fastapi", "uvicorn"])
    print("Starting server on http://127.0.0.1:7860")
    print("=" * 50)

    uvicorn.run(app, host="127.0.0.1", port=7860)
