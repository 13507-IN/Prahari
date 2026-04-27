import { eq } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { users } from '../../db/schema/index.js';
import type { User } from '../../db/schema/users.js';
import type { UpdateProfileInput } from './schemas.js';
import type { ProfileSetupInput } from '../auth/schemas.js';

export async function getUserById(userId: string): Promise<User | null> {
  const db = getDb();
  
  const result = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const db = getDb();
  
  const result = await db.select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return result[0] || null;
}

export async function createOrUpdateClerkUser(input: ProfileSetupInput): Promise<User> {
  const db = getDb();
  
  // Check if user already exists
  const existingUser = await getUserByClerkId(input.clerkId);
  
  if (existingUser) {
    // Update existing user
    const [updated] = await db.update(users)
      .set({
        firstName: input.firstName,
        lastName: input.lastName,
        name: `${input.firstName} ${input.lastName}`,
        role: input.role,
        locationData: input.location,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, input.clerkId))
      .returning();
    
    return updated;
  }
  
  // Create new user
  const [created] = await db.insert(users)
    .values({
      clerkId: input.clerkId,
      firstName: input.firstName,
      lastName: input.lastName,
      name: `${input.firstName} ${input.lastName}`,
      email: input.email,
      role: input.role,
      locationData: input.location,
    })
    .returning();
  
  return created;
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<User | null> {
  const db = getDb();
  
  const [updated] = await db.update(users)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated || null;
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const db = getDb();
  
  return db.select()
    .from(users)
    .where(eq(users.role, role as 'ngo' | 'volunteer' | 'govt' | 'admin'));
}

export async function getAllUsers(): Promise<User[]> {
  const db = getDb();
  
  return db.select()
    .from(users)
    .where(eq(users.isActive, true));
}