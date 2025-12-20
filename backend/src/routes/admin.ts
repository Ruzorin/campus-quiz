import { Router } from 'express';
import { triggerSeed } from '../controllers/adminController';

const router = Router();

router.get('/seed', triggerSeed);

export default router;
