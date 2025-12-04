/**
 * Workspace Referral System
 * Captures workspace IDs from URL and auto-adds them after login
 */

import type { WorkspaceInfo } from "@/types";

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/**
 * Clean up invalid workspace IDs from localStorage
 */
export function cleanupInvalidWorkspaceIds() {
  if (typeof window === "undefined") return;

  const pending = localStorage.getItem("pending_workspace");
  if (!pending) return;

  const excludedRoutes = [
    "login",
    "signup",
    "sign-in",
    "sign-up",
    "admin",
    "dashboard",
    "api",
    "search",
    "join",
    "results",
    "result",
    "home",
    "index",
    "",
  ];

  // Validate workspace ID format
  const workspaceIdPattern = /^[a-zA-Z0-9_-]{2,}$/;
  
  if (
    excludedRoutes.includes(pending.toLowerCase()) ||
    !workspaceIdPattern.test(pending)
  ) {
    console.warn("Cleaning up invalid workspace ID from localStorage:", pending);
    localStorage.removeItem("pending_workspace");
  }
}

/**
 * 1. Call this on app init / page load
 * Captures referral workspace ID from URL path or query parameter
 */
export function captureReferralFromUrl() {
  if (typeof window === "undefined") return null;

  // Don't capture workspace referrals on results page
  if (window.location.pathname.startsWith("/results")) {
    return null;
  }

  // First, try to get from the original pathname header (set by middleware)
  // This works even if Next.js rewrote the URL
  let workspaceId: string | null = null;

  // Check the actual browser URL pathname (before any rewrites)
  // In Next.js, window.location.pathname shows the original URL even after rewrite
  const pathMatch = window.location.pathname.match(
    /^\/(?:r\/)?([a-zA-Z0-9_-]+)\/?$/
  );

  // Or check query param ?ref=suwalka
  const queryRef = new URLSearchParams(window.location.search).get("ref");

  workspaceId = pathMatch?.[1] || queryRef;

  // Exclude common routes that aren't workspace IDs
  const excludedRoutes = [
    "login",
    "signup",
    "sign-in",
    "sign-up",
    "admin",
    "dashboard",
    "api",
    "search",
    "join",
    "results",
    "result",
    "home",
    "index",
    "",
  ];

  if (
    workspaceId &&
    !excludedRoutes.includes(workspaceId.toLowerCase())
  ) {
    localStorage.setItem("pending_workspace", workspaceId);
    console.log("📌 Captured referral workspace:", workspaceId);
    console.log("   Original pathname:", window.location.pathname);
    return workspaceId;
  }

  return null;
}

/**
 * 2. Call this after user logs in (or on app init if already logged in)
 * Processes the pending workspace referral and auto-adds it
 */
export async function processPendingWorkspace(
  token: string
): Promise<{ workspace: WorkspaceInfo; already_had_access: boolean } | null> {
  if (typeof window === "undefined") return null;

  const pending = localStorage.getItem("pending_workspace");
  if (!pending) return null;

  // Validate workspace ID format - should be alphanumeric with underscores/hyphens, at least 2 chars
  const workspaceIdPattern = /^[a-zA-Z0-9_-]{2,}$/;
  if (!workspaceIdPattern.test(pending)) {
    console.warn("Invalid workspace ID format, clearing:", pending);
    localStorage.removeItem("pending_workspace");
    return null;
  }

  // Double-check excluded routes
  const excludedRoutes = [
    "login",
    "signup",
    "sign-in",
    "sign-up",
    "admin",
    "dashboard",
    "api",
    "search",
    "join",
    "results",
    "result",
    "home",
    "index",
  ];
  if (excludedRoutes.includes(pending.toLowerCase())) {
    console.warn("Workspace ID is in excluded routes, clearing:", pending);
    localStorage.removeItem("pending_workspace");
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/api/workspaces/auto-add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ workspace_id: pending }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData.message || res.statusText || "Unknown error";
      console.error(
        "Failed to auto-add workspace:",
        errorMessage
      );
      
      // If it's a 404 or 400, the workspace doesn't exist - clear it
      if (res.status === 404 || res.status === 400) {
        console.warn("Workspace not found or invalid, clearing from localStorage");
        localStorage.removeItem("pending_workspace");
      }
      // For other errors, keep it in localStorage so user can retry
      return null;
    }

    const data = await res.json();

    if (data.success && data.workspace) {
      localStorage.removeItem("pending_workspace");
      console.log("✅ Workspace auto-added:", data.workspace.name);

      // Map to WorkspaceInfo format
      const workspace: WorkspaceInfo = {
        id: data.workspace.id || data.workspace.workspace_id || pending,
        name: data.workspace.name || pending,
        profile_count: data.workspace.profile_count || 0,
        source: "link",
      };

      return {
        workspace,
        already_had_access: data.already_had_access || false,
      };
    }
  } catch (error) {
    console.error("Failed to auto-add workspace:", error);
    // Don't remove from localStorage on error - user might retry
  }

  return null;
}

