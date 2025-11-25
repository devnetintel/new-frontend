import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Check if pathname matches workspace referral pattern (e.g., /suwalka)
  // Exclude known routes
  const excludedRoutes = [
    "/sign-in",
    "/sign-up",
    "/api",
    "/search",
    "/dashboard",
    "/join",
    "/admin",
  ];

  const isWorkspaceRoute =
    pathname !== "/" &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !excludedRoutes.some((route) => pathname.startsWith(route)) &&
    /^\/[a-zA-Z0-9_-]+$/.test(pathname);

  // If it's a workspace route, allow it through (catch-all route will handle it)
  // IMPORTANT: Don't protect workspace routes - let the page mount first
  // so it can capture the workspace ID before redirecting to sign-in
  if (isWorkspaceRoute) {
    // Don't protect this route - let it render so workspace can be captured
    return NextResponse.next();
  }

  // Protect all other routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
