# backend/app/api/learning.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import json

from app.core.deps import get_current_user, get_database
from app.models.models import (
    User, DailyProgress, SkillMastery, ReadingSession,
    SpellingError, GameScore, LearningProgress, Prisma
)

router = APIRouter()


# ============================================
# Schemas
# ============================================

class DailyStatsResponse(BaseModel):
    date: str
    readingTime: int  # seconds
    wordsRead: int
    spellingAccuracy: float
    gamesCompleted: int
    studyTime: int  # seconds


class WeeklyProgressResponse(BaseModel):
    weekStart: str
    weekEnd: str
    dailyStats: List[DailyStatsResponse]
    totals: Dict
    averages: Dict


class SkillMasteryResponse(BaseModel):
    skillType: str
    skillName: str
    masteryLevel: float  # 0-1
    practicedAt: str
    trend: str  # improving, stable, declining


class LearningInsights(BaseModel):
    overallProgress: float  # 0-100
    strongAreas: List[str]
    areasForImprovement: List[str]
    recommendedActivities: List[str]
    streak: int
    longestStreak: int


class ActivityLogResponse(BaseModel):
    activities: List[Dict]
    total: int


# ============================================
# Helper Functions
# ============================================

def calculate_mastery_level(times_correct: int, times_seen: int) -> float:
    """Calculate mastery level based on correct/seen ratio."""
    if times_seen == 0:
        return 0.0
    ratio = times_correct / times_seen
    # Adjust for confidence (more attempts = more confidence)
    confidence_factor = min(times_seen / 10, 1.0)
    return ratio * confidence_factor


def determine_trend(recent_level: float, previous_level: float) -> str:
    """Determine if a skill is improving, stable, or declining."""
    diff = recent_level - previous_level
    if diff > 0.05:
        return "improving"
    elif diff < -0.05:
        return "declining"
    return "stable"


# ============================================
# API Endpoints
# ============================================

