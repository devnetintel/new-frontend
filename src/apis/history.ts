/**
 * History API Service
 * Handles fetching search history and history details
 */

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export interface HistoryItem {
  search_id: string;
  timestamp: string;
  query_text: string;
  final_result_count: number;
}

export interface HistoryListResponse extends Array<HistoryItem> {}

export interface HistoryDetailResponse {
  success: boolean;
  response: string;
  is_hub_user: boolean;
  requester_has_linkedin: boolean;
  profiles: Array<{
    rank: number;
    profile: {
      person_id: string;
      name: string;
      headline: string;
      picture_url: string | null;
      current_company: string | null;
      current_title: string | null;
      linkedin_profile: string | null;
    };
    result_id: number;
    search_result_id: number;
    evaluation_score: number;
    criteria_matches: Array<string | {
      evidence?: string;
      headline?: string;
      question?: string;
      reasoning?: string;
      match_level?: string;
      criterion_id?: string;
    }>;
    overall_assessment: string;
  }>;
  metadata: Record<string, any>;
}

/**
 * Fetch list of search history
 * @param token JWT authentication token from Clerk
 * @param options Optional query parameters
 * @returns Array of history items
 */
export async function fetchHistory(
  token: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<HistoryListResponse> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const url = new URL(`${API_BASE}/api/v1/history`);

  if (options?.limit) {
    url.searchParams.append("limit", options.limit.toString());
  }
  if (options?.offset) {
    url.searchParams.append("offset", options.offset.toString());
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
    throw new Error("Failed to fetch history");
  }

  const data = await response.json();
  return data;
}

/**
 * Fetch detailed results for a specific search history item
 * @param token JWT authentication token from Clerk
 * @param searchId UUID of the search history item
 * @returns Detailed history response with profiles
 */
export async function fetchHistoryDetail(
  token: string,
  searchId: string
): Promise<HistoryDetailResponse> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const response = await fetch(`${API_BASE}/api/v1/history/${searchId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required. Please sign in.");
    }
    if (response.status === 404) {
      throw new Error("History item not found");
    }
    throw new Error("Failed to fetch history details");
  }

  const data = await response.json();
  return data;
}

