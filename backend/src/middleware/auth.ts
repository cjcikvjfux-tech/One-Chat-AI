import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (typeof decoded !== 'object' || !('id' in decoded)) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = { id: decoded.id as string, email: decoded.email as string };
    next();
  } catch (error) {
    logger.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}