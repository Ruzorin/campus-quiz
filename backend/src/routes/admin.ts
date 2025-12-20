import { Router } from 'express';
import { triggerSeed } from '../controllers/adminController';

const router = Router();

router.post('/seed', triggerSeed);

export default router;
