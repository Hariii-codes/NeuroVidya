# MeiGen-MultiTalk Integration Guide

## Overview

This document outlines how to integrate MeiGen-MultiTalk for phonics video generation in the NeuroVidya dyslexia learning platform.

## What is MeiGen-MultiTalk?

MeiGen-MultiTalk is an audio-driven multi-person conversational video generation model with state-of-the-art lip synchronization accuracy.

**Key Features:**
- 💬 Realistic conversations (single & multi-person)
- 👥 Interactive character control
- 🎤 Supports cartoon characters and singing
- 📺 480p & 720p output
- ⏱️ Up to 15 seconds video generation

**Model URL:** https://huggingface.co/MeiGen-AI/MeiGen-MultiTalk

## Current Implementation Status

✅ **Implemented:**
- Phonics data structure with 26 letters + digraphs
- Backend API endpoints for phonics tutor
- Frontend PhonicsTutorPage with full UI
- Video service architecture (placeholder)

❌ **Not Yet Implemented:**
- Actual video generation with MeiGen-MultiTalk
- Audio file generation (TTS)
- Character asset preparation
- Video storage and serving

## Setup Instructions

### 1. Environment Setup

```bash
# Create virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install torch torchvision torchaudio
pip install transformers
pip install opencv-python
pip install scipy
pip install pillow
pip install accelerate
```

### 2. Model Setup

```python
# Add to backend/requirements.txt
transformers>=4.30.0
torch>=2.0.0
torchvision>=0.15.0
opencv-python>=4.8.0
scipy>=1.11.0
```

### 3. Character Assets

Prepare character reference images for video generation:

**Recommended:**
- Cartoon-style friendly tutor character
- Clear mouth movements visible
- Consistent appearance across videos
- Child-friendly design

**Storage:**
```
backend/static/characters/
├── tutor_reference.png
├── tutor_reference_2.png
└── backgrounds/
    ├── classroom.jpg
    ├── plain_bg.jpg
    └── colorful_bg.jpg
```

### 4. Audio Generation (TTS)

Set up text-to-speech for phoneme sounds:

**Options:**
1. **Google TTS** (Simple, free)
   ```python
   from gtts import gTTS
   ```

2. **ElevenLabs** (High quality, paid)
   - Better lip-sync
   - More natural speech

3. **Coqui TTS** (Open source)
   ```python
   from TTS.api import TTS
   ```

### 5. Video Generation Implementation

Update `backend/app/services/phonics_video_service.py`:

```python
from transformers import pipeline
import torch
from pathlib import Path
import cv2

class PhonicsVideoService:
    def __init__(self):
        # Initialize MeiGen-MultiTalk model
        self.model = pipeline(
            "video-generation",
            model="MeiGen-AI/MeiGen-MultiTalk",
            device=0 if torch.cuda.is_available() else -1
        )

    async def generate_phonics_video(self, letter_id, phoneme_index):
        # 1. Generate audio
        audio_path = await self._generate_audio(letter_id, phoneme_index)

        # 2. Load character reference
        character_image = "static/characters/tutor_reference.png"

        # 3. Generate video
        video = self.model(
            audio=audio_path,
            reference_image=character_image,
            duration=3.0,  # 3 seconds for phoneme
            resolution="720p"
        )

        # 4. Save video
        output_path = f"static/phonics_videos/{letter_id}_{phoneme_index}.mp4"
        video.save(output_path)

        return True, "Video generated", Path(output_path)
```

### 6. API Endpoint Update

Update `backend/app/api/phonics_tutor.py`:

```python
@router.post("/generate-video")
async def generate_phonics_video(letter_id: str, phoneme_index: int = 0):
    """Generate a new phonics video using MeiGen-MultiTalk."""

    from app.services.phonics_video_service import phonics_video_service

    success, message, path = await phonics_video_service.generate_phonics_video(
        letter_id, phoneme_index
    )

    if success:
        return {
            "status": "completed",
            "videoUrl": f"/static/phonics_videos/{path.name}",
            "message": message
        }
    else:
        return {
            "status": "failed",
            "message": message
        }
```

## Testing

### Manual Testing

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Test endpoint
curl -X POST http://localhost:8000/api/phonics-tutor/generate-video?letter_id=A&phoneme_index=0
```

### Frontend Testing

1. Navigate to `/phonics-tutor`
2. Click on a letter
3. Click "Generate Video" button
4. Wait for generation
5. Play video

## Production Considerations

### Caching Strategy
- Pre-generate common phonemes (A-Z, basic digraphs)
- Cache generated videos for 24 hours
- Implement CDN for video delivery

### Performance Optimization
- Use GPU for video generation (required for real-time)
- Implement queue system for batch generation
- Optimize video files for web delivery

### Cost Management
- Video generation is computationally expensive
- Consider using cloud GPU services (AWS, GCP, Azure)
- Pre-generate videos during off-peak hours

## Alternative Approaches

If MeiGen-MultiTalk is too resource-intensive:

### Option 1: External API Services
- **D-ID** (https://www.d-id.com/)
- **Synthesia** (https://www.synthesia.io/)
- **HeyGen** (https://www.heygen.com/)

### Option 2: Simplified Animation
- Use 2D animation libraries
- Pre-made mouth shape sprites
- Lip-sync based on phoneme

### Option 3: Static Video Library
- Record real person saying phonemes
- Edit into professional videos
- Highest quality, no generation needed

## Next Steps

1. **Choose video generation approach**
   - Evaluate MeiGen-MultiTalk feasibility
   - Test with 2-3 phonemes
   - Assess quality and performance

2. **Character design**
   - Create or commission character artwork
   - Ensure mouth movements are visible
   - Test with focus group

3. **Pilot testing**
   - Generate 5-10 sample videos
   - Test with dyslexic students
   - Gather feedback on effectiveness

4. **Full implementation**
   - Generate all 26 letters + digraphs
   - Integrate with production system
   - Deploy and monitor

## Resources

- **MeiGen-MultiTalk Paper:** https://arxiv.org/abs/2505.22647
- **HuggingFace Model:** https://huggingface.co/MeiGen-AI/MeiGen-MultiTalk
- **GitHub Repository:** Check model page for repo link
- **Dyslexia Research:** Refer to existing research papers in project

## Troubleshooting

### Common Issues

**Issue: Model not loading**
- Solution: Check CUDA availability, use CPU if needed

**Issue: Poor lip-sync**
- Solution: Improve audio quality, adjust TTS settings

**Issue: Video generation too slow**
- Solution: Use GPU, reduce resolution, pre-generate videos

**Issue: Character appearance inconsistent**
- Solution: Use same reference image, consistent lighting

## Support

For issues or questions:
1. Check MeiGen-MultiTalk documentation
2. Review HuggingFace model discussions
3. Open issue in NeuroVidya repository

---

**Last Updated:** 2026-05-13
**Status:** Implementation Phase - Video Generation Needed
