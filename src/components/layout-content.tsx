"use client";

import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  return (
    <main className={isAuthPage ? "flex-1 min-h-screen relative" : "flex-1 md:pl-16 min-h-screen relative"}>
      {!isAuthPage && <ModeToggle />}
      {children}
    </main>
  );
}

