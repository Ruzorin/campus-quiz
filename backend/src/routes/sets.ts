import { Router } from 'express';
import { createSet, getSets, getSetById, getSmartReviewSet, searchSets, copySet } from '../controllers/setsController';
import { authenticateToken } from '../middleware/auth';

export const setRoutes = Router();

setRoutes.get('/', authenticateToken, getSets);
setRoutes.post('/', authenticateToken, createSet);
setRoutes.get('/smart-review', authenticateToken, getSmartReviewSet);
setRoutes.get('/search', authenticateToken, searchSets);
setRoutes.get('/:id', authenticateToken, getSetById);
setRoutes.post('/:id/copy', authenticateToken, copySet);
