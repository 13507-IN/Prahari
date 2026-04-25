import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['ngo', 'volunteer', 'govt', 'admin']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('volunteer'),
  skills: jsonb('skills').$type<string[]>().default([]),
  location: varchar('location', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;