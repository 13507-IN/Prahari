import { pgTable, uuid, varchar, text, timestamp, jsonb, pgEnum, boolean, real } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { geography } from './custom_types.js';

export const urgencyEnum = pgEnum('urgency', ['low', 'medium', 'high']);

export const reportStatusEnum = pgEnum('report_status', [
  'pending', 
  'assigned', 
  'in_progress', 
  'completed', 
  'verified', 
  'closed',
  'reopened'
]);

export const reportCategoryEnum = pgEnum('report_category', [
  'infrastructure',
  'health',
  'environment',
  'safety',
  'education',
  'social',
  'other'
]);

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  category: reportCategoryEnum('category').notNull(),
  urgency: urgencyEnum('urgency').notNull().default('medium'),
  status: reportStatusEnum('status').notNull().default('pending'),
  location: geography('location'),
  address: text('address'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  images: jsonb('images').$type<string[]>().default([]),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  urgencyScore: real('urgency_score').default(0),
  isPriority: boolean('is_priority').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;