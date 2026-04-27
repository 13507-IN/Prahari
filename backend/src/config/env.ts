import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  DATABASE_URL: z.string(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().optional(),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  
  // Clerk authentication
  CLERK_SECRET_KEY: z.string(),

  // Legacy JWT (optional, kept for backward compatibility)
  JWT_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  MAX_FILE_SIZE: z.coerce.number().default(10485760),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp,image/gif'),
  
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  CORS_ORIGIN: z.string().default('http://localhost:3001,http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function initConfig() {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    process.exit(1);
  }
  
  env = result.data;
  return env;
}

export function getConfig(): Env {
  if (!env) {
    return initConfig();
  }
  return env;
}

export const config = {
  get: getConfig,
};
