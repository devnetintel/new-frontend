/**
 * Hub Dashboard API Service
 * Handles hub user dashboard and request management
 */

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export interface HubDashboardStats {
  greeting: string;
  potential_connections_this_month: number;
  connections_made: number;
  connections_made_change: string;
  active_requests: number;
}

export interface HubDashboardResponse {
  success: boolean;
  stats: HubDashboardStats;
  is_hub_user: boolean;
  workspaces: string[];
}

export interface HubRequestPerson {
  name: string;
  title: string | null;
  company: string | null;
  picture_url: string | null;
  linkedin_url: string | null;
}

export interface HubRequest {
  request_id: number;
  requester: HubRequestPerson;
  target: HubRequestPerson;
  reason: string;
  user_message: string | null;
  helped_count: number;
  is_new_request: boolean;
  created_at: string;
  workspace_id: string;
  approval_token: string; // Token for approving/declining the request
}

export interface HubRequestsResponse {
  success: boolean;
  requests: HubRequest[];
  total_count: number;
  limit: number;
  offset: number;
}

export interface HubRequestHistory extends HubRequest {
  status: string;
  h1_approval_status: string;
  s2_consent_status: string;
  timestamps: {
    created_at: string;
    created_ago: string;
    h1_approved_at: string | null;
    s2_consented_at: string | null;
    final_intro_sent_at: string | null;
  };
}

export interface HubRequestsHistoryResponse {
  success: boolean;
  requests: HubRequestHistory[];
  total_count: number;
  limit: number;
  offset: number;
}

/**
 * Get dashboard statistics for hub user
 */
export async function fetchHubDashboard(
  token: string
): Promise<HubDashboardResponse> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const url = `${API_BASE}/api/hub/dashboard`;
  console.log("Making API call to:", url);
  console.log("Authorization header present:", !!token);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required. Please sign in.");
    }
    throw new Error("Failed to fetch hub dashboard");
  }

  const data = await response.json();
  return data;
}

/**
 * Get pending introduction requests for hub user to review/approve
 */
export async function fetchHubPendingRequests(
  token: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<HubRequestsResponse> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const url = new URL(`${API_BASE}/api/hub/requests/pending`);

  if (options?.limit) {
    url.searchParams.append("limit", options.limit.toString());
  }
  if (options?.offset) {
    url.searchParams.append("offset", options.offset.toString());
  }

  const apiUrl = url.toString();
  console.log("Making API call to:", apiUrl);
  console.log("Authorization header present:", !!token);

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required. Please sign in.");
    }
    throw new Error("Failed to fetch pending requests");
  }

  const data = await response.json();
  return data;
}

/**
 * Get historical (completed/declined) requests for hub user
 */
export async function fetchHubRequestsHistory(
  token: string,
  options?: {
    status_filter?: "completed" | "declined" | "all";
    limit?: number;
    offset?: number;
  }
): Promise<HubRequestsHistoryResponse> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const url = new URL(`${API_BASE}/api/hub/requests/history`);

  if (options?.status_filter) {
    url.searchParams.append("status_filter", options.status_filter);
  }
  if (options?.limit) {
    url.searchParams.append("limit", options.limit.toString());
  }
  if (options?.offset) {
    url.searchParams.append("offset", options.offset.toString());
  }

  const apiUrl = url.toString();
  console.log("Making API call to:", apiUrl);
  console.log("Authorization header present:", !!token);

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required. Please sign in.");
    }
    throw new Error("Failed to fetch requests history");
  }

  const data = await response.json();
  return data;
}

/**
 * Approve an introduction request (H1 approval)
 * @param token - JWT authentication token
 * @param requestId - The request ID (numeric)
 * @param approvalToken - The approval token from the request
 * @param h1Note - Optional note from H1 to S2
 */
export async function approveHubRequest(
  token: string,
  requestId: number | string,
  approvalToken: string,
  h1Note?: string
): Promise<{ success: boolean; message?: string }> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const url = `${API_BASE}/api/intro-requests/${requestId}/approve?token=${approvalToken}`;
  console.log("Making approval API call to:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      h1_note: h1Note || null,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required. Please sign in.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.message || "Failed to approve request"
    );
  }

  const data = await response.json();
  return data;
}

/**
 * Decline an introduction request (H1 decline)
 * @param token - JWT authentication token
 * @param requestId - The request ID (numeric)
 * @param approvalToken - The approval token from the request
 */
export async function declineHubRequest(
  token: string,
  requestId: number | string,
  approvalToken: string
): Promise<{ success: boolean; message?: string }> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const url = `${API_BASE}/api/intro-requests/${requestId}/decline?token=${approvalToken}`;
  console.log("Making decline API call to:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required. Please sign in.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.message || "Failed to decline request"
    );
  }

  const data = await response.json();
  return data;
}
