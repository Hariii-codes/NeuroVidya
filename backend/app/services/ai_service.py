# backend/app/services/ai_service.py
from typing import List, Dict, Any, Optional
from openai import OpenAI
from anthropic import Anthropic
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self._openai_client = None
        self._anthropic_client = None
        self._settings_loaded = False

    def _load_settings(self):
        """Load settings and create clients on first use."""
        if not self._settings_loaded:
            settings = get_settings()
            print(f"DEBUG: Loading settings - OpenAI: {bool(settings.OPENAI_API_KEY)}, Anthropic: {bool(settings.ANTHROPIC_API_KEY)}")
            self._openai_client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
            self._anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
            self._settings_loaded = True
            print(f"DEBUG: AI Service loaded - OpenAI: {self._openai_client is not None}, Anthropic: {self._anthropic_client is not None}")
            logger.info(f"AI Service loaded - OpenAI: {self._openai_client is not None}, Anthropic: {self._anthropic_client is not None}")

    @property
    def openai_client(self):
        self._load_settings()
        return self._openai_client

    @property
    def anthropic_client(self):
        self._load_settings()
        return self._anthropic_client

    def _get_available_provider(self) -> Optional[str]:
        """Check which AI provider is available."""
        # Try OpenAI first (check if it's working)
        if self.openai_client:
            return "openai"
        elif self.anthropic_client:
            return "anthropic"
        return None

    async def chat(self, message: str, history: List[Dict[str, str]]) -> str:
        """Chat with AI assistant, optimized for dyslexic learners."""
        provider = self._get_available_provider()
        if not provider:
            return "I'm sorry, the AI service is not available right now. Please try again later."

        try:
            # System prompt optimized for dyslexic learners
            system_prompt = """You are a helpful tutor for students with dyslexia. Your role is to:

1. Explain things in simple, clear language
2. Use short sentences (10-15 words max)
3. Break complex ideas into smaller parts
4. Use examples and comparisons
5. Be encouraging and supportive
6. Avoid jargon unless necessary, then explain it

Always be patient and supportive. Learning differences don't mean someone can't learn - they just learn differently!"""

            if provider == "anthropic":
                return await self._chat_anthropic(message, history, system_prompt)
            else:
                return await self._chat_openai(message, history, system_prompt)

        except Exception as e:
            logger.error(f"AI chat error: {e}")
            return "I'm having trouble right now. Please try again!"

    async def _chat_openai(self, message: str, history: List[Dict[str, str]], system_prompt: str) -> str:
        """Chat using OpenAI."""
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend([{"role": m["role"], "content": m["content"]} for m in history[-5:]])
        messages.append({"role": "user", "content": message})

        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=500,
            temperature=0.7,
        )
        return response.choices[0].message.content

    async def _chat_anthropic(self, message: str, history: List[Dict[str, str]], system_prompt: str) -> str:
        """Chat using Anthropic Claude."""
        # Build message history for Claude
        messages = []
        for msg in history[-5:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": message})

        response = self.anthropic_client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=500,
            temperature=0.7,
            system=system_prompt,
            messages=messages
        )
        return response.content[0].text

    async def simplify_text(self, text: str, reading_level: str = "elementary") -> str:
        """Simplify text to appropriate reading level."""
        provider = self._get_available_provider()
        if not provider:
            return text  # Return original if AI unavailable

        try:
            level_guidance = {
                "elementary": "Use simple words (1-2 syllables), very short sentences, explain everything clearly.",
                "middle": "Use common vocabulary, medium-length sentences, some explanations.",
                "high": "Use grade-appropriate language, but keep sentences clear and well-structured.",
            }

            prompt = f"""Simplify this text for a {reading_level} level reader:
{level_guidance[reading_level]}

Text to simplify: {text}

Return only the simplified text, nothing else."""

            if provider == "anthropic":
                return await self._simplify_anthropic(prompt)
            else:
                return await self._simplify_openai(prompt)

        except Exception as e:
            logger.error(f"Text simplification error: {e}")
            return text  # Return original on error

    async def _simplify_openai(self, prompt: str) -> str:
        """Simplify using OpenAI."""
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.3,
        )
        return response.choices[0].message.content

    async def _simplify_anthropic(self, prompt: str) -> str:
        """Simplify using Anthropic."""
        response = self.anthropic_client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=1000,
            temperature=0.3,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text

    async def explain_concept(self, concept: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Explain a concept with simple language and examples."""
        provider = self._get_available_provider()
        if not provider:
            return {
                "explanation": f"{concept} - AI service unavailable",
                "examples": [],
                "visualSuggestion": "Try looking up diagrams online"
            }

        try:
            context_str = f"\nContext: {context}" if context else ""
            prompt = f"""Explain "{concept}" in simple terms for a dyslexic learner.{context_str}

Provide:
1. A simple explanation (2-3 sentences)
2. 2-3 concrete examples
3. A visual suggestion (what kind of diagram would help)

Return as JSON with keys: explanation, examples (array), visualSuggestion (string)"""

            if provider == "anthropic":
                content = await self._explain_anthropic(prompt)
            else:
                content = await self._explain_openai(prompt)

            return {
                "explanation": content,
                "examples": ["Example 1", "Example 2"],
                "visualSuggestion": "A diagram showing the key parts",
            }

        except Exception as e:
            logger.error(f"Concept explanation error: {e}")
            return {
                "explanation": f"{concept} - Error getting explanation",
                "examples": [],
                "visualSuggestion": "Try searching online"
            }

    async def _explain_openai(self, prompt: str) -> str:
        """Explain using OpenAI."""
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.5,
        )
        return response.choices[0].message.content

    async def _explain_anthropic(self, prompt: str) -> str:
        """Explain using Anthropic."""
        response = self.anthropic_client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=800,
            temperature=0.5,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text


# Singleton instance
ai_service = AIService()
