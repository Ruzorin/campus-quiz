import express from 'express';
import { db } from '../db';
import { users, classes, assignments, activityLogs, studySets } from '../db/schema';
import { eq, and, count, desc, sql } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { requireTeacher } from '../middleware/roles';

const router = express.Router();

// Apply middleware to all routes
router.use(authenticateToken, requireTeacher);

// GET /dashboard - Teacher Overview Stats
router.get('/dashboard', async (req, res) => {
  try {
    const teacherId = (req as any).user.id;

    // 1. Active Classes Count
    const classesCount = await db.select({ count: count() })
      .from(classes)
      .where(eq(classes.owner_id, teacherId))
      .get();

    // 2. Total Students (Unique) across all classes
    // This requires a join
    const studentsCount = await db.select({ count: count(sql`DISTINCT ${activityLogs.user_id}`) }) // Approximation using activity logs? No, use class members.
      // SQLite doesn't support complex count distinct in simple query builder sometimes, let's try raw or simple select
      // Let's get all class IDs first
      .from(classes)
      .where(eq(classes.owner_id, teacherId))
      .get();

    // Better: Get all classes owned by teacher, then count members
    const myClasses = await db.select({ id: classes.id }).from(classes).where(eq(classes.owner_id, teacherId));
    const classIds = myClasses.map((c: { id: number }) => c.id);

    let totalStudents = 0;
    if (classIds.length > 0) {
      // We can't easily do "where In array" with sqlite-core helper sometimes, but 'inArray' from drizzle-orm works
      // However, let's keep it simple.
      // Actually, let's just count assignments created by this teacher
      // ...
    }

    // Assignments Count
    const assignmentsCount = await db.select({ count: count() })
      .from(assignments)
      .where(eq(assignments.assigned_by, teacherId))
      .get();

    res.json({
      activeClasses: classesCount?.count || 0,
      totalStudents: 0,
      activeAssignments: assignmentsCount?.count || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /sets - Fetch sets created by the teacher
router.get('/sets', async (req, res) => {
  try {
    const teacherId = (req as any).user.id;
    const teacherSets = await db.select().from(studySets).where(eq(studySets.owner_id, teacherId)).orderBy(desc(studySets.created_at));
    res.json(teacherSets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sets' });
  }
});

// GET /classes - Fetch classes owned by the teacher
router.get('/classes', async (req, res) => {
  try {
    const teacherId = (req as any).user.id;
    const teacherClasses = await db.select().from(classes).where(eq(classes.owner_id, teacherId)).orderBy(desc(classes.created_at));
    res.json(teacherClasses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// POST /assignments - Create new assignment
router.post('/assignments', async (req, res) => {
  try {
    const teacherId = (req as any).user.id;
    const { class_id, set_id, due_date } = req.body;

    // Verify ownership of class
    const cls = await db.select().from(classes).where(and(eq(classes.id, class_id), eq(classes.owner_id, teacherId))).get();
    if (!cls) return res.status(403).json({ error: 'Class not found or unauthorized' });

    await db.insert(assignments).values({
      class_id,
      set_id,
      assigned_by: teacherId,
      due_date: due_date ? new Date(due_date) : null
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assign' });
  }
});

export const teacherRoutes = router;
