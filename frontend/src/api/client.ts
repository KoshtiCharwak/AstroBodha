// Thin fetch wrapper for the Zodiac backend. All paths are relative to
// `${EXPO_PUBLIC_BACKEND_URL}/api`. Auth token is read from secure storage
// on every call (see src/utils/storage) and attached as a Bearer header.
import { storage } from "@/src/utils/storage";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

export const AUTH_TOKEN_KEY = "zodiac_auth_token";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await storage.secureGet(AUTH_TOKEN_KEY, "");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data?.detail || "Something went wrong. Please try again.", res.status);
  }
  return data as T;
}

export const api = {
  sendOtp: (mobile: string) =>
    request<{ status: string; is_new_user: boolean }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobile }),
    }),
  verifyOtp: (mobile: string, code: string) =>
    request<{ is_new_user: boolean; token?: string; user?: any; signup_token?: string }>(
      "/auth/verify-otp",
      { method: "POST", body: JSON.stringify({ mobile, code }) },
    ),
  signup: (payload: {
    signup_token: string;
    name: string;
    dob: string;
    place_of_birth: string;
    time_of_birth?: string;
    email?: string;
  }) => request<{ token: string; user: any }>("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),

  getMe: () => request<any>("/users/me"),
  updateMe: (payload: Record<string, any>) =>
    request<any>("/users/me", { method: "PUT", body: JSON.stringify(payload) }),

  getTodayPrediction: () => request<any>("/predictions/today"),
  checkin: () => request<{ streak_count: number; already_checked_in: boolean }>("/predictions/checkin", {
    method: "POST",
  }),

  getNotifications: () => request<{ notifications: any[]; unread_count: number }>("/notifications"),
  markNotificationsRead: () => request<{ status: string }>("/notifications/read-all", { method: "POST" }),

  getSubscriptionStatus: () => request<any>("/subscription/status"),
  subscribe: () => request<any>("/subscription/subscribe", { method: "POST" }),
  cancelSubscription: () => request<any>("/subscription/cancel", { method: "POST" }),
};
