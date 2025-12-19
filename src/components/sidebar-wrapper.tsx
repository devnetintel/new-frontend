"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

export function SidebarWrapper() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
  const isPublicRoute = pathname?.startsWith("/approve/") || pathname?.startsWith("/consent/") || pathname?.startsWith("/status/");
  const isJoinPage = pathname === "/join";
  
  // Check if it's a workspace referral route (e.g., /suwalka)
  // Pattern: single path segment that's not a known route
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
    "history",
    "home",
    "index",
    "",
  ];
  const isWorkspaceRoute =
    pathname &&
    pathname !== "/" &&
    /^\/[a-zA-Z0-9_-]+$/.test(pathname) &&
    !excludedRoutes.includes(pathname.slice(1).toLowerCase());

  if (isAuthPage || isPublicRoute || isJoinPage || isWorkspaceRoute) {
    return null;
  }

  return <Sidebar />;
}

