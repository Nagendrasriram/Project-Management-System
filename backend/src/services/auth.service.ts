import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput, AuthSuccessResponse, UserResponse } from '@project-mgmt/shared';
import { logAuditEvent } from './audit.service';

const BCRYPT_ROUNDS = 12;

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthSuccessResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Email address is already in use');
    }

    // Hash password with bcrypt cost 12
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        tokenVersion: 0,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, tokenVersion: user.tokenVersion },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    await logAuditEvent(user.id, 'USER_REGISTERED', 'User', user.id, { email: user.email });

    const userResponse: UserResponse = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      token,
      user: userResponse,
    };
  }

  static async login(input: LoginInput): Promise<AuthSuccessResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, tokenVersion: user.tokenVersion },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    await logAuditEvent(user.id, 'USER_LOGGED_IN', 'User', user.id);

    const userResponse: UserResponse = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      token,
      user: userResponse,
    };
  }

  static async logout(userId: string): Promise<void> {
    // Invalidate tokens by incrementing tokenVersion
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: {
          increment: 1,
        },
      },
    });

    await logAuditEvent(userId, 'USER_LOGGED_OUT', 'User', userId);
  }

  static async getMe(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User profile not found');
    }

    return user;
  }
}
