"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutDashboard } from "lucide-react";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

export function MobileBottomMenu() {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active index based on current path
  const getActiveIndex = () => {
    if (pathname === "/" || /^\/[a-zA-Z0-9_-]+$/.test(pathname)) {
      return 0; // Home
    } else if (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/")
    ) {
      return 1; // Dashboard
    }
    return -1; // None active (for profile)
  };

  const [activeIndex, setActiveIndex] = useState(getActiveIndex());

  // Update active index when pathname changes
  useEffect(() => {
    const newIndex = getActiveIndex();
    setActiveIndex(newIndex);
  }, [pathname]);

  const handleItemClick = (index: number, onClick?: () => void) => {
    setActiveIndex(index);
    if (onClick) onClick();
  };

  return (
    <nav className="mobile-menu" role="navigation">
      {/* Home Button */}
      <button
        className={`mobile-menu__item ${activeIndex === 0 ? "active" : ""}`}
        onClick={() => handleItemClick(0, () => router.push("/"))}
        style={{ "--lineWidth": "0px" } as React.CSSProperties}
      >
        <div className="mobile-menu__icon">
          <Home className="icon" />
        </div>
        <strong
          className={`mobile-menu__text ${activeIndex === 0 ? "active" : ""}`}
        >
          Home
        </strong>
      </button>

      {/* Dashboard Button */}
      <button
        className={`mobile-menu__item ${activeIndex === 1 ? "active" : ""}`}
        onClick={() => handleItemClick(1, () => router.push("/dashboard"))}
        style={{ "--lineWidth": "0px" } as React.CSSProperties}
      >
        <div className="mobile-menu__icon">
          <LayoutDashboard className="icon" />
        </div>
        <strong
          className={`mobile-menu__text ${activeIndex === 1 ? "active" : ""}`}
        >
          Dashboard
        </strong>
      </button>

      {/* Profile/UserButton - Direct integration like sidebar */}
      <div className="mobile-menu__item">
        <SignedIn>
          <div className="flex flex-col items-center justify-center gap-1">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "h-6 w-6",
                  userButtonPopoverCard: "shadow-lg",
                },
              }}
            />
            <strong className="mobile-menu__text">Profile</strong>
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="flex flex-col items-center justify-center gap-1 w-full">
              <div className="mobile-menu__icon">
                <svg
                  className="icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <strong className="mobile-menu__text">Sign In</strong>
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
