import { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Simple in-memory session or basic logic for now since we don't have full JWT setup requested explicitly yet,
// but the plan mentioned "Custom JWT/Session". I'll implement a basic structure.

// ... imports

const microsoftLoginSchema = z.object({
  email: z.string().email().refine(val => val.endsWith('@emu.edu.tr'), "Invalid domain"),
  name: z.string(),
});

export const microsoftLogin = async (req: Request, res: Response) => {
  try {
    const { email, name } = microsoftLoginSchema.parse(req.body);

    let user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Create new user
      // No password needed for SSO users
      // Store dummy hash or make column nullable (need scheme update for nullable, sticking to dummy for now) 
      const password_hash = "sso_managed_account";

      await db.insert(users).values({
        email,
        username: name, // Name from Microsoft Profile
        password_hash,
      });

      user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
    }

    if (!user) throw new Error("Failed to create user");

    // Return session token
    res.json({
      message: 'Login successful',
      token: 'mock_jwt_token_' + user.id,
      user
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: (error as z.ZodError).errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

