import { Router } from 'express';
import { checkGameStatus } from '../controllers/gameController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/check/:code', authenticateToken, checkGameStatus);

export const gameRoutes = router;
