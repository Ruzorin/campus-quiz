import { db } from '../db';
import { classes, classMembers } from '../db/schema';

async function createTestClass() {
  console.log('Creating Test Class...');

  // Create a class with a known code 'TEST01'
  // Owner ID 1 (Assumed to be the logged in user based on previous seed)
  const result = await db.insert(classes).values({
    name: 'Test Gaming Class 🎮',
    owner_id: 1,
    join_code: 'TEST01'
  }).returning();

  const classId = result[0].id;

  // Add owner as a member (admin role)
  await db.insert(classMembers).values({
    class_id: classId,
    user_id: 1,
    role: 'admin'
  });

  console.log(`✅ Created Class: ${result[0].name}`);
  console.log(`🔑 Code: ${result[0].join_code}`);
}

createTestClass().catch(console.error);
