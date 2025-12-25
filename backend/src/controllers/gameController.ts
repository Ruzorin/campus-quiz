import { Request, Response } from 'express';
import { db } from '../db';
import { classes, classMembers, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { rooms } from '../socket/roomStore';

export const checkGameStatus = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const userId = (req as any).user.id;

    // 1. Find Class by Join Code
    const classData = await db.select().from(classes).where(eq(classes.join_code, code.toUpperCase())).get();

    if (!classData) {
      return res.status(404).json({ error: 'Invalid game code' });
    }

    const classId = classData.id;

    // 2. Check if user is a member (if not, maybe auto-join? User requirement "Hiç kod girmeden..." implies easy access)
    // For "Join with Code" box, let's auto-join or ensure membership
    const membership = await db.select().from(classMembers)
      .where(and(eq(classMembers.class_id, classId), eq(classMembers.user_id, userId)))
      .get();

    if (!membership) {
      // Auto-join logic
      await db.insert(classMembers).values({
        class_id: classId,
        user_id: userId,
        role: 'student'
      });
    }

    // 3. Check if there is an active room
    const room = rooms[classId.toString()];

    if (room && room.status !== 'finished') {
      return res.json({
        active: true,
        classId: classId,
        status: room.status
      });
    }

    // If no active game, just return class info
    res.json({
      active: false,
      classId: classId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check game status' });
  }
};
