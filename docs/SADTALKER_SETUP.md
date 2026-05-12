# SadTalker Integration Guide for Phonics Tutor

## Overview

SadTalker is a free, open-source talking head generation system that creates realistic videos from a single image and audio file.

**Repository:** https://github.com/OpenTalker/SadTalker
**License:** MIT (Free for commercial use)
**Paper:** https://arxiv.org/abs/2211.12194

## Prerequisites

### Hardware Requirements
- **GPU:** NVIDIA GPU with 6GB+ VRAM (recommended)
- **CPU:** Works but slower (~30 seconds per video)
- **RAM:** 16GB+ recommended
- **Storage:** 10GB for model weights

### Software Requirements
- Python 3.8+
- CUDA 11.3+ (for GPU acceleration)
- Git

## Installation Steps

### Step 1: Clone SadTalker

```bash
cd /Users/apple/Desktop/NeuroVidya MIni Project/backend
git clone https://github.com/OpenTalker/SadTalker.git
cd SadTalker
```

### Step 2: Create Virtual Environment

```bash
python3 -m venv sadtalker_env
source sadtalker_env/bin/activate  # On Windows: sadtalker_env\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install -r requirements.txt
```

### Step 4: Download Model Weights

The models will be automatically downloaded on first run, or you can download manually:

```bash
# Download from Google Drive (links in SadTalker README)
# Place in:
# - checkpoints/
# - gfpgan/weights/
```

## Character Asset Preparation

### Create Your Character

You need a reference image for the phonics tutor. Options:

**Option A: Use a Stock Photo**
- Find a friendly cartoon character image
- Ensure mouth area is clearly visible
- Front-facing or slight angle works best
- PNG or JPG format

**Option B: Generate with AI (Free)**
- Use Bing Image Creator (free)
- Prompt: "friendly cartoon teacher for kids, simple background, front view"
- Download and use as reference

**Option C: Draw/Create Yourself**
- Simple character using drawing tools
- Consistent appearance across videos

### Store Character Image

```bash
mkdir -p backend/static/characters
# Save your character as:
backend/static/characters/tutor_reference.png
```

## Audio Generation Setup

### Option 1: Google TTS (Free, Simple)

```bash
pip install gtts
```

```python
from gtts import gTTS
import os

def generate_audio(text, output_path):
    """Generate audio using Google TTS."""
    tts = gTTS(text=text, lang='en', slow=False)
    tts.save(output_path)
    return output_path
```

### Option 2: Coqui TTS (Free, Better Quality)

```bash
pip install TTS
```

```python
from TTS.api import TTS

def generate_audio(text, output_path):
    """Generate audio using Coqui TTS."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    tts = TTS("tts_models/en/ljspeech/vits").to(device)
    tts.tts_to_file(text=text, file_path=output_path)
    return output_path
```

## Integration with Phonics Tutor

### Updated Video Service

Create `backend/app/services/sadtalker_service.py`:

```python
import subprocess
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class SadTalkerService:
    """Service for generating phonics videos using SadTalker."""

    def __init__(self):
        self.sadtalker_path = Path(__file__).parent.parent.parent / "SadTalker"
        self.checkpoints_dir = self.sadtalker_path / "checkpoints"
        self.output_dir = Path(__file__).parent.parent.parent / "static" / "phonics_videos"
        self.character_image = Path(__file__).parent.parent.parent / "static" / "characters" / "tutor_reference.png"
        self.audio_dir = Path(__file__).parent.parent.parent / "static" / "phonics_audio"

        # Create directories
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    def generate_audio(self, text: str, output_filename: str) -> Path:
        """Generate audio from text using gTTS."""
        from gtts import gTTS

        output_path = self.audio_dir / output_filename
        tts = gTTS(text=text, lang='en', slow=False)
        tts.save(str(output_path))
        return output_path

    def generate_video(
        self,
        audio_path: Path,
        output_filename: str,
        still_mode: bool = False,
        preprocess: bool = True
    ) -> tuple[bool, str, Path | None]:
        """
        Generate video using SadTalker.

        Args:
            audio_path: Path to audio file
            output_filename: Output video filename
            still_mode: Use still mode for less movement
            preprocess: Run preprocessing on image

        Returns:
            Tuple of (success, message, video_path)
        """
        try:
            output_path = self.output_dir / output_filename

            # Check if character image exists
            if not self.character_image.exists():
                return False, f"Character image not found at {self.character_image}", None

            # Build SadTalker command
            cmd = [
                "python", "inference.py",
                "--driven_audio", str(audio_path),
                "--source_image", str(self.character_image),
                "--result_dir", str(self.output_dir),
                "--still_mode" if still_mode else "",
                "--preprocess" if preprocess else "",
            ]

            # Remove empty strings
            cmd = [c for c in cmd if c]

            # Run SadTalker
            logger.info(f"Running SadTalker: {' '.join(cmd)}")
            result = subprocess.run(
                cmd,
                cwd=str(self.sadtalker_path),
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            if result.returncode == 0:
                # SadTalker creates output with timestamp, find the latest file
                video_files = list(self.output_dir.glob("*_*.mp4"))
                if video_files:
                    latest_video = max(video_files, key=os.path.getctime)
                    # Rename to desired filename
                    latest_video.rename(output_path)
                    return True, "Video generated successfully", output_path
                else:
                    return False, "Video file not found in output directory", None
            else:
                logger.error(f"SadTalker error: {result.stderr}")
                return False, f"SadTalker failed: {result.stderr}", None

        except subprocess.TimeoutExpired:
            return False, "Video generation timed out after 5 minutes", None
        except Exception as e:
            logger.error(f"Error generating video: {str(e)}")
            return False, f"Error: {str(e)}", None

# Singleton instance
sadtalker_service = SadTalkerService()
```

