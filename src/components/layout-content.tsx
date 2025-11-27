"use client";

import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
  const isAdminPage = pathname?.startsWith("/admin");
  const isPublicRoute = pathname?.startsWith("/approve/") || pathname?.startsWith("/consent/") || pathname?.startsWith("/status/");

  return (
    <main className={isAuthPage || isPublicRoute ? "flex-1 min-h-screen relative" : "flex-1 md:pl-16 min-h-screen relative"}>
      {!isAuthPage && !isAdminPage && !isPublicRoute && <ModeToggle />}
      {children}
    </main>
  );
}

