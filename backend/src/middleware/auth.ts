import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Rate limiter for auth routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for API routes
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
