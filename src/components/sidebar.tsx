"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, PlusCircle, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  useAuth,
} from "@clerk/nextjs";
import { UserMenu } from "@/components/user-menu";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: History, label: "History", href: "/history" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 flex-col items-center border-r border-border/10 bg-background py-4 hidden md:flex">
      <div className="mb-8">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="font-bold text-primary text-xs">PNI</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full mb-4 opacity-50 hover:opacity-100"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>

        {navItems.map((item) => {
          // Check specific routes first before generic patterns
          let isActive = false;
          
          if (item.href === "/dashboard") {
            // Dashboard route
            isActive = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
          } else if (item.href === "/history") {
            // History route
            isActive = pathname === "/history" || pathname.startsWith("/history/");
          } else if (item.href === "/") {
            // Home route - check if it's "/" or a workspace route, but NOT dashboard/history/results
            const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
            const isHistory = pathname === "/history" || pathname.startsWith("/history/");
            const isResults = pathname === "/results" || pathname.startsWith("/results");
            
            isActive = (pathname === "/" || /^\/[a-zA-Z0-9_-]+$/.test(pathname)) 
              && !isDashboard && !isHistory && !isResults;
          } else {
            // Fallback for other routes
            isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          }

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary opacity-100 shadow-[0_0_10px_rgba(118,29,231,0.2)]"
                    : "opacity-60 hover:opacity-100 hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center justify-center gap-4">
        <SignedIn>
          <UserMenu afterSignOutUrl="/sign-in" />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </aside>
  );
}
