import { pgTable, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { reports } from './reports.js';

export const taskStatusEnum = pgEnum('task_status', [
  'pending', 
  'assigned', 
  'in_progress', 
  'completed', 
  'verified', 
  'closed'
]);

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id).notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id).notNull(),
  status: taskStatusEnum('status').notNull().default('pending'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;