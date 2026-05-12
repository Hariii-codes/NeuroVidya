# backend/app/api/assistant.py
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal, Union, Optional
from app.services.ai_service import ai_service

router = APIRouter()

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    messages: Optional[List[ChatMessage]] = None
    # Legacy support
    message: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None


class ChatResponse(BaseModel):
    response: str


@router.post("/chat")
async def chat(request: ChatRequest):
    """Chat with AI assistant. Streaming response compatible with Vercel AI SDK useChat hook."""
    try:
        # Handle AI SDK format
        if request.messages:
            # Get the last user message
            user_message = ""
            for msg in reversed(request.messages):
                if msg.role == "user":
                    user_message = msg.content
                    break

            # Convert history
            history = [
                {"role": msg.role, "content": msg.content}
                for msg in request.messages[:-1]
            ]

            response = await ai_service.chat(user_message, history)

            # Stream the response in AI SDK SSE format that useChat expects
            async def generate():
                import json
                # Send the text delta
                chunk = {"type": "text-delta", "textDelta": response}
                yield f"data: {json.dumps(chunk)}\n\n"
                # Send completion
                yield "data: [DONE]\n\n"

            return StreamingResponse(generate(), media_type="text/event-stream")

        # Legacy format support
        else:
            message = request.message or ""
            history = request.history or []
            response = await ai_service.chat(message, history)
            return ChatResponse(response=response)

    except Exception as e:
        import traceback
        traceback.print_exc()

        async def error_generate():
            import json
            chunk = {"type": "text-delta", "textDelta": "I'm having trouble right now. Please try again!"}
            yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(error_generate(), media_type="text/event-stream")


# Stream endpoint for AI SDK streaming
@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Streaming chat endpoint for Vercel AI SDK."""
    async def generate():
        try:
            user_message = ""
            if request.messages:
                for msg in reversed(request.messages):
                    if msg.role == "user":
                        user_message = msg.content
                        break
            else:
                user_message = request.message or ""

            history = []
            if request.messages:
                history = [
                    {"role": msg.role, "content": msg.content}
                    for msg in request.messages[:-1]
                ]
            else:
                history = request.history or []

            response = await ai_service.chat(user_message, history)

            # Stream the response
            from starlette.responses import StreamingResponse as StarletteStreamingResponse
            import json

            chunk_id = "chat-" + str(hash(user_message))

            # Send chunks in AI SDK format
            for i, char in enumerate(response):
                chunk = {
                    "id": chunk_id,
                    "object": "chat.completion.chunk",
                    "created": 1234567890,
                    "model": "gpt-4",
                    "choices": [{
                        "index": 0,
                        "delta": {"content": char},
                        "finish_reason": None
                    }]
                }
                yield f"data: {json.dumps(chunk)}\n\n"

            # Final chunk
            final_chunk = {
                "id": chunk_id,
                "object": "chat.completion.chunk",
                "created": 1234567890,
                "model": "gpt-4",
                "choices": [{
                    "index": 0,
                    "delta": {},
                    "finish_reason": "stop"
                }]
            }
            yield f"data: {json.dumps(final_chunk)}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            error_chunk = {
                "error": {"message": str(e), "type": "api_error"}
            }
            yield f"data: {json.dumps(error_chunk)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
