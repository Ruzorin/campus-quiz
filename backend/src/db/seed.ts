import { db } from '../db';
import { users, studySets, terms } from '../db/schema';
import { vocabularySets } from '../db/data';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting Seed...');

  // 0. RESET DATABASE (Clear all existing data)
  console.log('⚠️ Clearing existing data...');
  await db.delete(terms);
  await db.delete(studySets);
  // Optional: Delete users if you want a complete hard reset, but usually we keep the admin user
  // await db.delete(users); 

  // 1. Ensure we have a default user (The Mock User)
  let adminUser = await db.select().from(users).where(eq(users.email, 'batuhan.ogrenci@emu.edu.tr')).get();
  // ...

  if (!adminUser) {
    console.log('Creating Admin User...');
    const result = await db.insert(users).values({
      email: 'batuhan.ogrenci@emu.edu.tr',
      password_hash: 'mock_hash',
      username: 'Batuhan Öğrenci'
    }).returning();
    adminUser = result[0];
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

  // Batch insert all terms for mix set (might be large, splitting if necessary but SQLite handles thousands ok)
  await db.insert(terms).values(allTerms.map(t => ({
    set_id: mixSetId,
    term: t.term,
    definition: t.definition
  })));

  // 2. Insert Individual Sets
  for (const set of vocabularySets) {
    console.log(`Inserting Set: ${set.title}`);

    // Create Set
    const setResult = await db.insert(studySets).values({
      owner_id: userId,
      title: set.title,
      description: set.description,
      is_public: true // SQLite boolean mode (1)
    }).returning();

    const setId = setResult[0].id;

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

  console.log('✅ Seeding Complete!');
}

seed().catch(console.error);
