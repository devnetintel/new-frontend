/**
 * Workspaces API Service
 * Handles all workspace-related API calls
 */

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

import type { WorkspaceInfo } from "@/types";

/**
 * Get all workspaces the user has access to
 * @param token JWT authentication token from Clerk
 * @returns Object with workspaces array and total count
 */
export async function fetchWorkspaces(
  token: string | null
): Promise<{ workspaces: WorkspaceInfo[]; total: number }> {
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

  // Check if workspaces array is empty or total is 0
  const workspacesArray = data.workspaces || [];
  const total = data.total ?? workspacesArray.length;

  // Map backend workspace_id to frontend id field
  const workspaces: WorkspaceInfo[] = workspacesArray.map(
    (ws: {
      workspace_id: string;
      name?: string;
      owner_name?: string;
      owner_picture_url?: string;
      profile_count?: number;
      source?: string;
    }) => ({
      id: ws.workspace_id,
      name: ws.name || ws.owner_name || ws.workspace_id,
      owner_name: ws.owner_name,
      owner_picture_url: ws.owner_picture_url,
      profile_count: ws.profile_count || 0,
      source: (ws.source === "link" || ws.source === "admin"
        ? ws.source
        : "link") as "link" | "admin",
    })
  );

  return { workspaces, total };
}

/**
 * Get workspace owner information (public API, no auth required)
 * @param workspaceId The workspace ID (e.g., "suwalka")
 * @returns Workspace owner information
 */
export async function fetchWorkspaceOwner(workspaceId: string): Promise<{
  workspace_id: string;
  owner_name: string;
  owner_picture_url: string;
  success: boolean;
  message: string | null;
}> {
  const response = await fetch(
    `${API_BASE}/api/workspace/${workspaceId}/owner`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail?.message || "Failed to fetch workspace owner");
  }

  const data = await response.json();
  return data;
}
