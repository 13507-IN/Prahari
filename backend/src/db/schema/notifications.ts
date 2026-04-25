import { pgTable, uuid, timestamp, pgEnum, text, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const notificationTypeEnum = pgEnum('notification_type', [
  'assignment', 
  'status_update', 
  'verification', 
  'system'
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  type: notificationTypeEnum('type').notNull(),
  readStatus: boolean('read_status').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;