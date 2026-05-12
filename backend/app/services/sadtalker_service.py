"""
SadTalker Video Generation Service

This service handles video generation using SadTalker for phonics tutorials.
SadTalker is a free, open-source talking head generation system.

Repository: https://github.com/OpenTalker/SadTalker
License: MIT (Free for commercial use)
"""

import subprocess
import os
from pathlib import Path
import logging
from typing import Optional, Tuple

logger = logging.getLogger(__name__)


class SadTalkerService:
    """Service for generating phonics videos using SadTalker."""

    def __init__(self):
        # Paths
        self.base_dir = Path(__file__).parent.parent.parent
        self.sadtalker_path = self.base_dir / "SadTalker"
        self.output_dir = self.base_dir / "static" / "phonics_videos"
        self.character_image = self.base_dir / "static" / "characters" / "tutor_reference.png"
        self.audio_dir = self.base_dir / "static" / "phonics_audio"

        # Create directories
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.audio_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"SadTalker Service initialized")
        logger.info(f"SadTalker path: {self.sadtalker_path}")
        logger.info(f"Output dir: {self.output_dir}")
        logger.info(f"Character image: {self.character_image}")

    def check_sadtalker_installed(self) -> bool:
        """Check if SadTalker is installed and accessible."""
        return self.sadtalker_path.exists() and (self.sadtalker_path / "inference.py").exists()

    def generate_audio(self, text: str, output_filename: str) -> Tuple[bool, str, Optional[Path]]:
        """
        Generate audio from text using gTTS (Google Text-to-Speech).

        Args:
            text: Text to convert to speech
            output_filename: Output audio filename

        Returns:
            Tuple of (success, message, audio_path)
        """
        try:
            from gtts import gTTS

            output_path = self.audio_dir / output_filename

            logger.info(f"Generating audio for: {text}")
            tts = gTTS(text=text, lang='en', slow=False)
            tts.save(str(output_path))

            logger.info(f"Audio saved to: {output_path}")
            return True, "Audio generated successfully", output_path

        except ImportError:
            return False, "gTTS not installed. Run: pip install gtts", None
        except Exception as e:
            logger.error(f"Error generating audio: {str(e)}")
            return False, f"Error: {str(e)}", None

    def generate_video(
        self,
        audio_path: Path,
        output_filename: str,
        still_mode: bool = True,
        preprocess: bool = True
    ) -> Tuple[bool, str, Optional[Path]]:
        """
        Generate video using SadTalker.

        Args:
            audio_path: Path to audio file
            output_filename: Output video filename
            still_mode: Use still mode for less movement (better for phonics)
            preprocess: Run preprocessing on image

        Returns:
            Tuple of (success, message, video_path)
        """
        try:
            # Check if SadTalker is installed
            if not self.check_sadtalker_installed():
                return False, f"SadTalker not found at {self.sadtalker_path}. Please install it first.", None

            # Check if character image exists
            if not self.character_image.exists():
                return False, f"Character image not found at {self.character_image}", None

            # Check if audio file exists
            if not audio_path.exists():
                return False, f"Audio file not found at {audio_path}", None

            output_path = self.output_dir / output_filename

            # Build SadTalker command
            cmd = [
                "python",
                "inference.py",
                "--driven_audio", str(audio_path),
                "--source_image", str(self.character_image),
                "--result_dir", str(self.output_dir),
            ]

            # Add optional flags
            if still_mode:
                cmd.append("--still_mode")
            if preprocess:
                cmd.append("--preprocess")

            logger.info(f"Running SadTalker: {' '.join(cmd)}")

            # Run SadTalker
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
                    # Get the most recently created video file
                    latest_video = max(video_files, key=os.path.getctime)

                    # Rename to desired filename
                    if latest_video != output_path:
                        latest_video.rename(output_path)

                    logger.info(f"Video generated successfully: {output_path}")
                    return True, "Video generated successfully", output_path
                else:
                    # Check if output file exists with exact name
                    if output_path.exists():
                        logger.info(f"Video generated successfully: {output_path}")
                        return True, "Video generated successfully", output_path
                    return False, "Video file not found in output directory", None
            else:
                logger.error(f"SadTalker error: {result.stderr}")
                return False, f"SadTalker failed: {result.stderr}", None

        except subprocess.TimeoutExpired:
            return False, "Video generation timed out after 5 minutes", None
        except Exception as e:
            logger.error(f"Error generating video: {str(e)}")
            return False, f"Error: {str(e)}", None

    def get_phonics_video_path(self, letter_id: str, phoneme_index: int) -> Optional[Path]:
        """
        Get path to existing phonics video if it exists.

        Args:
            letter_id: Letter identifier (A-Z)
            phoneme_index: Index of phoneme for letters with multiple sounds

        Returns:
            Path to video file or None if not found
        """
        video_filename = f"{letter_id.lower()}_{phoneme_index}.mp4"
        video_path = self.output_dir / video_filename

        if video_path.exists():
            return video_path
        return None

    def generate_phonics_video(
        self,
        letter_id: str,
        phoneme_text: str,
        phoneme_index: int
    ) -> Tuple[bool, str, Optional[Path]]:
        """
        Complete pipeline to generate a phonics video.

        This method generates both audio and video for a phoneme.

        Args:
            letter_id: Letter identifier (A-Z)
            phoneme_text: Text describing the phoneme sound
            phoneme_index: Index of phoneme for letters with multiple sounds

        Returns:
            Tuple of (success, message, video_path)
        """
        try:
            # Check if video already exists
            existing_video = self.get_phonics_video_path(letter_id, phoneme_index)
            if existing_video:
                logger.info(f"Video already exists: {existing_video}")
                return True, "Video already exists", existing_video

            # Generate audio
            audio_filename = f"{letter_id.lower()}_{phoneme_index}.wav"
            success, message, audio_path = self.generate_audio(phoneme_text, audio_filename)

            if not success:
                return False, f"Audio generation failed: {message}", None

            # Generate video
            video_filename = f"{letter_id.lower()}_{phoneme_index}.mp4"
            success, message, video_path = self.generate_video(
                audio_path=audio_path,
                output_filename=video_filename,
                still_mode=True,  # Less movement for phonics
                preprocess=True
            )

            return success, message, video_path

        except Exception as e:
            logger.error(f"Error in phonics video pipeline: {str(e)}")
            return False, f"Error: {str(e)}", None

    def get_service_status(self) -> dict:
        """Get the current status of the SadTalker service."""
        status = {
            "service": "sadtalker",
            "installed": self.check_sadtalker_installed(),
            "sadtalker_path": str(self.sadtalker_path),
            "character_image_exists": self.character_image.exists(),
            "character_image_path": str(self.character_image),
            "output_dir_exists": self.output_dir.exists(),
            "output_dir_path": str(self.output_dir),
            "audio_dir_exists": self.audio_dir.exists(),
            "audio_dir_path": str(self.audio_dir),
            "existing_videos": len(list(self.output_dir.glob("*.mp4"))),
            "existing_audio": len(list(self.audio_dir.glob("*.wav"))),
        }

        return status


# Singleton instance
sadtalker_service = SadTalkerService()
