/**
 * My Requests API Service
 * Handles fetching user's introduction requests
 */

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

import type { IntroRequest, MyRequestsResponse } from "@/types";

/**
 * Fetch user's introduction requests
 * @param token JWT authentication token from Clerk
 * @param options Optional query parameters
 * @returns Array of introduction requests
 */
export async function fetchMyRequests(
  token: string,
  options?: {
    limit?: number;
    offset?: number;
    status_filter?: "pending" | "connected" | "declined";
  }
): Promise<MyRequestsResponse> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const url = new URL(`${API_BASE}/api/intro-requests/my-requests`);

  if (options?.limit) {
    url.searchParams.append("limit", options.limit.toString());
  }
  if (options?.offset) {
    url.searchParams.append("offset", options.offset.toString());
  }
  if (options?.status_filter) {
    url.searchParams.append("status_filter", options.status_filter);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required. Please sign in.");
    }
    throw new Error("Failed to fetch requests");
  }

  const data = await response.json();
  return data;
}

