import { Router } from 'express';
import { createClass, joinClass, getClassDetails, getUserClasses, getAssignments, createAssignment, getAssignmentReport } from '../controllers/classesController';
import { authenticateToken } from '../middleware/auth';

export const classRoutes = Router();

classRoutes.get('/', authenticateToken, getUserClasses);
classRoutes.post('/', authenticateToken, createClass);
classRoutes.post('/join', authenticateToken, joinClass);
classRoutes.get('/:id', authenticateToken, getClassDetails);
classRoutes.get('/:id/assignments', authenticateToken, getAssignments);
classRoutes.post('/:id/assignments', authenticateToken, createAssignment);
classRoutes.get('/:classId/assignments/:assignmentId/report', authenticateToken, getAssignmentReport);
