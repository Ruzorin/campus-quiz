import { users, activityLogs } from '../db/schema';
import { db } from '../db';
import { eq, sql } from 'drizzle-orm';

export const LEVEL_CONSTANT = 100;

export const XP_RATES: Record<string, number> = {
  learn: 10,
  write: 15,
  match: 5,
  listening: 15,
  typer: 5,
  memory: 10,
  speaking: 20,
};

export const calculateLevel = (xp: number) => {
  return Math.floor(xp / LEVEL_CONSTANT) + 1;
};

export const awardXP = async (userId: number, amount: number, activityType: string, gameMode?: string, setId?: number, classId?: number) => {
  // 1. Log activity
  await db.insert(activityLogs).values({
    user_id: userId,
    activity_type: activityType,
    score: amount,
    game_mode: gameMode,
    set_id: setId,
    class_id: classId,
  });

  // 2. Update User XP, Level, and Streak
  const user = await db.select().from(users).where(eq(users.id, userId)).get();

  if (!user) return;

  // Simple Streak Logic: If last active was today, keep streak. If yesterday, increment. If older, reset.
  // For MVP, simply incrementing streak on every significant activity for now, 
  // or ideally we check dates. Let's do a simple granular streak for now (streak = consecutive correct answers contextually? No, user requested "Extra XP for streaks").

  // Let's assume the frontend sends a "streak" multiplier or we calculate it here based on recent logs?
  // Easier: Just update the cumulative XP.

  // For "Daily Streak", we need to check dates.
  const now = new Date();
  const lastActive = user.last_active_at ? new Date(user.last_active_at) : new Date(0);

  // Check if same day
  const isSameDay = now.toDateString() === lastActive.toDateString();
  const isNextDay = new Date(now.getTime() - 86400000).toDateString() === lastActive.toDateString();

  let newStreak = user.streak || 0;

  if (isNextDay) {
    newStreak += 1;
  } else if (!isSameDay) {
    // Missed a day (or multiple), so reset streak to 1 (current day active)
    newStreak = 1;
  }

  const newXP = (user.xp || 0) + amount;
  const newLevel = calculateLevel(newXP);

  await db.update(users)
    .set({
      xp: newXP,
      level: newLevel,
      streak: newStreak,
      last_active_at: new Date()
    })
    .where(eq(users.id, userId));

  return { newXP, newLevel, levelUp: newLevel > (user.level || 1) };
};
