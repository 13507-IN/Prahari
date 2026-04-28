import { type Request, type Response, type NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
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
      const verifiedToken = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      clerkUserId = verifiedToken.sub;
    } catch (err) {
      console.error('Clerk verifyToken error:', err);
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

    let user;
    if (userResult.length === 0) {
      try {
        // User exists in Clerk but not in our DB yet.
        // Automatically sync them to the database now.
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || '';
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User';

        const newUserResult = await db.insert(users).values({
          clerkId: clerkUserId,
          email,
          name,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          role: 'volunteer',
        }).returning();
        
        user = newUserResult[0];
      } catch (syncErr) {
        console.error('Failed to auto-sync user:', syncErr);
        // Fallback to allow profile-setup to work if DB insert fails
        (req as AuthenticatedRequest).user = {
          userId: clerkUserId,
          email: '',
          role: 'volunteer',
        };
        return next();
      }
    } else {
      user = userResult[0];
    }
    
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