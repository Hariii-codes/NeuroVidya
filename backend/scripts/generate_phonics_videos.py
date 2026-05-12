#!/usr/bin/env python3
"""
Generate phonics videos using SadTalker.

This script generates videos for all phonemes using the pre-generated
audio files and SadTalker talking head generation.
"""

import sys
import json
from pathlib import Path
import time

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.sadtalker_service import sadtalker_service


def generate_video_for_phoneme(letter_id: str, phoneme_data: dict, index: int) -> bool:
    """Generate video for a single phoneme."""
    sound = phoneme_data.get('sound', '')
    example_words = phoneme_data.get('exampleWords', [''])

    if not example_words or not example_words[0]:
        print(f"  ✗ No example words for {letter_id}-{index}")
        return False

    example_word = example_words[0]

    # Generate audio text
    if sound.startswith('long_') or sound.startswith('short_'):
        sound_name = sound.replace('_', ' ')
        text = f"The {sound_name} sound as in {example_word}. {sound_name}."
    else:
        text = f"The letter sound {sound.upper()} as in {example_word}. {sound}."

    # Check if video already exists
    existing_video = sadtalker_service.get_phonics_video_path(letter_id, index)
    if existing_video:
        print(f"  ⊙ Video already exists for {letter_id}-{index}")
        return True

    # Generate video
    print(f"  → Generating video for {letter_id}-{index}...")
    success, message, path = sadtalker_service.generate_phonics_video(
        letter_id=letter_id,
        phoneme_text=text,
        phoneme_index=index
    )

    if success:
        print(f"  ✓ Generated video for {letter_id}-{index}")
        return True
    else:
        print(f"  ✗ Failed: {message}")
        return False


def generate_all_videos():
    """Generate videos for all phonemes."""
    # Check SadTalker status first
    print("Checking SadTalker service status...")
    status = sadtalker_service.get_service_status()

    print(f"SadTalker installed: {status['installed']}")
    print(f"Character image exists: {status['character_image_exists']}")
    print(f"Output directory: {status['output_dir_path']}")
    print(f"Existing audio files: {status['existing_audio']}")
    print(f"Existing videos: {status['existing_videos']}")
    print()

    if not status['installed']:
        print("✗ SadTalker is not installed!")
        print("Please follow the installation guide in docs/SADTALKER_SETUP.md")
        return

    if not status['character_image_exists']:
        print("✗ Character image not found!")
        print(f"Please place a character image at: {status['character_image_path']}")
        return

    # Load phonics data
    phonics_data_path = Path(__file__).parent.parent / "app" / "data" / "phonics_data.json"

    if not phonics_data_path.exists():
        print(f"✗ Phonics data not found at {phonics_data_path}")
        return

    print("Loading phonics data...")
    with open(phonics_data_path, 'r') as f:
        data = json.load(f)

    letters = data.get('letters', [])

    if not letters:
        print("✗ No letters found in phonics data")
        return

    print(f"Found {len(letters)} letters")
    print("="*50)

    results = {
        'success': 0,
        'skipped': 0,
        'failed': 0,
        'total': 0,
        'start_time': time.time()
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
            existing_video = sadtalker_service.get_phonics_video_path(letter_id, i)
            if existing_video:
                print(f"  ⊙ Video already exists for {letter_id}-{i}")
                results['skipped'] += 1
                continue

            if generate_video_for_phoneme(letter_id, phoneme, i):
                results['success'] += 1
            else:
                results['failed'] += 1

    # Calculate elapsed time
    elapsed_time = time.time() - results['start_time']

    print("\n" + "="*50)
    print("Video Generation Summary:")
    print(f"  Total phonemes: {results['total']}")
    print(f"  Newly generated: {results['success']}")
    print(f"  Already existed: {results['skipped']}")
    print(f"  Failed: {results['failed']}")
    print(f"  Time elapsed: {elapsed_time:.1f} seconds")
    print("="*50)


if __name__ == "__main__":
    print("Phonics Video Generator")
    print("="*50)
    generate_all_videos()
