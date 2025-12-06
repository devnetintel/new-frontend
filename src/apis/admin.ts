/**
 * Admin API Service
 * Handles admin-only API endpoints
 *
 * Note: The backend provides both JSON API endpoints and HTML viewer endpoints:
 * - JSON APIs: /api/admin/logs, /api/admin/db/tables (for programmatic access)
 * - HTML Viewers: /logs, /db (for direct browser viewing, return HTML pages)
 */

import type {
  AdminLog,
  AdminTable,
  AdminTableColumn,
  AdminWorkspaceStats,
} from "@/types/admin";

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/**
 * Fetch search logs (admin only)
 */
export async function fetchAdminLogs(
  token: string,
  limit: number = 50,
  userEmail?: string
): Promise<AdminLog[]> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const url = new URL(`${API_BASE}/api/admin/logs`);
  url.searchParams.append("limit", limit.toString());
  if (userEmail) {
    url.searchParams.append("user_email", userEmail);
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
    throw new Error("Failed to fetch logs");
  }

  const data = await response.json();
  return data.logs || [];
}

/**
 * Fetch database tables list (admin only)
 */
export async function fetchAdminTables(
  token: string
): Promise<{ tables: AdminTable[]; workspace_stats: AdminWorkspaceStats[] }> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const response = await fetch(`${API_BASE}/api/admin/db/tables`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required. Please sign in.");
    }
    throw new Error("Failed to fetch tables");
  }

  const data = await response.json();
  return {
    tables: data.tables || [],
    workspace_stats: data.workspace_stats || [],
  };
}

/**
 * Fetch table data (admin only)
 */
export async function fetchAdminTableData(
  token: string,
  tableName: string,
  options?: {
    limit?: number;
    offset?: number;
    searchColumn?: string;
    searchValue?: string;
    orderBy?: string;
    orderDirection?: "ASC" | "DESC";
  }
): Promise<{
  columns: AdminTableColumn[];
  rows: any[];
  total_count: number;
}> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const url = new URL(`${API_BASE}/api/admin/db/table/${tableName}`);

  if (options?.limit)
    url.searchParams.append("limit", options.limit.toString());
  if (options?.offset)
    url.searchParams.append("offset", options.offset.toString());
  if (options?.searchColumn)
    url.searchParams.append("search_column", options.searchColumn);
  if (options?.searchValue)
    url.searchParams.append("search_value", options.searchValue);
  if (options?.orderBy) url.searchParams.append("order_by", options.orderBy);
  if (options?.orderDirection)
    url.searchParams.append("order_direction", options.orderDirection);

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
    throw new Error("Failed to fetch table data");
  }

  const data = await response.json();
  return {
    columns: data.columns || [],
    rows: data.rows || [],
    total_count: data.total_count || 0,
  };
}

/**
 * Get URL for admin database HTML viewer
 * Returns HTML page for interactive database browsing
 * @param token JWT authentication token
 * @returns URL string for the database viewer
 */
export function getAdminDatabaseViewerUrl(token: string): string {
  return `${API_BASE}/db?token=${encodeURIComponent(token)}`;
}

/**
 * Get URL for admin logs HTML viewer
 * Returns HTML page for search logs dashboard
 * @param token JWT authentication token
 * @param options Optional query parameters
 * @returns URL string for the logs viewer
 */
export function getAdminLogsViewerUrl(
  token: string,
  options?: {
    limit?: number;
    user_email?: string;
  }
): string {
  const url = new URL(`${API_BASE}/logs`);
  url.searchParams.append("token", token);
  if (options?.limit) {
    url.searchParams.append("limit", options.limit.toString());
  }
  if (options?.user_email) {
    url.searchParams.append("user_email", options.user_email);
  }
  return url.toString();
}
