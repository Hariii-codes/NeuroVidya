# backend/app/services/streak_service.py
from datetime import date, datetime, timedelta
from typing import Dict, Any, TYPE_CHECKING
import logging

if TYPE_CHECKING:
    from app.models.models import Prisma

logger = logging.getLogger(__name__)


class StreakCalculator:
    """
    Calculates user learning streaks with a 48-hour grace period.

    Streak Rules:
    - A day counts if user completes ANY learning activity
    - Streak resets if no activity for 48 hours
    - Grace period: 48 hours from last activity
    """

    async def calculate_streak(self, db: Prisma, user_id: str) -> Dict[str, int]:
        """
        Calculate current and longest streaks for a user.

        Args:
            db: Prisma database client
            user_id: User ID to calculate streaks for

        Returns:
            Dict with 'current' and 'longest' streak counts
        """
        try:
            progress = await db.learningprogress.find_unique(
                where={'userId': user_id}
            )

            if not progress or not progress.lastActivityDate:
                return {'current': 0, 'longest': 0}

            # Convert to date if datetime
            if isinstance(progress.lastActivityDate, datetime):
                last_activity = progress.lastActivityDate.date()
            else:
                last_activity = progress.lastActivityDate

            today = date.today()

            # Check if streak is still active (48-hour grace period)
            hours_since = self._hours_since(last_activity, today)

            if hours_since > 48:  # 48-hour grace period exceeded
                current_streak = 0
            else:
                current_streak = await self._count_consecutive_days(
                    db, user_id, last_activity
                )

            longest_streak = max(current_streak, progress.longestStreak)

            # Update longest streak if current is higher
            if current_streak > progress.longestStreak:
                await db.learningprogress.update(
                    where={'userId': user_id},
                    data={'longestStreak': current_streak}
                )

            return {
                'current': current_streak,
                'longest': longest_streak
            }

        except Exception as e:
            logger.error(f"Error calculating streak for user {user_id}: {e}")
            return {'current': 0, 'longest': 0}

    async def _count_consecutive_days(
        self, db: Prisma, user_id: str, from_date: date
    ) -> int:
        """
        Count consecutive days of activity going backwards from a date.

        Args:
            db: Prisma database client
            user_id: User ID to check
            from_date: Starting date to count backwards from

        Returns:
            Number of consecutive days with activity
        """
        count = 0
        check_date = from_date

        # Check up to 365 days back
        for _ in range(365):
            if await self._has_activity_on(db, user_id, check_date):
                count += 1
                check_date -= timedelta(days=1)
            else:
                break

        return count

    async def _has_activity_on(self, db: Prisma, user_id: str, check_date: date) -> bool:
        """
        Check if user had any activity on a specific date.

        Args:
            db: Prisma database client
            user_id: User ID to check
            check_date: Date to check for activity

        Returns:
            True if user had activity on that date
        """
        # Start and end of the check date
        start_of_day = datetime.combine(check_date, datetime.min.time())
        end_of_day = datetime.combine(check_date, datetime.max.time())

        # Check for any activity on that date
        activity_count = await db.activity.count(
            where={
                'userId': user_id,
                'createdAt': {
                    'gte': start_of_day,
                    'lte': end_of_day
                }
            }
        )

        return activity_count > 0

    def _hours_since(self, from_date: date, to_date: date) -> float:
        """Calculate hours between two dates."""
        if isinstance(from_date, datetime):
            from_datetime = from_date
        else:
            from_datetime = datetime.combine(from_date, datetime.min.time())

        if isinstance(to_date, datetime):
            to_datetime = to_date
        else:
            to_datetime = datetime.combine(to_date, datetime.min.time())

        delta = to_datetime - from_datetime
        return abs(delta.total_seconds() / 3600)

    async def record_activity(
        self, db: Prisma, user_id: str, activity_type: str, description: str
    ) -> None:
        """
        Record a user activity and update streaks.

        Args:
            db: Prisma database client
            user_id: User ID to record activity for
            activity_type: Type of activity (READ, GAME_PLAYED, etc.)
            description: Human-readable description of the activity
        """
        try:
            now = datetime.now()

            # Create activity record
            await db.activity.create({
                'userId': user_id,
                'activityType': activity_type,
                'description': description,
            })

            # Get or create progress record
            progress = await db.learningprogress.find_unique(
                where={'userId': user_id}
            )

            if progress:
                # Check if this is a new day
                last_activity_date = progress.lastActivityDate
                if last_activity_date:
                    if isinstance(last_activity_date, datetime):
                        last_date = last_activity_date.date()
                    else:
                        last_date = last_activity_date

                    current_date = now.date()

                    if last_date < current_date:
                        # New day - increment or reset streak
                        hours_since = self._hours_since(last_date, current_date)

                        if hours_since <= 48:
                            # Within grace period - increment streak
                            new_streak = progress.currentStreak + 1
                        else:
                            # Grace period exceeded - reset streak
                            new_streak = 1

                        # Update progress
                        await db.learningprogress.update(
                            where={'userId': user_id},
                            data={
                                'currentStreak': new_streak,
                                'lastActivityDate': now,
                            }
                        )
                    else:
                        # Same day - just update last activity
                        await db.learningprogress.update(
                            where={'userId': user_id},
                            data={'lastActivityDate': now}
                        )
                else:
                    # First activity
                    await db.learningprogress.update(
                        where={'userId': user_id},
                        data={
                            'currentStreak': 1,
                            'lastActivityDate': now,
                        }
                    )
            else:
                # Create initial progress record
                await db.learningprogress.create({
                    'userId': user_id,
                    'currentStreak': 1,
                    'longestStreak': 1,
                    'lastActivityDate': now,
                })

        except Exception as e:
            logger.error(f"Error recording activity for user {user_id}: {e}")


# Singleton instance
streak_service = StreakCalculator()
