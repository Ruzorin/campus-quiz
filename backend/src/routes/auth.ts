import { Router } from 'express';
import { microsoftLogin, microsoftCallback } from '../controllers/authController';

export const authRoutes = Router();

authRoutes.get('/microsoft', microsoftLogin);
authRoutes.get('/microsoft/callback', microsoftCallback);