### Generate Phonics Audio Files

Create `backend/scripts/generate_phonics_audio.py`:

```python
import sys
sys.path.append('..')

from app.services.sadtalker_service import sadtalker_service
from app.data.phonics_data import phonics_data
import json

def generate_all_audio():
    """Generate audio files for all phonemes."""
    with open('../app/data/phonics_data.json', 'r') as f:
        data = json.load(f)

    for letter in data.get('letters', []):
        for i, phoneme in enumerate(letter['phonemes']):
            # Generate audio text
            sound = phoneme['sound']
            example_word = phoneme['exampleWords'][0]

            if sound.startswith('long_') or sound.startswith('short_'):
                sound_name = sound.replace('_', ' ')
                text = f"The {sound_name} sound as in {example_word}. {sound_name}."
            else:
                text = f"The letter sound {sound.upper()} as in {example_word}. {sound}."

            # Generate audio
            filename = f"{letter['id'].lower()}_{i}.wav"
            sadtalker_service.generate_audio(text, filename)
            print(f"✓ Generated audio for {letter['id']}-{i}")

if __name__ == "__main__":
    generate_all_audio()
```

### Generate Phonics Videos

Create `backend/scripts/generate_phonics_videos.py`:

```python
import sys
sys.path.append('..')

from app.services.sadtalker_service import sadtalker_service
import json
from pathlib import Path

def generate_all_videos():
    """Generate videos for all phonemes."""
    with open('../app/data/phonics_data.json', 'r') as f:
        data = json.load(f)

    results = {
        'success': [],
        'failed': [],
        'total': 0
    }

    for letter in data.get('letters', []):
        for i, phoneme in enumerate(letter['phonemes']):
            results['total'] += 1

            audio_filename = f"{letter['id'].lower()}_{i}.wav"
            audio_path = sadtalker_service.audio_dir / audio_filename

            if not audio_path.exists():
                print(f"✗ Audio not found for {letter['id']}-{i}")
                results['failed'].append(f"{letter['id']}-{i}: Audio not found")
                continue

            video_filename = f"{letter['id'].lower()}_{i}.mp4"

            print(f"Generating video for {letter['id']}-{i}...")
            success, message, path = sadtalker_service.generate_video(
                audio_path=audio_path,
                output_filename=video_filename,
                still_mode=True,  # Less movement for phonics
                preprocess=True
            )

            if success:
                print(f"✓ Generated video for {letter['id']}-{i}")
                results['success'].append(f"{letter['id']}-{i}")
            else:
                print(f"✗ Failed: {message}")
                results['failed'].append(f"{letter['id']}-{i}: {message}")

    print(f"\n{'='*50}")
    print(f"Generation complete!")
    print(f"Total: {results['total']}")
    print(f"Success: {len(results['success'])}")
    print(f"Failed: {len(results['failed'])}")
    print(f"{'='*50}")

if __name__ == "__main__":
    generate_all_videos()
```

## Running the Generation

### Step 1: Generate Audio Files

```bash
cd backend
python scripts/generate_phonics_audio.py
```

### Step 2: Generate Videos

```bash
cd backend
python scripts/generate_phonics_videos.py
```

## Expected Output

After successful generation, you'll have:

```
backend/static/
├── phonics_videos/
│   ├── a_0.mp4
│   ├── a_1.mp4
│   ├── b_0.mp4
│   └── ...
└── phonics_audio/
    ├── a_0.wav
    ├── a_1.wav
    ├── b_0.wav
    └── ...
```

## Troubleshooting

### Issue: CUDA out of memory
**Solution:**
- Reduce batch size in SadTalker config
- Use CPU mode (slower but works)
- Close other GPU-intensive applications

### Issue: Poor lip-sync
**Solution:**
- Ensure audio is clear and at proper speed
- Use front-facing character image
- Try different preprocess options

### Issue: Character looks distorted
**Solution:**
- Use higher quality reference image
- Ensure face is clearly visible
- Try different preprocess settings

### Issue: Generation too slow
**Solution:**
- Use GPU if available
- Reduce video resolution in config
- Generate videos in batches

## Performance Tips

### GPU Acceleration
```bash
# Check if CUDA is available
python -c "import torch; print(torch.cuda.is_available())"
```

### Batch Generation
Generate videos overnight or during low-usage periods.

### Caching
Once generated, videos are cached and served instantly.

## Alternative: Quick Test

To test with just one letter:

```python
from app.services.sadtalker_service import sadtalker_service

# Generate audio for letter A
audio_path = sadtalker_service.generate_audio(
    "The letter A as in apple. A.",
    "a_0.wav"
)

# Generate video
success, message, path = sadtalker_service.generate_video(
    audio_path=audio_path,
    output_filename="a_0.mp4",
    still_mode=True
)

print(f"Success: {success}, Message: {message}")
```

## Next Steps

1. ✅ Install SadTalker
2. ✅ Prepare character image
3. ✅ Generate audio files
4. ✅ Generate videos
5. ✅ Test in application
6. ✅ Deploy to production

## Resources

- **SadTalker GitHub:** https://github.com/OpenTalker/SadTalker
- **SadTalker Demo:** https://huggingface.co/spaces/vinthony/SadTalker
- **Paper:** https://arxiv.org/abs/2211.12194
- **gTTS Documentation:** https://gtts.readthedocs.io/

---

**Last Updated:** 2026-05-13
**Status:** Ready for Implementation
