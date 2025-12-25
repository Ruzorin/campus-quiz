import express from 'express';
import { db } from '../db';
import { users, studySets, userProgress } from '../db/schema';
import { eq, count, sql } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get User Profile Stats
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id; // Corrected from userId to id

    const user = await db.select().from(users).where(eq(users.id, userId)).get();

    // Count created sets
    const setsCount = await db.select({ count: count() })
      .from(studySets)
      .where(eq(studySets.owner_id, userId))
      .get();

    // Count learned terms (mastery > 3)
    const masteredCount = await db.select({ count: count() })
      .from(userProgress)
      .where(sql`${userProgress.user_id} = ${userId} AND ${userProgress.mastery_level} >= 3`)
      .get();

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      setsCreated: setsCount?.count || 0,
      termsMastered: masteredCount?.count || 0,
      joinedAt: user.created_at
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update User Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { username, avatar_url } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    // Check if username is taken
    const existing = await db.select().from(users).where(eq(users.username, username)).get();
    if (existing && existing.id !== userId) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    await db.update(users)
      .set({ username, avatar_url })
      .where(eq(users.id, userId));

    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export const userRoutes = router;
