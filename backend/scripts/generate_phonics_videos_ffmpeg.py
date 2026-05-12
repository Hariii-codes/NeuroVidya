#!/usr/bin/env python3
"""
Generate simple phonics videos using ffmpeg.

This creates effective videos for dyslexia learning with:
- Audio playback
- Letter display
- Clean background
- Example word display

Uses ffmpeg which is already installed on most systems.
"""

import sys
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


def create_phonics_image(letter: str, phoneme_text: str, example_word: str, output_path: Path) -> bool:
    """Create an image for phonics video."""
    try:
        # Create image
        size = (1024, 1024)
        img = Image.new('RGB', size, color='#FFE4B5')  # Light orange background
        draw = ImageDraw.Draw(img)

        # Try to use system fonts
        try:
            font_large = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 250)
            font_medium = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 80)
            font_small = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 50)
        except:
            try:
                font_large = ImageFont.truetype("Arial", 250)
                font_medium = ImageFont.truetype("Arial", 80)
                font_small = ImageFont.truetype("Arial", 50)
            except:
                font_large = ImageFont.load_default()
                font_medium = ImageFont.load_default()
                font_small = ImageFont.load_default()

        # Draw big letter in center
        text_bbox = draw.textbbox((0, 0), letter, font=font_large)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        position = ((size[0] - text_width) // 2, 150)
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

        # Add mouth movement indicator
        circle_position = (size[0] // 2, 850)
        draw.ellipse([circle_position[0] - 60, circle_position[1] - 40, circle_position[0] + 60, circle_position[1] + 40],
                     fill='#FFD700', outline='#FFA500', width=5)

        # Save image
        img.save(output_path)
        return True
    except Exception as e:
        print(f"    Error creating image: {e}")
        return False


def generate_video_with_ffmpeg(image_path: Path, audio_path: Path, output_path: Path) -> bool:
    """Generate video using ffmpeg."""
    try:
        # Get audio duration
        probe_result = subprocess.run([
            'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1', str(audio_path)
        ], capture_output=True, text=True)

        if probe_result.returncode != 0:
            print(f"    Error getting audio duration")
            return False

        duration = float(probe_result.stdout.strip())

        # Generate video with ffmpeg
        # Loop the image for the duration of the audio
        cmd = [
            'ffmpeg', '-y',
            '-loop', '1',
            '-i', str(image_path),
            '-i', str(audio_path),
            '-c:v', 'libx264',
            '-tune', 'stillimage',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',
            '-pix_fmt', 'yuv420p',
            '-t', str(duration),
            str(output_path)
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            return True
        else:
            print(f"    FFmpeg error: {result.stderr}")
            return False

    except Exception as e:
        print(f"    Error generating video: {e}")
        return False


def generate_phonics_video(letter_id: str, phoneme_data: dict, phoneme_index: int, base_dir: Path) -> bool:
    """Generate a phonics video."""
    try:
        # Paths
        audio_dir = base_dir / "static" / "phonics_audio"
        output_dir = base_dir / "static" / "phonics_videos"
        temp_dir = base_dir / "static" / "temp"

        output_dir.mkdir(parents=True, exist_ok=True)
        temp_dir.mkdir(parents=True, exist_ok=True)

        # Audio file
        audio_file = audio_dir / f"{letter_id.lower()}_{phoneme_index}.wav"

        if not audio_file.exists():
            print(f"    ✗ Audio file not found")
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

        # Create image
        image_path = temp_dir / f"{letter_id.lower()}_{phoneme_index}.png"
        print(f"    → Creating image...")
        if not create_phonics_image(letter_id, phoneme_text, example_word, image_path):
            return False

        # Generate video
        output_file = output_dir / f"{letter_id.lower()}_{phoneme_index}.mp4"
        print(f"    → Generating video with ffmpeg...")

        if generate_video_with_ffmpeg(image_path, audio_file, output_file):
            print(f"    ✓ Generated: {output_file.name}")
            # Clean up temp image
            image_path.unlink()
            return True
        else:
            return False

    except Exception as e:
        print(f"    ✗ Error: {e}")
        return False


def generate_all_videos():
    """Generate videos for all phonemes."""
    base_dir = Path(__file__).parent.parent
    phonics_data_path = base_dir / "app" / "data" / "phonics_data.json"

    if not phonics_data_path.exists():
        print("✗ Phonics data not found")
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

    # Check ffmpeg
    ffmpeg_check = subprocess.run(['which', 'ffmpeg'], capture_output=True)
    if ffmpeg_check.returncode != 0:
        print("❌ FFmpeg not found!")
        print("Install with: brew install ffmpeg")
        return

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

        print(f"\nGenerating videos for letter {letter_id}:")

        for i, phoneme in enumerate(phonemes):
            results['total'] += 1

            # Check if video already exists
            output_dir = base_dir / "static" / "phonics_videos"
            output_file = output_dir / f"{letter_id.lower()}_{i}.mp4"

            if output_file.exists():
                print(f"  ⊙ Video already exists for {letter_id}-{i}")
                results['skipped'] += 1
                continue

            if generate_phonics_video(letter_id, phoneme, i, base_dir):
                results['success'] += 1
            else:
                results['failed'] += 1

    print("\n" + "="*50)
    print("Video Generation Summary:")
    print(f"  Total: {results['total']}")
    print(f"  Success: {results['success']}")
    print(f"  Skipped: {results['skipped']}")
    print(f"  Failed: {results['failed']}")
    print("="*50)

    if results['success'] > 0:
        print("\n✅ Videos generated successfully!")
        print(f"📁 Location: {base_dir / 'static' / 'phonics_videos'}")
        print("\nThese videos are perfect for dyslexia learning!")
        print("Features:")
        print("  • Clear letter display")
        print("  • Audio pronunciation")
        print("  • Example words")
        print("  • Visual movement indicator")
        print("  • Dyslexia-friendly colors")


if __name__ == "__main__":
    print("Phonics Video Generator (FFmpeg)")
    print("="*50)
    print("Creating effective videos for dyslexia learning...")
    print("="*50)
    generate_all_videos()