@router.get("/daily/{date}", response_model=DailyStatsResponse)
async def get_daily_stats(
    date: str,  # Format: YYYY-MM-DD
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get learning statistics for a specific date.
    """
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Get or create daily progress record
    progress = db.query(DailyProgress).filter(
        DailyProgress.userId == current_user.id,
        DailyProgress.date == target_date
    ).first()

    if not progress:
        # Return empty stats
        return DailyStatsResponse(
            date=date,
            readingTime=0,
            wordsRead=0,
            spellingAccuracy=0.0,
            gamesCompleted=0,
            studyTime=0
        )

    return DailyStatsResponse(
        date=date,
        readingTime=progress.readingTime,
        wordsRead=progress.wordsRead,
        spellingAccuracy=progress.spellingAccuracy,
        gamesCompleted=progress.gamesCompleted,
        studyTime=progress.studyTime
    )


@router.post("/daily/{date}/update")
async def update_daily_stats(
    date: str,
    readingTime: Optional[int] = None,
    wordsRead: Optional[int] = None,
    spellingAccuracy: Optional[float] = None,
    gamesCompleted: Optional[int] = None,
    studyTime: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Update learning statistics for a specific date.
    """
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    progress = db.query(DailyProgress).filter(
        DailyProgress.userId == current_user.id,
        DailyProgress.date == target_date
    ).first()

    if progress:
        # Update existing record
        if readingTime is not None:
            progress.readingTime += readingTime
        if wordsRead is not None:
            progress.wordsRead += wordsRead
        if spellingAccuracy is not None:
            # Average the accuracy
            current_acc = progress.spellingAccuracy or 0
            progress.spellingAccuracy = (current_acc + spellingAccuracy) / 2
        if gamesCompleted is not None:
            progress.gamesCompleted += gamesCompleted
        if studyTime is not None:
            progress.studyTime += studyTime
    else:
        # Create new record
        progress = DailyProgress(
            userId=current_user.id,
            date=target_date,
            readingTime=readingTime or 0,
            wordsRead=wordsRead or 0,
            spellingAccuracy=spellingAccuracy or 0.0,
            gamesCompleted=gamesCompleted or 0,
            studyTime=studyTime or 0
        )
        db.add(progress)

    db.commit()
    db.refresh(progress)

    # Update overall learning progress
    overall_progress = db.query(LearningProgress).filter(
        LearningProgress.userId == current_user.id
    ).first()

    if overall_progress:
        today = datetime.now().date()
        if overall_progress.lastActivityDate != today:
            overall_progress.currentStreak += 1
            overall_progress.longestStreak = max(overall_progress.currentStreak, overall_progress.longestStreak)
        overall_progress.lastActivityDate = today

        if wordsRead:
            overall_progress.todayWordsRead = wordsRead
        if studyTime:
            overall_progress.todayReadingTime = studyTime

    db.commit()

    return {"success": True}


@router.get("/weekly", response_model=WeeklyProgressResponse)
async def get_weekly_progress(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get learning statistics for the past week.
    """
    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    # Get all daily progress for the week
    daily_progress = db.query(DailyProgress).filter(
        DailyProgress.userId == current_user.id,
        DailyProgress.date >= week_start,
        DailyProgress.date <= week_end
    ).order_by(DailyProgress.date).all()

    # Calculate totals and averages
    total_reading_time = sum(p.readingTime for p in daily_progress)
    total_words = sum(p.wordsRead for p in daily_progress)
    total_games = sum(p.gamesCompleted for p in daily_progress)
    total_study = sum(p.studyTime for p in daily_progress)

    days_with_data = len(daily_progress) or 1

    stats_list = [
        DailyStatsResponse(
            date=p.date.isoformat(),
            readingTime=p.readingTime,
            wordsRead=p.wordsRead,
            spellingAccuracy=round(p.spellingAccuracy, 2),
            gamesCompleted=p.gamesCompleted,
            studyTime=p.studyTime
        )
        for p in daily_progress
    ]

    return WeeklyProgressResponse(
        weekStart=week_start.isoformat(),
        weekEnd=week_end.isoformat(),
        dailyStats=stats_list,
        totals={
            "readingTime": total_reading_time,
            "wordsRead": total_words,
            "gamesCompleted": total_games,
            "studyTime": total_study
        },
        averages={
            "dailyReadingTime": round(total_reading_time / days_with_data, 1),
            "dailyWords": round(total_words / days_with_data, 1),
            "dailyGames": round(total_games / days_with_data, 1),
            "dailyStudy": round(total_study / days_with_data, 1)
        }
    )


@router.get("/skills", response_model=List[SkillMasteryResponse])
async def get_skill_mastery(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get all skill mastery levels for the user.
    """
    skills = db.query(SkillMastery).filter(
        SkillMastery.userId == current_user.id
    ).order_by(SkillMastery.masteryLevel.desc()).all()

    result = []
    for skill in skills:
        result.append(SkillMasteryResponse(
            skillType=skill.skillType,
            skillName=skill.skillName,
            masteryLevel=round(skill.masteryLevel, 2),
            practicedAt=skill.practicedAt.isoformat(),
            trend="stable"  # Could be calculated with historical data
        ))

    return result


@router.post("/skills/{skill_name}/update")
async def update_skill_mastery(
    skill_name: str,
    skill_type: str,
    correct: bool,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Update skill mastery after practice.
    """
    skill = db.query(SkillMastery).filter(
        SkillMastery.userId == current_user.id,
        SkillMastery.skillName == skill_name
    ).first()

    if skill:
        # Update existing skill
        # Simple decay and recovery model
        if correct:
            skill.masteryLevel = min(skill.masteryLevel + 0.05, 1.0)
        else:
            skill.masteryLevel = max(skill.masteryLevel - 0.02, 0.0)
        skill.practicedAt = datetime.now()
    else:
        # Create new skill
        skill = SkillMastery(
            userId=current_user.id,
            skillType=skill_type,
            skillName=skill_name,
            masteryLevel=0.5 if correct else 0.3,
            practicedAt=datetime.now()
        )
        db.add(skill)

    db.commit()

    return {"success": True, "masteryLevel": round(skill.masteryLevel, 2)}


@router.get("/insights", response_model=LearningInsights)
async def get_learning_insights(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get AI-generated learning insights and recommendations.
    """
    # Get user's overall progress
    progress = db.query(LearningProgress).filter(
        LearningProgress.userId == current_user.id
    ).first()

    # Get recent skills
    skills = db.query(SkillMastery).filter(
        SkillMastery.userId == current_user.id
    ).all()

    # Get recent errors
    recent_errors = db.query(SpellingError).filter(
        SpellingError.userId == current_user.id
        .order_by(SpellingError.lastSeenAt.desc())
        .limit(10)
    ).all()

    # Calculate overall progress (0-100)
    if skills:
        avg_mastery = sum(s.masteryLevel for s in skills) / len(skills)
        overall_progress = avg_mastery * 100
    else:
        overall_progress = 0

    # Identify strong and weak areas
    strong_areas = []
    areas_for_improvement = []

    for skill in skills:
        if skill.masteryLevel >= 0.7:
            strong_areas.append(skill.skillName)
        elif skill.masteryLevel < 0.5:
            areas_for_improvement.append(skill.skillName)

    # Analyze error patterns
    error_types = {}
    for error in recent_errors:
        error_types[error.errorType] = error_types.get(error.errorType, 0) + 1

    for error_type, count in error_types.items():
        if count > 2:
            if error_type == "B_D_SWAP":
                areas_for_improvement.append("b/d letter distinction")
            elif error_type == "MISSING_VOWEL":
                areas_for_improvement.append("vowel inclusion")

    # Generate recommendations
    recommended_activities = []

    if overall_progress < 30:
        recommended_activities.extend([
            "Start with basic reading exercises",
            "Practice letter recognition games",
            "Use focus reading mode"
        ])
    elif overall_progress < 60:
        recommended_activities.extend([
            "Practice with intermediate texts",
            "Work on identified weak areas",
            "Try spelling pattern exercises"
        ])
    else:
        recommended_activities.extend([
            "Challenge yourself with complex texts",
            "Teach back concepts to reinforce learning",
            "Explore advanced vocabulary"
        ])

    # Add specific recommendations based on weak areas
    for area in areas_for_improvement[:2]:
        if "b/d" in area.lower():
            recommended_activities.append("Practice b/d discrimination exercises")
        elif "vowel" in area.lower():
            recommended_activities.append("Work on vowel recognition patterns")
        elif "reversal" in area.lower():
            recommended_activities.append("Practice directional awareness exercises")

    # Get streak info
    current_streak = progress.currentStreak if progress else 0
    longest_streak = progress.longestStreak if progress else 0

    return LearningInsights(
        overallProgress=round(overall_progress, 1),
        strongAreas=strong_areas[:5],
        areasForImprovement=list(set(areas_for_improvement))[:5],
        recommendedActivities=recommended_activities[:5],
        streak=current_streak,
        longestStreak=longest_streak
    )


@router.get("/activity-log", response_model=ActivityLogResponse)
async def get_activity_log(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get recent activity log for the user.
    """
    # Combine data from multiple sources for activity log
    activities = []

    # Reading sessions
    reading_sessions = db.query(ReadingSession).filter(
        ReadingSession.userId == current_user.id
    ).order_by(ReadingSession.createdAt.desc()).limit(limit).offset(offset).all()

    for session in reading_sessions:
        activities.append({
            "type": "reading",
            "description": f"Read {len(session.textContent.split()) if session.textContent else 0} words",
            "date": session.createdAt.isoformat(),
            "wpm": session.wpm,
            "difficulty": session.difficultyScore
        })

    # Game scores
    game_scores = db.query(GameScore).filter(
        GameScore.userId == current_user.id
    ).order_by(GameScore.createdAt.desc()).limit(limit).offset(offset).all()

    for score in game_scores:
        activities.append({
            "type": "game",
            "description": f"Played {score.gameType}",
            "date": score.createdAt.isoformat(),
            "score": score.score,
            "accuracy": score.accuracy
        })

    # Sort by date
    activities.sort(key=lambda x: x["date"], reverse=True)

    return ActivityLogResponse(
        activities=activities[:limit],
        total=len(activities)
    )


@router.get("/dashboard")
async def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get comprehensive dashboard data for analytics view.
    """
    # Get various stats
    today = datetime.now().date()

    # Today's progress
    today_progress = db.query(DailyProgress).filter(
        DailyProgress.userId == current_user.id,
        DailyProgress.date == today
    ).first()

    # Weekly stats
    week_ago = today - timedelta(days=7)
    weekly_progress = db.query(DailyProgress).filter(
        DailyProgress.userId == current_user.id,
        DailyProgress.date >= week_ago
    ).all()

    total_weekly_reading = sum(p.readingTime for p in weekly_progress)
    total_weekly_words = sum(p.wordsRead for p in weekly_progress)

    # Skills overview
    skills = db.query(SkillMastery).filter(
        SkillMastery.userId == current_user.id
    ).order_by(SkillMastery.masteryLevel.desc()).limit(5).all()

    # Recent errors
    recent_errors = db.query(SpellingError).filter(
        SpellingError.userId == current_user.id
    ).order_by(SpellingError.lastSeenAt.desc()).limit(5).all()

    return {
        "today": {
            "readingTime": today_progress.readingTime if today_progress else 0,
            "wordsRead": today_progress.wordsRead if today_progress else 0,
            "gamesPlayed": today_progress.gamesCompleted if today_progress else 0,
            "studyTime": today_progress.studyTime if today_progress else 0
        },
        "week": {
            "totalReadingTime": total_weekly_reading,
            "totalWordsRead": total_weekly_words,
            "averageDaily": {
                "readingTime": round(total_weekly_reading / 7, 1),
                "wordsRead": round(total_weekly_words / 7, 1)
            }
        },
        "skills": [
            {
                "name": s.skillName,
                "level": round(s.masteryLevel, 2),
                "type": s.skillType
            }
            for s in skills
        ],
        "recentErrors": [
            {
                "word": e.errorWord,
                "correct": e.correctWord,
                "type": e.errorType,
                "timesSeen": e.timesSeen
            }
            for e in recent_errors
        ]
    }
