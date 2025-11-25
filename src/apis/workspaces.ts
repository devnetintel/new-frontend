/**
 * Workspaces API Service
 * Handles all workspace-related API calls
 */

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

import type { WorkspaceInfo } from "@/types";

/**
 * Get all workspaces the user has access to
 * @param token JWT authentication token from Clerk
 * @returns Array of workspaces with metadata
 */
export async function fetchWorkspaces(
  token: string | null
): Promise<WorkspaceInfo[]> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const response = await fetch(`${API_BASE}/api/workspaces`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed. Please sign in again.");
    }
    const error = await response.json();
    throw new Error(error.detail?.message || "Failed to fetch workspaces");
  }

  const data = await response.json();

  // Map backend workspace_id to frontend id field
  const workspaces: WorkspaceInfo[] = (data.workspaces || []).map(
    (ws: {
      workspace_id: string;
      name?: string;
      owner_name?: string;
      profile_count?: number;
      source?: string;
    }) => ({
      id: ws.workspace_id,
      name: ws.name || ws.owner_name || ws.workspace_id,
      profile_count: ws.profile_count || 0,
      source: (ws.source === "link" || ws.source === "admin"
        ? ws.source
        : "link") as "link" | "admin",
    })
  );

  return workspaces;
}

