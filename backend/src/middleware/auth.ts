import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { AppError } from './errorHandler';

export interface JwtPayload {
  userId: string;
  email: string;
  tokenVersion: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        fullName: string;
        tokenVersion: number;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token required');
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError(401, 'TOKEN_EXPIRED', 'Your session has expired. Please log in again.');
      }
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not found or account removed');
    }

    // Verify tokenVersion matches to invalidate logged out tokens
    if (user.tokenVersion !== payload.tokenVersion) {
      throw new AppError(401, 'TOKEN_REVOKED', 'Session has been invalidated. Please log in again.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
