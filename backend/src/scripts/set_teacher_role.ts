import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Updating users to TEACHER role...');

  // Update ID 1 (Admin/Seed user)
  await db.update(users)
    .set({ role: 'teacher' })
    .where(eq(users.id, 1));

  // Also update any user with username 'batin' just in case
  await db.update(users)
    .set({ role: 'teacher' })
    .where(eq(users.username, 'batin'));

  // Update ALL users just to be sure for this dev environment?
  // Let's just update all of them for now since it is a local dev env.
  await db.update(users).set({ role: 'teacher' });

  console.log('✅ All users are now Teachers!');
}

main().catch(console.error);
