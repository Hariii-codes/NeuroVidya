from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, assistant, progress, analytics, users, text, games, reading, words, diagrams, learning, spelling, images, reading_coach, story_summariser, ar_game
from app.core.config import get_settings

settings = get_settings()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://neurovidya-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(text.router, prefix="/api/text", tags=["text"])
app.include_router(games.router, prefix="/api/games", tags=["games"])
app.include_router(assistant.router, prefix="/api/assistant", tags=["assistant"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(reading.router, prefix="/api/reading", tags=["reading"])
app.include_router(words.router, prefix="/api/words", tags=["words"])
app.include_router(diagrams.router, prefix="/api/diagrams", tags=["diagrams"])
app.include_router(learning.router, prefix="/api/learning", tags=["learning"])
app.include_router(spelling.router, prefix="/api/spelling", tags=["spelling"])
app.include_router(images.router, prefix="/api/images", tags=["images"])
app.include_router(reading_coach.router, prefix="/api/reading-coach", tags=["reading-coach"])
app.include_router(story_summariser.router, prefix="/api/story-summariser", tags=["story-summariser"])
app.include_router(ar_game.router, prefix="/api/ar-game", tags=["ar-game"])


@app.get("/")
async def root():
    return {"message": "NeuroVidya API", "status": "healthy"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
