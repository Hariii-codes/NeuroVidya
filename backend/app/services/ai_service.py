# backend/app/services/ai_service.py
from typing import List, Dict, Any, Optional
from openai import OpenAI
from anthropic import Anthropic
import google.generativeai as genai
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self._openai_client = None
        self._anthropic_client = None
        self._gemini_client = None
        self._settings_loaded = False

    def _load_settings(self):
        """Load settings and create clients on first use."""
        if not self._settings_loaded:
            settings = get_settings()
            print(f"DEBUG: Loading settings - OpenAI: {bool(settings.OPENAI_API_KEY)}, Anthropic: {bool(settings.ANTHROPIC_API_KEY)}, Gemini: {bool(settings.GEMINI_API_KEY)}")
            self._openai_client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
            self._anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
            if settings.GEMINI_API_KEY:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self._gemini_client = genai
            else:
                self._gemini_client = None
            self._settings_loaded = True
            print(f"DEBUG: AI Service loaded - OpenAI: {self._openai_client is not None}, Anthropic: {self._anthropic_client is not None}, Gemini: {self._gemini_client is not None}")
            logger.info(f"AI Service loaded - OpenAI: {self._openai_client is not None}, Anthropic: {self._anthropic_client is not None}, Gemini: {self._gemini_client is not None}")

    @property
    def openai_client(self):
        self._load_settings()
        return self._openai_client

    @property
    def anthropic_client(self):
        self._load_settings()
        return self._anthropic_client

    @property
    def gemini_client(self):
        self._load_settings()
        return self._gemini_client

    def _get_available_provider(self) -> Optional[str]:
        """Check which AI provider is available."""
        if self.gemini_client:
            return "gemini"
        elif self.anthropic_client:
            return "anthropic"
        elif self.openai_client:
            return "openai"
        return None

    async def chat(self, message: str, history: List[Dict[str, str]]) -> str:
        """Chat with AI assistant, optimized for dyslexic learners."""

        provider = self._get_available_provider()

        if provider == "gemini":
            try:
                return await self._chat_gemini(message, history, self._get_system_prompt())
            except Exception as e:
                logger.error(f"Gemini AI error: {e}")

        if self.anthropic_client:
            try:
                return await self._chat_anthropic(message, history, self._get_system_prompt())
            except Exception as e:
                logger.error(f"Anthropic AI error: {e}")

        if self.openai_client:
            try:
                return await self._chat_openai(message, history, self._get_system_prompt())
            except Exception as e:
                logger.error(f"OpenAI AI error: {e}")

        return self._get_fallback_response(message)

    def _get_system_prompt(self) -> str:
        """Get the system prompt for dyslexic learners."""
        return """You are a supportive AI tutor designed SPECIFICALLY for students with dyslexia. The person you're talking to has dyslexia, so you MUST adapt your communication style.

CRITICAL RULES:
1. Use VERY short sentences (5-10 words max)
2. One idea per sentence - no complex sentences
3. Simple words only - avoid complex vocabulary
4. Break information into tiny chunks
5. Use bullet points for lists
6. Repeat important ideas in different ways
7. Be patient, encouraging, and supportive
8. Celebrate small wins and effort

FORMAT YOUR RESPONSES:
- Use line breaks between ideas
- Use emojis to make it friendly 🌟
- Keep paragraphs under 3 sentences
- Use examples from everyday life
- Suggest visual ways to understand concepts

THINGS TO REMEMBER:
- Dyslexia is a learning difference, not a lack of intelligence
- Many brilliant people have dyslexia
- Reading/writing challenges don't affect thinking ability
- Your student may need extra time - that's okay
- Multi-sensory learning helps (visual, audio, hands-on)

ENCOURAGEMENT PHRASES TO USE:
- "Great question!"
- "You're doing great!"
- "Let's break this down together"
- "That's a smart way to think about it"
- "Everyone learns differently - that's okay!"

AVOID:
- Long paragraphs
- Complex grammar
- Big words without explanation
- Sarcasm or idioms
- Assuming they can read long texts

Your goal: Make learning feel safe, accessible, and successful for someone with dyslexia."""

    def _get_fallback_response(self, message: str) -> str:
        """Provide helpful fallback responses when AI API is unavailable."""
        message_lower = message.lower()

        if any(word in message_lower for word in ["hello", "hi", "hey"]):
            return "Hello! I'm your AI study assistant. I'm here to help you learn in a way that works best for you! (Note: AI API is currently unavailable - please check billing/quota)"

        if any(word in message_lower for word in ["help", "what can you do"]):
            return "I can help you with:\n- Explaining difficult concepts simply\n- Breaking down complex topics\n- Practice exercises\n- Study tips\n\n(Note: AI API is currently unavailable - please check billing/quota for full functionality)"

        if "read" in message_lower:
            return "Reading tips for dyslexic learners:\n\n1. Use a finger or ruler to follow text\n2. Take breaks every 15 minutes\n3. Try dyslexia-friendly fonts like OpenDyslexic\n4. Listen to text with text-to-speech\n5. Highlight key words with colors"

        if "spell" in message_lower:
            return "Spelling strategies:\n\n1. Break words into sounds\n2. Use rhyming words to remember\n3. Practice with flashcards\n4. Write words multiple times\n5. Use spell-check tools"

        if "math" in message_lower:
            return "Math tips for dyslexic learners:\n\n1. Use graph paper to keep numbers aligned\n2. Read problems out loud\n3. Draw pictures to understand word problems\n4. Use colored pencils for different steps\n5. Practice with manipulatives (blocks, counters)"

        return f"I'd love to help with '{message}', but the AI service is currently unavailable. Please check your API billing/quota. In the meantime, I can help with: reading tips, spelling strategies, or math tips!"

    async def _chat_gemini(self, message: str, history: List[Dict[str, str]], system_prompt: str) -> str:
        """Chat using Gemini."""
        model = self.gemini_client.GenerativeModel('gemini-flash-latest')
        
        # Build conversation history
        conversation = f"{system_prompt}\n\n"
        for msg in history[-5:]:
            role = "User" if msg["role"] == "user" else "Assistant"
            conversation += f"{role}: {msg['content']}\n"
        conversation += f"User: {message}\nAssistant: "
        
        response = model.generate_content(conversation)
        return response.text

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
        """Chat using Anthropic Claude - optimized for speed."""
        # Build message history for Claude (limit to last 3 for speed)
        messages = []
        for msg in history[-3:]:  # Reduced from 5 to 3 for faster response
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": message})

        response = self.anthropic_client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=300,  # Reduced from 500 for faster response
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

            if provider == "gemini":
                return await self._simplify_gemini(prompt)
            elif provider == "anthropic":
                return await self._simplify_anthropic(prompt)
            else:
                return await self._simplify_openai(prompt)

        except Exception as e:
            logger.error(f"Text simplification error: {e}")
            return text  # Return original on error

    async def _simplify_gemini(self, prompt: str) -> str:
        """Simplify using Gemini."""
        model = self.gemini_client.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        return response.text

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

            if provider == "gemini":
                content = await self._explain_gemini(prompt)
            elif provider == "anthropic":
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

    async def _explain_gemini(self, prompt: str) -> str:
        """Explain using Gemini."""
        model = self.gemini_client.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        return response.text

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
