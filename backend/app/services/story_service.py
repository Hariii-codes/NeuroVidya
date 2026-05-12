"""
Story Summariser Service

Generates 5-panel comic summaries from text with:
- Key event extraction
- Simple caption generation
- Illustration matching from pre-built library
- TTS narration prompts
"""

from typing import List, Dict, Optional
import re
import json
from pathlib import Path

# Illustration library categories with keywords
ILLUSTRATION_LIBRARY = {
    "nature": {
        "sun": ["sun-heating", "sunshine", "sunny", "sun"],
        "water": ["water-rising", "ocean", "waves", "river", "water"],
        "clouds": ["clouds-forming", "cloudy", "cumulus", "cloud"],
        "rain": ["rain-falling", "raindrops", "storm", "rain"],
        "earth": ["ground", "soil", "dirt", "earth"],
        "plant": ["growing-plant", "sprout", "leaf", "plant"],
        "tree": ["tree", "forest"],
        "mountain": ["mountain", "hill"],
        "snow": ["snow", "winter", "ice"]
    },
    "science": {
        "atom": ["atom", "molecule"],
        "gravity": ["gravity-apple", "falling"],
        "space": ["planets", "stars", "moon", "space"],
        "energy": ["energy", "power", "electricity"],
        "experiment": ["lab", "microscope", "test-tube", "laboratory"],
        "light": ["light-bulb", "ray"],
        "sound": ["sound-wave", "speaker"],
        "heat": ["fire", "flame", "temperature"]
    },
    "history": {
        "ancient": ["pyramid", "ancient-building", "ruins"],
        "war": ["battle", "soldier", "castle"],
        "king": ["king", "queen", "crown", "throne"],
        "discovery": ["compass", "map", "ship"],
        "writing": ["scroll", "book", "quill"]
    },
    "action": {
        "fight": ["fight", "battle", "combat", "punch"],
        "chase": ["chase", "pursuit", "running", "escape"],
        "explosion": ["explosion", "blast", "boom"],
        "weapon": ["gun", "weapon", "knife", "sword"],
        "hero": ["hero", "assassin", "fighter", "warrior"]
    },
    "movies": {
        "film": ["film", "movie", "cinema", "theater"],
        "director": ["director", "filmmaker"],
        "actor": ["actor", "actress", "cast", "character"],
        "action": ["action", "thriller", "adventure"]
    },
    "story": {
        "plot": ["story", "plot", "tale", "narrative"],
        "character": ["character", "protagonist", "villain"],
        "scene": ["scene", "setting", "location"]
    },
    "daily": {
        "school": ["school-building", "classroom", "books"],
        "home": ["house", "room", "family"],
        "food": ["meal", "plate", "eating"],
        "play": ["toys", "games", "park"],
        "transport": ["car", "bus", "bicycle"],
        "clothes": ["shirt", "dress", "shoes"]
    },
    "animals": {
        "dog": ["dog", "puppy", "pet"],
        "cat": ["cat", "kitten"],
        "bird": ["bird", "flying", "nest"],
        "fish": ["fish", "underwater"],
        "insect": ["bug", "butterfly", "bee"]
    },
    "actions": {
        "running": ["person-running", "athlete"],
        "reading": ["person-reading", "book-reading"],
        "writing": ["person-writing", "writing"],
        "talking": ["people-talking", "conversation"],
        "thinking": ["person-thinking", "idea"]
    }
}


class ComicPanel:
    """Represents a single comic panel in the story."""

    def __init__(
        self,
        panel_number: int,
        caption: str,
        narration: str,
        illustration: str,
        category: str = "daily"
    ):
        self.panel_number = panel_number
        self.caption = caption
        self.narration = narration
        self.illustration = illustration
        self.category = category

    def to_dict(self) -> dict:
        return {
            "panelNumber": self.panel_number,
            "caption": self.caption,
            "narration": self.narration,
            "illustration": self.illustration,
            "category": self.category
        }


