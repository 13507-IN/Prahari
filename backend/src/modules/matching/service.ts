import { eq, and, or, sql } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { users, reports } from '../../db/schema/index.js';
import type { User } from '../../db/schema/users.js';
import type { Report } from '../../db/schema/reports.js';
import { parseLocation, calculateDistance } from '../../utils/geo.js';

interface MatchScore {
  user: User;
  score: number;
  distance: number;
  skillMatch: boolean;
}

interface ScoredReport extends Report {
  matchScore?: number;
}

const MAX_DISTANCE_KM = 50;

function calculateMatchScore(volunteer: User, report: Report): MatchScore {
  let distance = Infinity;
  let skillMatch = false;

  if (volunteer.location && report.location) {
    try {
      const volunteerPoint = parseLocation(volunteer.location);
      const reportPoint = parseLocation(report.location);
      distance = calculateDistance(volunteerPoint, reportPoint);
    } catch {
      distance = Infinity;
    }
  }

  if (volunteer.skills && report.category) {
    skillMatch = volunteer.skills.includes(report.category);
  }

  const distanceScore = distance === Infinity ? 0 : Math.max(0, 1 - distance / MAX_DISTANCE_KM);
  const skillScore = skillMatch ? 1 : 0;
  const AVAILABILITY_WEIGHT = 0.2;
  const DISTANCE_WEIGHT = 0.4;
  const SKILL_WEIGHT = 0.4;

  const score =
    skillScore * SKILL_WEIGHT +
    distanceScore * DISTANCE_WEIGHT +
    AVAILABILITY_WEIGHT;

  return {
    user: volunteer,
    score,
    distance: distance === Infinity ? -1 : distance,
    skillMatch,
  };
}

export async function getRecommendedVolunteers(
  reportId: string,
  limit: number = 5
): Promise<MatchScore[]> {
  const db = getDb();
  
  const reportResult = await db.select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);

  if (reportResult.length === 0) {
    return [];
  }

  const report = reportResult[0];

  const volunteersResult = await db.select()
    .from(users)
    .where(and(
      eq(users.role, 'volunteer'),
      eq(users.isActive, true)
    ));

  const scoredVolunteers = volunteersResult.map(volunteer => {
    return calculateMatchScore(volunteer, report);
  });

  scoredVolunteers.sort((a, b) => b.score - a.score);

  return scoredVolunteers.slice(0, limit);
}

export async function getAvailableTasks(
  volunteerId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: ScoredReport[]; total: number }> {
  const db = getDb();
  
  const volunteerResult = await db.select()
    .from(users)
    .where(eq(users.id, volunteerId))
    .limit(1);

  if (volunteerResult.length === 0) {
    return { data: [], total: 0 };
  }

  const volunteer = volunteerResult[0];

  const allReports = await db.select()
    .from(reports)
    .where(or(
      eq(reports.status, 'pending'),
      eq(reports.status, 'assigned')
    ));

  const scoredReports: ScoredReport[] = allReports.map(report => {
    const match = calculateMatchScore(volunteer, report);
    return { ...report, matchScore: match.score };
  });

  scoredReports.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  const offset = (page - 1) * limit;
  const data = scoredReports.slice(offset, offset + limit);
  const total = scoredReports.length;

  return { data, total };
}