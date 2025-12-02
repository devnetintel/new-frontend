"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, PlusCircle } from "lucide-react";
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
    { icon: Library, label: "Library", href: "/dashboard" },
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
          // For home route, check if pathname is "/" or a workspace route (e.g., /suwalka)
          const isActive =
            item.href === "/"
              ? pathname === "/" || /^\/[a-zA-Z0-9_-]+$/.test(pathname)
              : pathname === item.href || pathname.startsWith(item.href + "/");

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
