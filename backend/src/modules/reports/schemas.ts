import { z } from 'zod';

export const createReportSchema = z.object({
  title: z.string().min(5).max(500),
  description: z.string().min(10),
  category: z.enum(['infrastructure', 'health', 'environment', 'safety', 'education', 'social', 'other']),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  location: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

export const updateReportSchema = z.object({
  title: z.string().min(5).max(500).optional(),
  description: z.string().min(10).optional(),
  category: z.enum(['infrastructure', 'health', 'environment', 'safety', 'education', 'social', 'other']).optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'verified', 'closed', 'reopened']).optional(),
});

export const reportFiltersSchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'verified', 'closed', 'reopened']).optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  category: z.enum(['infrastructure', 'health', 'environment', 'safety', 'education', 'social', 'other']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().default(10),
});

export const reportIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type ReportFilters = z.infer<typeof reportFiltersSchema>;