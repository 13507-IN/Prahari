import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { geography } from './custom_types.js';

export const userRoleEnum = pgEnum('user_role', ['ngo', 'volunteer', 'govt', 'admin']);

export interface LocationData {
  area: string;
  city: string;
  country: string;
  pincode: string;
}

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Clerk ID should be required
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),

  name: varchar('name', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),

  email: varchar('email', { length: 255 }).notNull().unique(),

  role: userRoleEnum('role').notNull().default('volunteer'),

  skills: jsonb('skills').$type<string[]>().default([]),

  location: geography('location'),
  locationData: jsonb('location_data').$type<LocationData>(),

  phone: varchar('phone', { length: 20 }),
  avatarUrl: text('avatar_url'),

  isActive: boolean('is_active').notNull().default(true),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;