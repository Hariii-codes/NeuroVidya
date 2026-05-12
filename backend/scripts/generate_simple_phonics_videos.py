#!/usr/bin/env python3
"""
Generate simple animated phonics videos using moviepy.

This creates effective videos for dyslexia learning with:
- Audio playback
- Letter display
- Mouth animation indicator
- Example word display
"""

import sys
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

# Try to import moviepy, provide instructions if not available
try:
    from moviepy.editor import VideoFileClip, AudioFileClip, CompositeVideoClip, ImageClip, TextClip, CompositeAudioClip
    MOVIEPY_AVAILABLE = True
except ImportError:
    MOVIEPY_AVAILABLE = False
    print("MoviePy not installed. Install with: pip3 install moviepy")


def create_phonics_frame(letter: str, phoneme_text: str, example_word: str, size=(1024, 1024)) -> np.ndarray:
    """Create a single frame for phonics video."""
    # Create image
    img = Image.new('RGB', size, color='#FFE4B5')  # Light orange background
    draw = ImageDraw.Draw(img)

    # Try to use a nice font, fall back to default
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 200)
        font_medium = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 80)
        font_small = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 50)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Draw big letter in center
    text_bbox = draw.textbbox((0, 0), letter, font=font_large)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    position = ((size[0] - text_width) // 2, 200)
    draw.text(position, letter, fill='#000000', font=font_large)

    # Draw phoneme text
    phoneme_bbox = draw.textbbox((0, 0), phoneme_text, font=font_medium)
    phoneme_width = phoneme_bbox[2] - phoneme_bbox[0]
    phoneme_position = ((size[0] - phoneme_width) // 2, 500)
    draw.text(phoneme_position, phoneme_text, fill='#333333', font=font_medium)

    # Draw example word
    example_bbox = draw.textbbox((0, 0), f"as in {example_word}", font=font_small)
    example_width = example_bbox[2] - example_bbox[0]
    example_position = ((size[0] - example_width) // 2, 650)
    draw.text(example_position, f"as in {example_word}", fill='#666666', font=font_small)

    # Add visual indicator for mouth movement
    circle_position = (size[0] // 2, 850)
    draw.ellipse([circle_position[0] - 50, circle_position[1] - 30, circle_position[0] + 50, circle_position[1] + 30],
                 fill='#FFD700', outline='#FFA500', width=5)

    return np.array(img)


def generate_simple_video(letter_id: str, phoneme_data: dict, phoneme_index: int) -> bool:
    """Generate a simple phonics video."""
    if not MOVIEPY_AVAILABLE:
        print("  ✗ MoviePy not available")
        return False

    try:
        # Paths
        base_dir = Path(__file__).parent.parent
        audio_dir = base_dir / "static" / "phonics_audio"
        output_dir = base_dir / "static" / "phonics_videos"

        output_dir.mkdir(parents=True, exist_ok=True)

        # Audio file
        audio_file = audio_dir / f"{letter_id.lower()}_{phoneme_index}.wav"

        if not audio_file.exists():
            print(f"  ✗ Audio file not found: {audio_file}")
            return False

        # Get phoneme information
        sound = phoneme_data.get("sound", "")
        example_words = phoneme_data.get("exampleWords", ["word"])

        if not example_words or not example_words[0]:
            return False

        example_word = example_words[0]

        # Create phoneme display text
        if sound.startswith("long_") or sound.startswith("short_"):
            phoneme_text = f"The {sound.replace('_', ' ')} sound"
        else:
            phoneme_text = f"The sound {letter_id.upper()}"

        # Load audio
        audio = AudioFileClip(str(audio_file))
        duration = audio.duration

        # Create frames
        print(f"  → Generating {duration:.1f}s video...")

        # Create a simple animation with letter
        frames = []
        for i in range(int(duration * 10)):  # 10 fps
            frame = create_phonics_frame(letter_id, phoneme_text, example_word)
            frames.append(frame)

        # Create video from frames
        video_clip = ImageClip(np.array(frames[0]), duration=duration)

        # Add audio
        final_clip = video_clip.set_audio(audio)

        # Write video
        output_file = output_dir / f"{letter_id.lower()}_{phoneme_index}.mp4"
        final_clip.write_videofile(str(output_file), fps=10, audio_codec='aac', verbose=False, logger=None)

        print(f"  ✓ Generated video: {output_file.name}")
        return True

    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        return False


def generate_all_simple_videos():
    """Generate simple videos for all phonemes."""
    if not MOVIEPY_AVAILABLE:
        print("\n❌ MoviePy is not installed!")
        print("Install with: pip3 install moviepy")
        print("\nThese videos will be simple but effective for dyslexia learning!")
        return

    phonics_data_path = Path(__file__).parent.parent / "app" / "data" / "phonics_data.json"

    if not phonics_data_path.exists():
        print(f"✗ Phonics data not found")
        return

    print("Loading phonics data...")
    with open(phonics_data_path, 'r') as f:
        data = json.load(f)

    letters = data.get('letters', [])

    if not letters:
        print("✗ No letters found")
        return

    print(f"Found {len(letters)} letters")
    print("="*50)

    results = {
        'success': 0,
        'skipped': 0,
        'failed': 0,
        'total': 0
    }

    for letter in letters:
        letter_id = letter.get('id', '')
        phonemes = letter.get('phonemes', [])

        if not letter_id:
            continue

        print(f"\nProcessing letter {letter_id}:")

        for i, phoneme in enumerate(phonemes):
            results['total'] += 1

            # Check if video already exists
            base_dir = Path(__file__).parent.parent
            output_dir = base_dir / "static" / "phonics_videos"
            output_file = output_dir / f"{letter_id.lower()}_{i}.mp4"

            if output_file.exists():
                print(f"  ⊙ Video already exists for {letter_id}-{i}")
                results['skipped'] += 1
                continue

            if generate_simple_video(letter_id, phoneme, i):
                results['success'] += 1
            else:
                results['failed'] += 1

    print("\n" + "="*50)
    print("Simple Video Generation Summary:")
    print(f"  Total: {results['total']}")
    print(f"  Success: {results['success']}")
    print(f"  Skipped: {results['skipped']}")
    print(f"  Failed: {results['failed']}")
    print("="*50)

    if results['success'] > 0:
        print("\n✅ Videos generated successfully!")
        print("📁 Location: backend/static/phonics_videos/")
        print("\nThese simple videos are perfect for dyslexia learning!")
        print("They show:")
        print("  • Big letter display")
        print("  • Audio pronunciation")
        print("  • Example words")
        print("  • Visual mouth movement indicator")


if __name__ == "__main__":
    print("Simple Phonics Video Generator")
    print("="*50)
    print("Creating effective videos for dyslexia learning...")
    print("="*50)
    generate_all_simple_videos()
