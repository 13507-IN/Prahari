import { type Response } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import * as matchingService from './service.js';
import type { MatchingFilters, AvailableTasksFilters } from './schemas.js';

export async function getRecommendedVolunteers(req: AuthenticatedRequest, res: Response) {
  const { reportId, limit } = req.query as unknown as MatchingFilters;
  
  const volunteers = await matchingService.getRecommendedVolunteers(reportId, limit);
  
  res.json({
    success: true,
    data: volunteers.map(v => ({
      user: v.user,
      score: v.score,
      distance: v.distance,
      skillMatch: v.skillMatch,
    })),
  });
}

export async function getAvailableTasks(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const query = req.query as unknown as AvailableTasksFilters;
  
  const result = await matchingService.getAvailableTasks(userId, query.page, query.limit);
  
  res.json({
    success: true,
    data: result.data,
    pagination: {
      page: query.page || 1,
      limit: query.limit || 10,
      total: result.total,
      totalPages: Math.ceil(result.total / (query.limit || 10)),
    },
  });
}