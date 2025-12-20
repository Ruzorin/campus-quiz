import { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';

// Simple in-memory session or basic logic for now since we don't have full JWT setup requested explicitly yet,
// but the plan mentioned "Custom JWT/Session". I'll implement a basic structure.

// ... imports

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const REDIRECT_URI = process.env.BACKEND_URL
  ? `${process.env.BACKEND_URL}/api/auth/microsoft/callback`
  : 'http://localhost:3000/api/auth/microsoft/callback';

export const microsoftLogin = (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID || '',
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'user.read openid profile email',
    response_mode: 'query'
  });

  res.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`);
};

export const microsoftCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    // 1. Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID || '',
      scope: 'user.read openid profile email',
      code: code as string,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      client_secret: MICROSOFT_CLIENT_SECRET || '',
    });

    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Token Error:', errText);
      throw new Error('Failed to fetch access token');
    }

    const { access_token } = await tokenResponse.json() as any;

    // 2. Get User Profile
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!profileResponse.ok) throw new Error('Failed to fetch user profile');
    const profile = await profileResponse.json() as any;

    // 3. Find or Create User
    const email = profile.userPrincipalName || profile.mail; // Microsoft usually uses userPrincipalName or mail

    // Check if user exists by microsoft_id OR email (linking accounts)
    const existingUsers = await db.select().from(users).where(
      or(
        eq(users.microsoft_id, profile.id),
        eq(users.email, email)
      )
    ).limit(1);

    let user = existingUsers[0];

    if (!user) {
      // Create new user
      const result = await db.insert(users).values({
        email: email,
        username: profile.displayName || email.split('@')[0],
        password_hash: 'microsoft_sso', // Dummy
        microsoft_id: profile.id,
        avatar_url: null // We could fetch photo if needed but requires more scopes
      }).returning();
      user = result[0];
    } else {
      // Update microsoft_id if missing (linking legacy account)
      if (!user.microsoft_id) {
        await db.update(users)
          .set({ microsoft_id: profile.id })
          .where(eq(users.id, user.id));
      }
    }

    // 4. Generate Session/JWT
    // Reusing the simple token logic from before, but ideally this should be a real signed JWT
    // For now, consistent with existing 'mock_jwt_token_' logic or if you have a real JWT generator use it.
    // Checking previous code... it used 'mock_jwt_token_' + user.id. 
    // We should probably redirect to frontend with this token.

    // Assuming Frontend URL is VITE_API_URL's origin or localhost:5173
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // const token = generateJwt(user.id); // If we had real JWT
    const token = 'mock_jwt_token_' + user.id; // Using existing mock scheme for consistency unless changed

    res.redirect(`${frontendUrl}/login?token=${token}&username=${encodeURIComponent(user.username)}`);

  } catch (error) {
    console.error('Microsoft Login Error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
  }
};

