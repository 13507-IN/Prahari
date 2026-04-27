import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ['public'],
  // Explicitly list tables to avoid introspecting PostGIS system tables
  tablesFilter: [
    "reports", 
    "users", 
    "notifications", 
    "refresh_tokens", 
    "tasks", 
    "verifications", 
    "government_actions", 
    "audit_logs"
  ],
});