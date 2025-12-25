import { Request, Response, NextFunction } from 'express';

export const requireTeacher = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.role !== 'teacher' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Teachers only' });
  }

  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }

  next();
};
