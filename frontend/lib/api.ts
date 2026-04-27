/**
 * API client for CommunitySync backend.
 * Uses Clerk session tokens for authentication.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type AppUserRole = "ngo" | "volunteer" | "govt" | "admin";

export interface AppUser {
  id: string;
  clerkId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: AppUserRole;
  skills?: string[];
  location?: string;
  locationData?: {
    area: string;
    city: string;
    country: string;
    pincode: string;
  };
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface CreateReportPayload {
  title: string;
  description: string;
  category:
    | "infrastructure"
    | "health"
    | "environment"
    | "safety"
    | "education"
    | "social"
    | "other";
  urgency: "low" | "medium" | "high";
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  createdBy: string;
  assignedTo?: string;
  urgencyScore?: number;
  isPriority: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  reportId: string;
  assignedTo: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GovernmentAction {
  id: string;
  reportId: string;
  department: string;
  actionType: string;
  proofImageUrl?: string;
  remarks?: string;
  performedBy: string;
  createdAt: string;
}

export interface Verification {
  id: string;
  reportId: string;
  userId: string;
  vote: "approved" | "rejected";
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string;
  readStatus: boolean;
  createdAt: string;
}

export interface ProfileSetupPayload {
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AppUserRole;
  location: {
    area: string;
    city: string;
    country: string;
    pincode: string;
  };
}

// ─── Token Management ────────────────────────────────────────────────────────

// This will be set by the auth provider with Clerk's getToken function
let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

async function getAuthToken(): Promise<string | null> {
  if (_getToken) {
    return _getToken();
  }
  return null;
}

// ─── Base Request ────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  init: RequestInit = {},
  requireAuth: boolean = true,
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (requireAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || payload?.message || `Request failed (${response.status})`);
  }

  return payload;
}

// ─── Profile Setup (no auth header needed — public endpoint) ─────────────────

export async function setupProfile(input: ProfileSetupPayload) {
  return request<AppUser>("/users/profile-setup", {
    method: "POST",
    body: JSON.stringify(input),
  }, false);
}

// ─── User APIs ───────────────────────────────────────────────────────────────

export async function getProfile() {
  return request<AppUser>("/users/profile");
}

export async function updateProfile(input: Partial<AppUser>) {
  return request<AppUser>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function getAllUsers() {
  return request<AppUser[]>("/users");
}

export async function getGovtUsers() {
  return request<AppUser[]>("/users/govt");
}

export async function getNgoUsers() {
  return request<AppUser[]>("/users/ngos");
}

// ─── Report APIs ─────────────────────────────────────────────────────────────

export async function createReport(input: CreateReportPayload) {
  return request<Report>("/reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getReports(params?: {
  status?: string;
  urgency?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.urgency) searchParams.set("urgency", params.urgency);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return request<Report[]>(`/reports${query ? `?${query}` : ""}`, {}, false);
}

export async function getReportById(id: string) {
  return request<Report>(`/reports/${id}`, {}, false);
}

export async function updateReport(id: string, input: Partial<Report>) {
  return request<Report>(`/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteReport(id: string) {
  return request<void>(`/reports/${id}`, {
    method: "DELETE",
  });
}

export async function getNearbyReports(lat: number, lng: number, radius?: number) {
  const searchParams = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });
  if (radius) searchParams.set("radius", String(radius));

  return request<Report[]>(`/reports/nearby?${searchParams.toString()}`, {}, false);
}

// ─── Task APIs ───────────────────────────────────────────────────────────────

export async function assignTask(reportId: string, volunteerId: string) {
  return request<Task>("/tasks/assign", {
    method: "POST",
    body: JSON.stringify({ reportId, volunteerId }),
  });
}

export async function getMyTasks(params?: { status?: string; page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return request<Task[]>(`/tasks/user${query ? `?${query}` : ""}`);
}

export async function getTaskById(id: string) {
  return request<Task>(`/tasks/${id}`);
}

export async function updateTaskStatus(id: string, status: string) {
  return request<Task>(`/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─── Government APIs ─────────────────────────────────────────────────────────

export async function createGovernmentAction(input: {
  reportId: string;
  department: string;
  actionType: "accept" | "in_progress" | "completed";
  proofImageUrl?: string;
  remarks?: string;
}) {
  return request<GovernmentAction>("/gov/action", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getReportActions(reportId: string) {
  return request<GovernmentAction[]>(`/gov/report/${reportId}`);
}

export async function updateReportStatus(reportId: string, status: string) {
  return request<Report>(`/gov/report/${reportId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─── Verification APIs ───────────────────────────────────────────────────────

export async function submitVerification(input: {
  reportId: string;
  vote: "approved" | "rejected";
  comment?: string;
}) {
  return request<Verification>("/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getReportVerifications(reportId: string) {
  return request<Verification[]>(`/verify/${reportId}`);
}

// ─── Notification APIs ───────────────────────────────────────────────────────

export async function getNotifications(params?: {
  type?: string;
  readStatus?: boolean;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.readStatus !== undefined) searchParams.set("readStatus", String(params.readStatus));
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return request<Notification[]>(`/notifications${query ? `?${query}` : ""}`);
}

export async function markNotificationRead(id: string) {
  return request<Notification>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead() {
  return request<void>("/notifications/read-all", {
    method: "PATCH",
  });
}

export async function getUnreadNotificationCount() {
  return request<{ count: number }>("/notifications/unread-count");
}

// ─── Matching APIs ───────────────────────────────────────────────────────────

export async function getRecommendedVolunteers(reportId: string, limit?: number) {
  const searchParams = new URLSearchParams();
  if (limit) searchParams.set("limit", String(limit));

  const query = searchParams.toString();
  return request<Array<{ user: AppUser; score: number; distance: number; skillMatch: boolean }>>(
    `/matching/volunteers/${reportId}${query ? `?${query}` : ""}`
  );
}

export async function getAvailableTasks(params?: { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return request<Report[]>(`/matching/tasks${query ? `?${query}` : ""}`);
}
