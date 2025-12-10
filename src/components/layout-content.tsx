"use client";

import { usePathname } from "next/navigation";
import { MobileBottomMenu } from "./mobile-bottom-menu";
import { useChat } from "@/contexts/chat-context";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isChatOpen } = useChat();
  const isAuthPage =
    pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
  const isAdminPage = pathname?.startsWith("/admin");
  const isPublicRoute =
    pathname?.startsWith("/approve/") ||
    pathname?.startsWith("/consent/") ||
    pathname?.startsWith("/status/");
  const isResultsPage = pathname === "/results" || pathname?.startsWith("/results");
  const isDashboardPage = pathname === "/dashboard" || pathname?.startsWith("/dashboard/");
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
    "home",
    "index",
    "",
  ];
  const isWorkspaceRoute =
    pathname &&
    pathname !== "/" &&
    /^\/[a-zA-Z0-9_-]+$/.test(pathname) &&
    !excludedRoutes.includes(pathname.slice(1).toLowerCase());

  const shouldHideSidebar = isAuthPage || isPublicRoute || isJoinPage || isWorkspaceRoute;

  return (
    <>
      <main
        className={
          shouldHideSidebar
            ? "flex-1 min-h-screen relative pb-16 md:pb-0 w-full min-w-0 overflow-x-hidden"
            : "flex-1 md:pl-16 min-h-screen relative pb-16 md:pb-0 w-full min-w-0 overflow-x-hidden"
        }
      >
        <div className="w-full min-w-0">{children}</div>
      </main>
      {/* Mobile Bottom Menu - Only show on authenticated, non-public routes, and when chat is not open */}
      {/* Exclude dashboard and results pages as they render their own menu */}
      {!isAuthPage && !isAdminPage && !isPublicRoute && !isChatOpen && !isResultsPage && !isDashboardPage && !isJoinPage && !isWorkspaceRoute && (
        <MobileBottomMenu />
      )}
    </>
  );
}
