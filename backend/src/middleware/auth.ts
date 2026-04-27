import { type Request, type Response, type NextFunction } from 'express';
import { createClerkClient } from '@clerk/backend';
import type { AuthenticatedRequest } from '../types/index.js';
import { getDb } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    // Verify Clerk JWT token
    let clerkUserId: string;
    try {
      const verifiedToken = await clerkClient.verifyToken(token);
      clerkUserId = verifiedToken.sub;
    } catch {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Look up user by clerkId in our database
    const db = getDb();
    const userResult = await db.select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (userResult.length === 0) {
      // User exists in Clerk but not in our DB yet — return minimal info
      // This allows profile-setup to work
      (req as AuthenticatedRequest).user = {
        userId: clerkUserId, // Use clerkId as userId temporarily
        email: '',
        role: 'volunteer',
      };
      return next();
    }

    const user = userResult[0];
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is disabled',
      });
    }

    (req as AuthenticatedRequest).user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}