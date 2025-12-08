"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

export function SidebarWrapper() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
  const isPublicRoute = pathname?.startsWith("/approve/") || pathname?.startsWith("/consent/") || pathname?.startsWith("/status/");
  const isJoinPage = pathname === "/join";

  if (isAuthPage || isPublicRoute || isJoinPage) {
    return null;
  }

  return <Sidebar />;
}

