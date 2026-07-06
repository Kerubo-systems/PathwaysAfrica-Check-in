import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

export const JWT_SECRET = process.env.JWT_SECRET || 'pathways-secret-key-2026-super-secure';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'General Administrator' | 'Cohort Administrator';
  cohortAccess: string; // 'all' or specific cohort name e.g. 'Cohort 1'
  createdAt?: string;
  isDisabled?: boolean;
}

// Generates a secure JWT token with indefinite expiration
export function generateToken(user: Omit<AdminUser, 'passwordHash'>): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cohortAccess: user.cohortAccess,
    },
    JWT_SECRET
  );
}

// Middleware to protect admin routes
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'General Administrator' | 'Cohort Administrator';
    cohortAccess: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization required. Access token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired authorization token.' });
  }
}

// Hash password helper
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password helper
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  // Gracefully handle plaintext passwords during seeding or legacy migration
  if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$')) {
    return password === hash;
  }
  return bcrypt.compare(password, hash);
}
