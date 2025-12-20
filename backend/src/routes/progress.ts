import express from 'express';
import { db } from '../db';
import { userProgress, terms } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { awardXP, XP_RATES } from '../strategies/gamification';

const router = express.Router();

// Schema for validation
const ProgressSchema = z.object({
  user_id: z.number(),
  term_id: z.number(),
  is_correct: z.boolean(),
  set_id: z.number().optional(), // Added for context
});

router.post('/', async (req, res) => {
  try {
    const { user_id, term_id, is_correct, set_id, game_mode, class_id } = req.body; // Removed Zod for flexibility in MVP or update schema separately

    // 1. Check if progress exists
    const existing = await db.select().from(userProgress)
      .where(and(eq(userProgress.user_id, user_id), eq(userProgress.term_id, term_id)))
      .limit(1);

    const currentLevel = existing.length > 0 ? (existing[0].mastery_level || 0) : 0;
    let newLevel = currentLevel;

    // XP CALCULATION
    if (is_correct) {
      newLevel = Math.min(5, currentLevel + 1);

      // Base XP
      let xpAmount = XP_RATES[game_mode] || 10;

      // Streak Bonus (Passed from Frontend or inferred? Let's just give flat bonus for "Mastery" increase)
      if (newLevel === 5 && currentLevel < 5) xpAmount += 50; // Mastery Bonus

      await awardXP(user_id, xpAmount, 'term_mastered', game_mode, set_id, class_id);
    } else {
      newLevel = Math.max(0, currentLevel - 1);
    }

    // DB Update (Same as before)
    if (existing.length > 0) {
      await db.update(userProgress)
        .set({ mastery_level: newLevel, last_studied_at: new Date() })
        .where(eq(userProgress.id, existing[0].id));
    } else {
      await db.insert(userProgress).values({
        user_id, term_id, mastery_level: newLevel, last_studied_at: new Date()
      });
    }

    res.json({ success: true, new_level: newLevel });

  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

router.get('/smart-review', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const weakTerms = await db.select({
      termId: userProgress.term_id,
      masteryLevel: userProgress.mastery_level,
      term: terms.term,
      definition: terms.definition,
      image_url: terms.image_url
    })
      .from(userProgress)
      .innerJoin(terms, eq(userProgress.term_id, terms.id))
      .where(and(
        eq(userProgress.user_id, Number(userId)),
        sql`${userProgress.mastery_level} < 5`
      ))
      .orderBy(userProgress.mastery_level) // Ascending: Worst first
      .limit(20);

    // If not enough weak terms, maybe fetch random new terms? 
    // For MVP, just return what we have.

    // Format to match expected frontend structure (Set/Term)
    const formattedData = {
      id: 'smart-review',
      title: 'Smart Review Session',
      terms: weakTerms.map((t: any) => ({
        id: t.termId,
        term: t.term,
        definition: t.definition,
        image_url: t.image_url
      }))
    };

    res.json(formattedData);

  } catch (error) {
    console.error('Smart Review Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch smart review session' });
  }
});

export const progressRoutes = router;
