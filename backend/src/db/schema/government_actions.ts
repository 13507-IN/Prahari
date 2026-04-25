import { pgTable, uuid, timestamp, pgEnum, text } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { reports } from './reports.js';

export const actionTypeEnum = pgEnum('action_type', ['accept', 'in_progress', 'completed']);

export const governmentActions = pgTable('government_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id).notNull(),
  department: text('department').notNull(),
  actionType: actionTypeEnum('action_type').notNull(),
  proofImageUrl: text('proof_image_url'),
  remarks: text('remarks'),
  performedBy: uuid('performed_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type GovernmentAction = typeof governmentActions.$inferSelect;
export type NewGovernmentAction = typeof governmentActions.$inferInsert;