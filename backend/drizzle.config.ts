import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

console.log("DEBUG: Loading drizzle config...");
console.log("DEBUG: DATABASE_URL exists:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) console.log("DEBUG: DATABASE_URL starts with:", process.env.DATABASE_URL.substring(0, 10) + "...");
console.log("DEBUG: TURSO_AUTH_TOKEN exists:", !!process.env.TURSO_AUTH_TOKEN);
if (process.env.TURSO_AUTH_TOKEN) console.log("DEBUG: TURSO_AUTH_TOKEN length:", process.env.TURSO_AUTH_TOKEN.length);

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:game.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
// Force Render Redeploy - Attempt 2
// Force Render Redeploy
