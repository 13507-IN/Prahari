import { z } from 'zod';

export const matchingFiltersSchema = z.object({
  reportId: z.string().uuid(),
  limit: z.coerce.number().min(1).max(50).default(5),
});

export const availableTasksSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export type MatchingFilters = z.infer<typeof matchingFiltersSchema>;
export type AvailableTasksFilters = z.infer<typeof availableTasksSchema>;