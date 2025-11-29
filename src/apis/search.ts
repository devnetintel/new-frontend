/**
 * Search API Service
 * Handles all search-related API calls for the search page
 */

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

// Track if server is being woken up (for Render free tier)
let isWakingUp = false;
let serverAwake = false;

/**
 * Wake up the backend server (for Render free tier cold starts)
 */
async function wakeUpServer(): Promise<void> {
  if (serverAwake || isWakingUp) return;

  isWakingUp = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    serverAwake = true;
    isWakingUp = false;
    } catch {
      // Server might still be waking up, that's ok
      isWakingUp = false;
      console.log("Server waking up...");
    }
}

import type { BackendPerson, BackendQueryResponse } from "@/types";

/**
 * Search the professional network using the Connect Agent
 *
 * @param query - Natural language query (e.g., "find Python developers")
 * @param token - JWT authentication token from Clerk
 * @param workspaceIds - Array of workspace identifiers for multi-workspace search
 * @param sessionId - Optional session ID from /chat endpoint to link chat conversation with search
 * @returns Query response with results and metadata
 *
 * @example
 * ```tsx
 * const { getToken } = useAuth();
 * const token = await getToken();
 * const result = await searchNetwork(
 *   "Python developers in fintech",
 *   token,
 *   ["shubham", "ajay"],
 *   "session-id-from-chat"
 * );
 * ```
 */
export async function searchNetwork(
  query: string,
  token: string | null,
  workspaceIds: string[],
  sessionId?: string
): Promise<BackendQueryResponse> {
  // Wake up server on first request (for Render free tier)
  if (!serverAwake) {
    console.log("Waking up server...");
    await wakeUpServer();
  }

  console.log("Sending search request to:", `${API_BASE}/ask`);
  console.log("Request info:", { hasToken: !!token, workspaceIds, sessionId });
  
  const requestBody: {
    question: string;
    workspace_ids: string[];
    session_id?: string;
  } = {
    question: query,
    workspace_ids: workspaceIds,
  };

  if (sessionId) {
    requestBody.session_id = sessionId;
  }

  console.log("Request body:", JSON.stringify(requestBody));

  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const response = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // JWT authentication
    },
    body: JSON.stringify(requestBody),
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401) {
      throw new Error("Authentication failed. Please sign in again.");
    }
    if (response.status === 403) {
      throw new Error(
        "Access denied. You do not have permission to access one or more of these workspaces."
      );
    }

    // Try to get detailed error message
    let errorDetail = "Failed to search network";
    try {
      const error = await response.json();
      console.error("Search error response:", error);

      // FastAPI validation errors have a specific format
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          // Validation errors
          errorDetail = error.detail
            .map((e: { loc?: string[]; msg?: string }) => `${e.loc?.join(".")}: ${e.msg}`)
            .join(", ");
        } else if (typeof error.detail === "string") {
          errorDetail = error.detail;
        } else if (error.detail.message) {
          errorDetail = error.detail.message;
        }
      }
    } catch (parseError) {
      console.error("Could not parse error response:", parseError);
    }

    throw new Error(errorDetail);
  }

  const data = await response.json();
  console.log("Search successful, found profiles:", data.profiles?.length);

  // Debug: Log first profile
  if (data.profiles && data.profiles.length > 0) {
    console.log("🔍 First profile from API:", {
      name: data.profiles[0].name,
      hasReason: !!data.profiles[0].reason,
      workspaceId: data.profiles[0].workspace_id,
      allFields: Object.keys(data.profiles[0]),
    });
  }

  return data;
}

/**
 * Health check endpoint
 * Used to wake up the server
 */
export async function checkHealth(): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}

/**
 * Get agent information
 */
export async function getAgentInfo(): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE}/agent/info`);
  return response.json();
}