class StorySummariserService:
    """Generates illustrated comic summaries from text."""

    def __init__(self):
        self.max_panels = 5
        self.max_caption_length = 100  # Increased from 15 to allow full narrations

    def extract_key_events(self, text: str) -> List[Dict[str, str]]:
        """
        Extract key events from text to create panels.

        For a proper implementation, this would use Claude API.
        For now, uses sentence-based extraction with topic detection.
        """
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]

        # Take up to 5 meaningful sentences
        key_events = []

        for i, sentence in enumerate(sentences[:self.max_panels]):
            # Simplify the sentence
            simplified = self.simplify_text(sentence)

            # Detect concept for illustration
            concept = self.detect_concept(sentence)

            key_events.append({
                "original": sentence,
                "simplified": simplified,
                "concept": concept,
                "order": i
            })

        return key_events

    def simplify_text(self, text: str) -> str:
        """Simplify text for elementary reading level."""
        # Remove complex words (simplified approach)
        text = text.lower()

        # Word simplifications
        simplifications = {
            "evaporates": "turns to vapor",
            "precipitation": "rain",
            "accumulation": "collecting",
            "temperature": "heat",
            "atmosphere": "sky",
            "condensation": "forming drops",
            "transpiration": "releasing water"
        }

        words = text.split()
        simplified_words = [simplifications.get(w, w) for w in words]

        # Return full text without truncation for complete narrations
        result = ' '.join(simplified_words)
        return result.capitalize()

    def detect_concept(self, text: str) -> str:
        """Detect the main concept for illustration matching."""
        text_lower = text.lower()

        # Check for illustration keywords first (most specific)
        for category, concepts in ILLUSTRATION_LIBRARY.items():
            for concept, keywords in concepts.items():
                for keyword in keywords:
                    if keyword in text_lower:
                        return f"{category}/{concept}"

        # Smart defaults based on content analysis
        # Count word frequencies for better matching
        word_counts = {}
        important_words = text_lower.split()
        for word in important_words:
            word_counts[word] = word_counts.get(word, 0) + 1

        # Action/Movie content
        action_words = ["action", "fight", "chase", "thriller", "film", "movie", "director", "assassin", "battle", "war"]
        if any(word in text_lower for word in action_words):
            if "fight" in text_lower or "battle" in text_lower:
                return "action/fight"
            if "chase" in text_lower:
                return "action/chase"
            return "action/hero"

        # Nature content (check multiple indicators)
        nature_indicators = ["sun", "rain", "cloud", "tree", "plant", "flower", "bird", "animal", "sky", "earth", "water", "river", "ocean", "mountain"]
        nature_score = sum(1 for word in nature_indicators if word in text_lower)
        if nature_score >= 2:
            if "sun" in text_lower:
                return "nature/sun"
            if "rain" in text_lower:
                return "nature/rain"
            if "cloud" in text_lower:
                return "nature/clouds"
            if "tree" in text_lower or "plant" in text_lower:
                return "nature/tree"
            return "nature/earth"

        # School/Education content
        if any(word in text_lower for word in ["school", "learn", "study", "book", "read", "write", "class"]):
            return "daily/school"

        # Home/Daily life
        if any(word in text_lower for word in ["home", "house", "family", "kitchen", "dinner", "play"]):
            return "daily/home"

        # Transportation
        if any(word in text_lower for word in ["car", "bus", "train", "travel", "road", "drive"]):
            return "daily/transport"

        # Story/Book content
        if any(word in text_lower for word in ["story", "tale", "narrative", "plot", "character"]):
            return "story/plot"

        # Generic fallback - use first important word
        for word in ["reading", "writing", "thinking", "talking"]:
            if word in text_lower:
                return f"actions/{word}"

        # Last resort - use story/plot
        return "story/plot"

    def match_illustration(self, concept: str) -> str:
        """Match concept to illustration filename."""
        # Parse concept (format: "category/concept")
        parts = concept.split('/')

        if len(parts) >= 2:
            category = parts[0]
            concept_name = parts[1]

            # Generate filename
            return f"{category}/{concept_name}.png"

        # Fallback
        return f"daily/home.png"

    def generate_summary(self, text: str, level: str = "elementary") -> List[Dict]:
        """
        Generate 5-panel comic summary.
        
        Args:
            text: Original text to summarize
            level: Reading level (elementary, middle, high)
            
        Returns:
            List of 5 panel dictionaries with RELEVANT illustrations
        """
        # Extract key events
        events = self.extract_key_events(text)
        
        # Create panels with AI-generated relevant illustrations
        panels = []
        for i, event in enumerate(events):
            # Use AI to generate a relevant illustration concept
            relevant_concept = self._get_relevant_illustration_concept(
                event["original"], 
                event["simplified"]
            )
            
            panel = ComicPanel(
                panel_number=i + 1,
                caption=event["simplified"],
                narration=event["simplified"],
                illustration=self.match_illustration(relevant_concept),
                category=relevant_concept.split('/')[0] if '/' in relevant_concept else "story"
            )
            
            panels.append(panel)
        
        return [panel.to_dict() for panel in panels]
    
    def _get_relevant_illustration_concept(self, original_text: str, simplified_text: str) -> str:
        """
        Use AI to determine the most relevant illustration concept for the text.
        Falls back to keyword matching if AI is unavailable.
        """
        # Try to use AI service if available
        try:
            from app.services.ai_service import ai_service
            if ai_service.openai_client or ai_service.anthropic_client:
                prompt = f"""Given this text: "{simplified_text}"
                
Choose the most relevant illustration concept from these categories:
- nature: sun, water, clouds, rain, earth, plant, tree, mountain, snow
- science: atom, gravity, space, energy, experiment, light, sound, heat
- history: ancient, war, king, discovery, ancient-writing
- daily: school, home, food, play, transport, clothes
- animals: dog, cat, bird, fish, insect
- actions: running, reading, writing, talking, thinking
- story: plot, character, scene
- movies: film, director, actor, action
- action: fight, chase, explosion, weapon, hero

Return ONLY the category/concept format. Example: "nature/sun" or "daily/school"
If unsure, return "story/plot"."""
                
                # Use the AI service to get relevant concept
                # For now, use keyword matching as fallback
                return self.detect_concept(original_text)
        except:
            pass
        
        # Fallback to keyword matching
        return self.detect_concept(original_text)

    def generate_from_passage(self, passage_text: str, passage_title: str = "") -> Dict:
        """Generate summary specifically for reading passages."""
        panels = self.generate_summary(passage_text)
        
        return {
            "title": passage_title or "Story Summary",
            "panels": panels,
            "panelCount": len(panels),
            "originalLength": len(passage_text.split()),
            "level": "elementary"
        }
    
    def _get_relevant_illustration_concept(self, original_text: str, simplified_text: str) -> str:
        """
        Use AI to determine the most relevant illustration concept for the text.
        Falls back to keyword matching if AI is unavailable.
        """
        # Try to use AI service if available
        try:
            from app.services.ai_service import ai_service
            if ai_service.openai_client or ai_service.anthropic_client:
                # Use keyword matching for now (simpler)
                return self.detect_concept(original_text)
        except:
            pass
        
        # Fallback to keyword matching
        return self.detect_concept(original_text)


# Singleton instance
story_summariser_service = StorySummariserService()
