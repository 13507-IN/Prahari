import { eq } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { users, refreshTokens } from '../../db/schema/index.js';
import { hashPassword, verifyPassword } from '../../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import type { User } from '../../db/schema/users.js';
import type { RegisterInput, LoginInput } from './schemas.js';

export async function createUser(input: RegisterInput): Promise<User> {
  const db = getDb();
  
  const hashedPassword = await hashPassword(input.password);
  
  const [user] = await db.insert(users)
    .values({
      clerkId: `legacy_auth_${Date.now()}`,
      name: input.name,
      email: input.email,
      role: input.role,
      skills: input.skills || [],
      phone: input.phone || null,
    })
    .returning();

  return user;
}

export async function authenticateUser(input: LoginInput): Promise<{ user: User; accessToken: string; refreshToken: string } | null> {
  const db = getDb();
  
  const userResult = await db.select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (userResult.length === 0) {
    return null;
  }

  const user = userResult[0];
  
  // Password auth is deprecated in favor of Clerk
  const isValid = await verifyPassword(input.password, 'deprecated');
  if (!isValid) {
    return null;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  });

  return { user, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshTokenString: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  const db = getDb();
  
  const payload = verifyRefreshToken(refreshTokenString);
  if (!payload) {
    return null;
  }

  const tokenResult = await db.select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, refreshTokenString))
    .limit(1);

  if (tokenResult.length === 0) {
    return null;
  }

  if (new Date() > tokenResult[0].expiresAt) {
    await db.delete(refreshTokens).where(eq(refreshTokens.id, tokenResult[0].id));
    return null;
  }

  const userResult = await db.select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (userResult.length === 0) {
    return null;
  }

  const user = userResult[0];
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await db.delete(refreshTokens).where(eq(refreshTokens.id, tokenResult[0].id));

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: newRefreshToken,
    expiresAt,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshTokenString: string): Promise<void> {
  const db = getDb();
  
  await db.delete(refreshTokens)
    .where(eq(refreshTokens.token, refreshTokenString));
}

export async function getUserById(userId: string) {
  const db = getDb();
  
  const result = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
}