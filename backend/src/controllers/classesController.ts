import { Request, Response } from 'express';
import { db } from '../db';
import { classes, classMembers, assignments, terms, userProgress, users } from '../db/schema';
import { eq, and, inArray, sql, desc, asc } from 'drizzle-orm';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid'; // User might need to install uuid or I can use random string manually

// Helper for random code
const generateJoinCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const createClassSchema = z.object({
  name: z.string().min(1),
});

const joinClassSchema = z.object({
  join_code: z.string().min(1),
});

export const createClass = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name } = createClassSchema.parse(req.body);
    const joinCode = generateJoinCode();

    const [result] = await db.insert(classes).values({
      name,
      owner_id: userId,
      join_code: joinCode,
    });

    const classId = (result as any).insertId;

    // Add owner as admin member
    await db.insert(classMembers).values({
      class_id: classId,
      user_id: userId,
      role: 'admin',
    });

    res.status(201).json({ message: 'Class created', classId, joinCode });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: (error as z.ZodError).errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

export const joinClass = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { join_code } = joinClassSchema.parse(req.body);

    const targetClass = await db.query.classes.findFirst({
      where: eq(classes.join_code, join_code),
    });

    if (!targetClass) {
      return res.status(404).json({ message: 'Class not found or invalid code' });
    }

    // Check if already member
    const existingMember = await db.query.classMembers.findFirst({
      where: and(
        eq(classMembers.class_id, targetClass.id),
        eq(classMembers.user_id, userId)
      )
    });

    if (existingMember) {
      return res.status(400).json({ message: 'Already a member of this class' });
    }

    await db.insert(classMembers).values({
      class_id: targetClass.id,
      user_id: userId,
      role: 'student',
    });

    res.status(200).json({ message: 'Joined class successfully', class: targetClass });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: (error as z.ZodError).errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

export const getClassDetails = async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.id);
    if (isNaN(classId)) return res.status(400).json({ message: 'Invalid ID' });

    const classData = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
      with: {
        members: {
          with: {
            user: {
              columns: {
                id: true,
                username: true,
                email: true,
                last_active_at: true,
                streak: true
              }
            }
          }
        },
      }
    });

    if (!classData) return res.status(404).json({ message: 'Class not found' });

    res.json(classData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUserClasses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Find classes where user is a member (student or admin)
    const memberships = await db.query.classMembers.findMany({
      where: eq(classMembers.user_id, userId),
      with: {
        class: {
          with: {
            owner: {
              columns: {
                username: true
              }
            }
          }
        }
      }
    });

    const userClasses = memberships.map(m => ({
      ...m.class,
      role: m.role,
      joined_at: m.joined_at
    }));

    res.json(userClasses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
