import jwt from 'jsonwebtoken';
import { getConfig } from '../config/index.js';
import type { User } from '../db/schema/users.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshPayload {
  userId: string;
  tokenVersion: number;
}

export function generateAccessToken(user: User): string {
  const config = getConfig();
  
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.JWT_SECRET!, {
    expiresIn: config.JWT_EXPIRY as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(user: User, tokenVersion: number = 1): string {
  const config = getConfig();
  
  const payload: RefreshPayload = {
    userId: user.id,
    tokenVersion,
  };

  return jwt.sign(payload, config.JWT_REFRESH_SECRET!, {
    expiresIn: config.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  const config = getConfig();
  
  try {
    return jwt.verify(token, config.JWT_SECRET!) as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshPayload | null {
  const config = getConfig();
  
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET!) as unknown as RefreshPayload;
  } catch {
    return null;
  }
}