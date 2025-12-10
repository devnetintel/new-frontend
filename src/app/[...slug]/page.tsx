"use client";

import { useState, useEffect, Suspense } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWorkspaceOwner } from "@/apis/workspaces";

// Mock Data for Connectors (fallback)
const CONNECTORS: Record<string, { name: string; avatar: string }> = {
  default: {
    name: "The Connector",
    avatar: "https://github.com/shadcn.png",
  },
};

function WorkspaceReferralPageContent() {
  const { isLoaded, signIn } = useSignIn();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const params = useParams();

  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connector, setConnector] = useState<{ name: string; avatar: string }>(
    CONNECTORS["default"]
  );
  const [isLoadingOwner, setIsLoadingOwner] = useState(false);

  // Get workspace ID from slug (e.g., /suwalka -> "suwalka")
  const workspaceId = params?.slug?.[0] as string | undefined;

  // Capture Referral IMMEDIATELY for post-login processing (before any redirects)
  useEffect(() => {
    if (workspaceId && typeof window !== "undefined") {
      localStorage.setItem("pending_workspace", workspaceId);
      console.log("📌 Velvet Rope: Captured referral:", workspaceId);
    }
  }, [workspaceId]);

  // Fetch workspace owner info when workspaceId is provided
  useEffect(() => {
    if (workspaceId) {
      setIsLoadingOwner(true);
      fetchWorkspaceOwner(workspaceId)
        .then((data) => {
          if (data.success && data.owner_name) {
            setConnector({
              name: data.owner_name,
              avatar: data.owner_picture_url || CONNECTORS["default"].avatar,
            });
          } else {
            // If success is false, redirect to sign-in page
            console.warn("Workspace owner fetch failed, redirecting to sign-in");
            router.push("/sign-in");
          }
        })
        .catch((error) => {
          console.error("Failed to fetch workspace owner:", error);
          // On error, also redirect to sign-in
          router.push("/sign-in");
        })
        .finally(() => {
          setIsLoadingOwner(false);
        });
    } else {
      setConnector(CONNECTORS["default"]);
    }
  }, [workspaceId, router]);

  // Handle Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      console.error("OAuth error:", err);
      setIsLoading(false);
    }
  };

  // If user is signed in, redirect to home (which will handle auto-add)
  if (isLoaded && isSignedIn) {
    return null; // Will redirect via useEffect
  }

  // Show join page for unauthenticated users
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="auth-container">
      {/* Glass Card */}
      <div className={cn("glass-card", isAnimatingOut && "fade-out")}>
        {/* Overlapping Avatar */}
        {isLoadingOwner ? (
          <div className="connector-avatar flex items-center justify-center bg-[#0F0F12]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <img
            src={connector.avatar}
            alt={connector.name}
            className="connector-avatar"
          />
        )}

        {/* Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {connector.name} invites you.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              You have been granted access to my personal network intelligence.
              Use the search to find founders, investors, and talent.
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white text-black font-medium rounded-xl py-3 px-6 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Unlock Access with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceReferralPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <WorkspaceReferralPageContent />
    </Suspense>
  );
}
