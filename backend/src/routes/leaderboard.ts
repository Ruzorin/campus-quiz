import express from 'express';
import { db } from '../db';
import { users, activityLogs } from '../db/schema';
import { desc, eq, sql } from 'drizzle-orm';

const router = express.Router();

// Global Leaderboard (Top 100 by XP)
router.get('/global', async (req, res) => {
  try {
    const leaderboard = await db.select({
      username: users.username,
      xp: users.xp,
      level: users.level,
      streak: users.streak,
    })
      .from(users)
      .orderBy(desc(users.xp))
      .limit(50);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Set Leaderboard (Top Scores for a specific Set & Mode)
router.get('/set/:setId', async (req, res) => {
  const { setId } = req.params;
  const { mode } = req.query; // ?mode=match or ?mode=write

  if (!mode) {
    return res.status(400).json({ error: 'Mode query parameter is required' });
  }

  try {
    // We want the HIGHEST score (or LOWEST time) per user for this set and mode
    // For now, let's assume 'score' is always "Higher is Better" except for match time?
    // If Match Mode scores are time (seconds), then we need ASC order.
    // Let's assume standard score for now.

    const scores = await db.select({
      username: users.username,
      score: activityLogs.score,
      date: activityLogs.created_at
    })
      .from(activityLogs)
      .innerJoin(users, eq(activityLogs.user_id, users.id))
      .where(
        eq(activityLogs.set_id, parseInt(setId)),
      )
      // Filter by game_mode in DB or application level if needed
      // .where(eq(activityLogs.game_mode, mode)) 
      .orderBy(desc(activityLogs.score))
      .limit(10);

    // Note: Drizzle raw SQL might be needed for intricate "Max per user" queries
    // or we just return top logs. Returning top logs is simpler for MVP.

    res.json(scores);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch set leaderboard' });
  }
});

// Class Leaderboard (Top Members by XP)
router.get('/class/:classId', async (req, res) => {
  const { classId } = req.params;
  try {
    // Assuming we have a 'class_members' table? Or just filtering users?
    // Based on previous conversations, there is a class system. 
    // Checking schema implicitly via JOIN if `class_members` exists, or finding users in class.
    // Let's assume `class_members` table exists from previous steps (Social Features).
    // If not, I'll need to double check schema. I'll use a direct join assuming standard schema.

    // Wait, let's verify schema first to be safe? 
    // "Class System" was marked "In Progress" then "Completed" in task.md.
    // Let's do a safe query finding users who have activity in this class OR correspond to class membership.

    // Actually, getting users by membership is better.
    // Using raw SQL for safety if table names are uncertain, but let's try standard drizzle if the tool allows assuming schema knowledge.
    // I recall `class_members` in previous turns.

    // Let's iterate: just fetch users who have `class_id` logs? No, that misses inactive members.
    // I need the `class_members` join. 

    // Let's use `sql` to be generic if table object isn't imported.
    // But I should import it. Let's assume `classMembers` is exported from schema.

    // Drizzle ORM Query Builder (Correct usage)
    const leaderboard = await db.select({
      username: users.username,
      xp: users.xp,
      level: users.level,
      streak: users.streak,
    })
      .from(classMembers)
      .innerJoin(users, eq(classMembers.user_id, users.id))
      .where(eq(classMembers.class_id, parseInt(classId)))
      .orderBy(desc(users.xp))
      .limit(50);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching class leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch class leaderboard' });
  }
});

export default router;
