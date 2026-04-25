import { pgTable, uuid, timestamp, pgEnum, text } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { reports } from './reports.js';

export const voteEnum = pgEnum('vote', ['approved', 'rejected']);

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  vote: voteEnum('vote').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;