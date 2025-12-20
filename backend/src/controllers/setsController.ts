import { Request, Response } from 'express';
import { db } from '../db';
import { eq, and, lt, like, or, inArray } from 'drizzle-orm';

import { studySets, terms, userProgress } from '../db/schema';
import { z } from 'zod';

const createSetSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  is_public: z.boolean().optional(),
  terms: z.array(z.object({
    term: z.string().min(1),
    definition: z.string().min(1),
    image_url: z.string().optional(),
  })).min(1),
});

export const createSet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const data = createSetSchema.parse(req.body);

    const [result] = await db.insert(studySets).values({
      owner_id: userId,
      title: data.title,
      description: data.description || null,
      is_public: data.is_public || false,
    });

    const setId = (result as any).insertId;

    if (data.terms.length > 0) {
      await db.insert(terms).values(
        data.terms.map(t => ({
          set_id: setId,
          term: t.term,
          definition: t.definition,
          image_url: t.image_url || null,
        }))
      );
    }

    res.status(201).json({ message: 'Set created', setId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: (error as any).errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

export const getSets = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const sets = await db.query.studySets.findMany({
      where: eq(studySets.owner_id, userId),
      with: {
        terms: true,
      }
    });

    res.json(sets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getSetById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const set = await db.query.studySets.findFirst({
      where: eq(studySets.id, id),
      with: {
        terms: true,
        owner: true,
      }
    });

    if (!set) return res.status(404).json({ message: 'Set not found' });

    res.json(set);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const searchSets = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query) return res.status(400).json({ message: 'Query is required' });

    const results = await db.query.studySets.findMany({
      where: and(
        eq(studySets.is_public, true),
        or(
          like(studySets.title, `%${query}%`),
          like(studySets.description, `%${query}%`)
        )
      ),
      with: {
        owner: {
          columns: { username: true }
        },
        terms: true
      },
      limit: 20
    });

    const mappedResults = results.map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      author: s.owner?.username || 'Unknown',
      term_count: s.terms.length,
      created_at: s.created_at
    }));

    res.json(mappedResults);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const copySet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const originalSetId = parseInt(req.params.id);
    if (isNaN(originalSetId)) return res.status(400).json({ message: 'Invalid ID' });

    const originalSet = await db.query.studySets.findFirst({
      where: eq(studySets.id, originalSetId),
      with: { terms: true }
    });

    if (!originalSet) return res.status(404).json({ message: 'Set not found' });
    if (!originalSet.is_public && originalSet.owner_id !== userId) {
      return res.status(403).json({ message: 'Cannot copy private set' });
    }

    const [result] = await db.insert(studySets).values({
      owner_id: userId,
      title: `${originalSet.title} (Copy)`,
      description: originalSet.description,
      is_public: false
    });

    const newSetId = (result as any).insertId;

    if (originalSet.terms.length > 0) {
      await db.insert(terms).values(
        originalSet.terms.map((t: any) => ({
          set_id: newSetId,
          term: t.term,
          definition: t.definition,
          image_url: t.image_url
        }))
      );
    }

    res.status(201).json({ message: 'Set cloned successfully', setId: newSetId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getSmartReviewSet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const weakProgress = await db.query.userProgress.findMany({
      where: and(
        eq(userProgress.user_id, userId),
        lt(userProgress.mastery_level, 5)
      ),
      limit: 20
    });

    if (weakProgress.length === 0) {
      return res.json({ terms: [] });
    }

    const termsIds = weakProgress.map(p => p.term_id);

    const weakTerms = await db.query.terms.findMany({
      where: inArray(terms.id, termsIds)
    });

    res.json({ terms: weakTerms });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
