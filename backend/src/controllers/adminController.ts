import { Request, Response } from 'express';
import { db } from '../db';
import { studySets, terms, users } from '../db/schema';
import { vocabularySets } from '../db/data';
import { eq } from 'drizzle-orm';

export const triggerSeed = async (req: Request, res: Response) => {
  const secret = req.query.secret;
  if (secret !== 'batin_admin_secret_123') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    console.log('🌱 Starting Seed via API...');

    // 0. RESET DATABASE (Clear all existing data)
    console.log('⚠️ Clearing existing data...');
    try {
      await db.delete(terms);
      await db.delete(studySets);
    } catch (e) {
      console.log("Delete error (might be empty):", e);
    }

    // 1. Ensure we have a default user
    let adminUser = await db.select().from(users).where(eq(users.email, 'batuhan.ogrenci@emu.edu.tr')).get();

    if (!adminUser) {
      // Fallback to the user requesting if possible, or create default
      // Try to find ANY user to attach sets to if default doesn't exist
      const anyUser = await db.select().from(users).limit(1).get();
      if (anyUser) {
        adminUser = anyUser;
      } else {
        console.log('Creating Admin User...');
        const result = await db.insert(users).values({
          email: 'batuhan.ogrenci@emu.edu.tr',
          password_hash: 'mock_hash',
          username: 'Batuhan Öğrenci',
          firstName: 'Batuhan',
          lastName: 'Öğrenci'
        }).returning();
        adminUser = result[0];
      }
    }

    const userId = adminUser.id;
    console.log(`Using User ID: ${userId}`);

    // Combine ALL terms for "Mix - 10 Units"
    const allTerms = vocabularySets.flatMap(set => set.terms.map(t => ({ ...t, origin: set.title })));

    // Insert "MIX - ALL UNITS" Set First
    console.log('Inserting Mixed Set (All Units)...');
    const mixSetResult = await db.insert(studySets).values({
      owner_id: userId,
      title: '🔥 MIX - ALL UNITS (1-10)',
      description: 'A challenge set containing words from all 10 units!',
      is_public: true
    }).returning();

    const mixSetId = mixSetResult[0].id;

    // Batch insert all terms for mix set
    if (allTerms.length > 0) {
      await db.insert(terms).values(allTerms.map(t => ({
        set_id: mixSetId,
        term: t.term,
        definition: t.definition
      })));
    }

    // 2. Insert Individual Sets
    let insertedCount = 0;
    for (const set of vocabularySets) {
      console.log(`Inserting Set: ${set.title}`);

      // Create Set
      const setResult = await db.insert(studySets).values({
        owner_id: userId,
        title: set.title,
        description: set.description,
        is_public: true
      }).returning();

      const setId = setResult[0].id;
      insertedCount++;

      // Create Terms
      const termsToInsert = set.terms.map(t => ({
        set_id: setId,
        term: t.term,
        definition: t.definition
      }));

      if (termsToInsert.length > 0) {
        await db.insert(terms).values(termsToInsert);
      }
    }

    res.json({ message: 'Seed complete', setsCreated: insertedCount + 1 });

  } catch (error: any) {
    console.error('Seed Error:', error);
    res.status(500).json({ message: 'Seed failed', error: error.message });
  }
};
