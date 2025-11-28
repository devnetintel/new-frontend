"use client";

import { usePathname } from "next/navigation";
import { MobileBottomMenu } from "./mobile-bottom-menu";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
  const isAdminPage = pathname?.startsWith("/admin");
  const isPublicRoute =
    pathname?.startsWith("/approve/") ||
    pathname?.startsWith("/consent/") ||
    pathname?.startsWith("/status/");

  return (
    <>
      <main
        className={
          isAuthPage || isPublicRoute
            ? "flex-1 min-h-screen relative pb-16 md:pb-0 w-full min-w-0 overflow-x-hidden"
            : "flex-1 md:pl-16 min-h-screen relative pb-16 md:pb-0 w-full min-w-0 overflow-x-hidden"
        }
      >
        <div className="w-full min-w-0">{children}</div>
      </main>
      {/* Mobile Bottom Menu - Only show on authenticated, non-public routes */}
      {!isAuthPage && !isAdminPage && !isPublicRoute && <MobileBottomMenu />}
    </>
  );
}
