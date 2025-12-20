import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Mock token verification: "mock_jwt_token_{userId}"
  if (token.startsWith('mock_jwt_token_')) {
    const userId = parseInt(token.replace('mock_jwt_token_', ''), 10);
    if (!isNaN(userId)) {
      req.user = { id: userId };
      return next();
    }
  }

  return res.status(403).json({ message: 'Invalid or expired token' });
};
