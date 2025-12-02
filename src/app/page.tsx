"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { SearchInput } from "@/components/search-input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VoiceDiscoveryInline } from "@/components/voice-discovery-overlay";
import { NetworkFilter } from "@/components/network-filter";
import { InspirationDeck } from "@/components/inspiration-deck";
import { GuardiansHeader } from "@/components/guardians-header";

import {
  captureReferralFromUrl,
  processPendingWorkspace,
} from "@/utils/workspaceReferral";
import { fetchWorkspaces } from "@/apis/workspaces";
import { WorkspaceInfo } from "@/types/connection";

function HomePageContent() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<string[]>(
    []
  );
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [isVoiceDiscoveryOpen, setIsVoiceDiscoveryOpen] = useState(false);
  const [isSpotlight, setIsSpotlight] = useState(false);

  // CRITICAL: Capture workspace referral from URL BEFORE Clerk redirects
  // This runs immediately on page load to preserve workspace through auth flow
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("🔍 PAGE MOUNT - Checking for workspace referral in URL");
      console.log("   Current URL:", window.location.href);
      console.log("   Pathname:", window.location.pathname);
      console.log("   Full URL:", window.location.toString());

      // Capture referral from URL (supports /suwalka, /r/suwalka, or ?ref=suwalka)
      const captured = captureReferralFromUrl();
      if (captured) {
        console.log(
          "✅ Workspace captured and stored in localStorage:",
          captured
        );
      } else {
        console.log("ℹ️ No workspace referral found in URL");
      }
    }
  }, []); // Empty deps = runs once on mount

  // Redirect to sign-in if not authenticated
  // BUT: Let the workspace capture happen first (in the previous useEffect)
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Small delay to ensure workspace capture happens first
      const timer = setTimeout(() => {
        router.push("/sign-in");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch user's accessible workspaces from backend
  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!isSignedIn || !user?.id) {
        setIsLoadingWorkspaces(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setIsLoadingWorkspaces(false);
          return;
        }

        const userWorkspaces = await fetchWorkspaces(token);
        setWorkspaces(userWorkspaces);

        // Auto-select all workspaces by default
        if (userWorkspaces.length > 0) {
          setSelectedWorkspaceIds(userWorkspaces.map((w) => w.id));
        }
      } catch (error) {
        console.error("Failed to fetch workspaces:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load workspaces"
        );
      } finally {
        setIsLoadingWorkspaces(false);
      }
    };

    if (isLoaded && isSignedIn) {
      loadWorkspaces();
    }
  }, [isLoaded, isSignedIn, user?.id, getToken]);

  // Process pending workspace referral after user logs in
  useEffect(() => {
    const processReferral = async () => {
      if (!user?.id || !isSignedIn) {
        console.log("⏳ Waiting for user authentication...");
        return;
      }

      // Check if there's a pending workspace
      const pending =
        typeof window !== "undefined"
          ? localStorage.getItem("pending_workspace")
          : null;

      if (!pending) {
        console.log("ℹ️ No pending workspace to process");
        return;
      }

      console.log("🔄 Processing pending workspace:", pending);

      try {
        const token = await getToken();
        if (!token) {
          console.error("❌ No token available");
          return;
        }

        console.log("📡 Calling API to add workspace:", pending);
        const result = await processPendingWorkspace(token);

        if (result) {
          console.log("✅ Workspace added successfully:", result.workspace);

          // Add workspace to the list if not already present
          setWorkspaces((prev) => {
            const exists = prev.some((w) => w.id === result.workspace.id);
            if (exists) {
              console.log("ℹ️ Workspace already in list");
              return prev;
            }
            console.log("➕ Adding workspace to list");
            return [...prev, result.workspace];
          });

          // Auto-select the new workspace
          setSelectedWorkspaceIds((prev) => {
            if (prev.includes(result.workspace.id)) return prev;
            console.log("✅ Auto-selecting workspace:", result.workspace.id);
            return [...prev, result.workspace.id];
          });

          // Show toast notification
          if (!result.already_had_access) {
            toast.success(
              `You now have access to ${result.workspace.name}'s Network!`
            );
          } else {
            toast.info(
              `You already have access to ${result.workspace.name}'s Network`
            );
          }
        } else {
          console.log("⚠️ processPendingWorkspace returned null");
        }
      } catch (error) {
        console.error("❌ Failed to process workspace referral:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to add workspace"
        );
      }
    };

    // Only process if workspaces have been loaded (to avoid race conditions)
    if (!isLoadingWorkspaces && user?.id && isSignedIn) {
      console.log("🚀 Conditions met, processing referral...");
      processReferral();
    } else {
      console.log("⏳ Waiting for conditions:", {
        isLoadingWorkspaces,
        hasUserId: !!user?.id,
        isSignedIn,
      });
    }
  }, [user?.id, getToken, isLoadingWorkspaces, isSignedIn]);

  const handleSearch = async (searchQuery: string, sessionId?: string) => {
    // Check if workspaces are selected
    if (selectedWorkspaceIds.length === 0) {
      toast.error("Please select at least one network to search");
      return;
    }

    // Navigate to results page with query parameters
    const params = new URLSearchParams({
      q: searchQuery,
      workspaces: selectedWorkspaceIds.join(","),
    });

    if (sessionId) {
      params.set("sessionId", sessionId);
    }

    router.push(`/results?${params.toString()}`);
  };

  const handleToggleNetwork = (workspaceId: string) => {
    setSelectedWorkspaceIds((prev) => {
      if (prev.includes(workspaceId)) {
        return prev.filter((id) => id !== workspaceId);
      }
      return [...prev, workspaceId];
    });
  };

  const handleSelectAllNetworks = () => {
    if (selectedWorkspaceIds.length === workspaces.length) {
      setSelectedWorkspaceIds([]);
    } else {
      setSelectedWorkspaceIds(workspaces.map((w) => w.id));
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-5xl mx-auto font-sans relative">
      {/* Spotlight Overlay - Only show when not in chat */}
      {!isVoiceDiscoveryOpen && (
        <div
          className={cn(
            "fixed inset-0 bg-black/20 backdrop-blur-[1px] z-0 transition-opacity duration-500 pointer-events-none",
            isSpotlight ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Header / Initial State - Hide when conversation is active */}
      {!isVoiceDiscoveryOpen && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 md:space-y-12 mb-20 animate-in fade-in duration-700 z-10 relative mt-20 md:mt-0">
          {/* Guardians Header or Simple Greeting */}
          {workspaces.length > 0 ? (
            <GuardiansHeader workspaces={workspaces} />
          ) : (
            <h1 className="text-2xl md:text-3xl font-medium text-center tracking-tight text-foreground/90 max-w-2xl leading-relaxed">
              Hi, how can I help you?
            </h1>
          )}

          {/* Network Selector */}
          <div
            className={cn(
              "w-full max-w-2xl transition-opacity duration-300",
              isSpotlight ? "opacity-50" : "opacity-100"
            )}
          >
            <NetworkFilter
              workspaces={workspaces}
              selectedIds={selectedWorkspaceIds}
              onToggle={handleToggleNetwork}
              onSelectAll={handleSelectAllNetworks}
            />
          </div>

          {/* Oracle Input */}
          <div className="w-full max-w-3xl z-20">
            <SearchInput
              onSearch={(query) => {
                setQuery(query);
                // Always trigger voice discovery / inquiry mode
                setIsVoiceDiscoveryOpen(true);
              }}
              onFocus={() => setIsSpotlight(true)}
              onBlur={() => setIsSpotlight(false)}
              // placeholder is handled in component
            />
          </div>

          {/* Inspiration Deck */}
          <div
            className={cn(
              "w-full max-w-3xl animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 transition-opacity duration-300",
              isSpotlight ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <InspirationDeck
              onSelect={(q) => {
                setQuery(q);
                // Always trigger voice discovery / inquiry mode
                setIsVoiceDiscoveryOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Voice Discovery Inline Component */}
      {isVoiceDiscoveryOpen && (
        <VoiceDiscoveryInline
          isActive={isVoiceDiscoveryOpen}
          onClose={() => {
            setIsVoiceDiscoveryOpen(false);
            setQuery("");
          }}
          onSearch={(finalQuery, sessionId) => {
            setIsVoiceDiscoveryOpen(false);
            setQuery("");
            handleSearch(finalQuery, sessionId);
          }}
          initialQuery={query}
          selectedNetworks={selectedWorkspaceIds}
          workspaces={workspaces}
        />
      )}
    </div>
  );
}

// Export as default for main route
export default function HomePage() {
  return <HomePageContent />;
}

// Also export as named export for catch-all route
export { HomePageContent };
