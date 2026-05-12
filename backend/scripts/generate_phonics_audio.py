#!/usr/bin/env python3
"""
Generate audio files for all phonemes using Google TTS.

This script reads the phonics data and generates audio files
for each letter and phoneme combination.
"""

import sys
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.sadtalker_service import sadtalker_service


def generate_audio_for_phoneme(letter_id: str, phoneme_data: dict, index: int) -> bool:
    """Generate audio for a single phoneme."""
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

    # Generate audio
    filename = f"{letter_id.lower()}_{index}.wav"
    success, message, path = sadtalker_service.generate_audio(text, filename)

    if success:
        print(f"  ✓ Generated audio for {letter_id}-{index}: {text}")
        return True
    else:
        print(f"  ✗ Failed: {message}")
        return False


def generate_all_audio():
    """Generate audio files for all phonemes."""
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
        'failed': 0,
        'total': 0
    }

    for letter in letters:
        letter_id = letter.get('id', '')
        phonemes = letter.get('phonemes', [])

        if not letter_id:
            continue

        print(f"\nGenerating audio for letter {letter_id}:")

        for i, phoneme in enumerate(phonemes):
            results['total'] += 1

            if generate_audio_for_phoneme(letter_id, phoneme, i):
                results['success'] += 1
            else:
                results['failed'] += 1

    print("\n" + "="*50)
    print("Audio Generation Summary:")
    print(f"  Total: {results['total']}")
    print(f"  Success: {results['success']}")
    print(f"  Failed: {results['failed']}")
    print("="*50)


if __name__ == "__main__":
    print("Phonics Audio Generator")
    print("="*50)
    generate_all_audio()
