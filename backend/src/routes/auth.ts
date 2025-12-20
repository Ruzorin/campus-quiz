import { Router } from 'express';
import { microsoftLogin } from '../controllers/authController';

export const authRoutes = Router();

authRoutes.post('/microsoft', microsoftLogin);
