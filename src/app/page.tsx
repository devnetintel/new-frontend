"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { Users, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceDiscoveryInline } from "@/components/voice-discovery-overlay";
import {
  fetchWorkspaces,
  WorkspaceInfo,
} from "@/services";
import { toast } from "sonner";
import {
  captureReferralFromUrl,
  processPendingWorkspace,
} from "@/utils/workspaceReferral";

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
  const [shouldAnimateInput, setShouldAnimateInput] = useState(false);
  const [showOverlayAfterAnimation, setShowOverlayAfterAnimation] =
    useState(false);

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

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const thinkingMessages = [
    "Analyzing request...",
    "Scanning networks...",
    "Identifying relevant skills...",
    "Ranking best matches...",
    "Curating introductions...",
  ];

  const handleSearch = async (searchQuery: string, sessionId?: string) => {
    setQuery(searchQuery);
    
    // Check if workspaces are selected
    if (selectedWorkspaceIds.length === 0) {
      toast.error("Please select at least one network to search");
      return;
    }
    
    // Navigate to results page with search parameters
    const params = new URLSearchParams({
      q: searchQuery,
      workspaces: selectedWorkspaceIds.join(","),
    });
    
    if (sessionId) {
      params.append("sessionId", sessionId);
    }
    
    router.push(`/results?${params.toString()}`);
  };

  const toggleWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceIds((prev) => {
      if (prev.includes(workspaceId)) {
        return prev.filter((id) => id !== workspaceId);
      } else {
        return [...prev, workspaceId];
      }
    });
  };

  const getGreeting = () => {
    const firstName = user?.firstName || "there";
    return `Hi ${firstName}, how can we help you?`;
  };


  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-9xl mx-auto">
      {/* Header / Initial State - Hide when conversation is active */}
      {!isVoiceDiscoveryOpen && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 mb-20">
          <h1 className="text-4xl md:text-5xl font-medium text-center tracking-tight text-foreground/90">
            {getGreeting()}
          </h1>

          {/* Network Selector */}
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Select Networks to Search
              </span>
            </div>
            {isLoadingWorkspaces ? (
              <div className="text-center text-muted-foreground py-8">
                Loading networks...
              </div>
            ) : (
              <div className="flex gap-2 md:gap-3 mb-6 flex-wrap">
                {workspaces.map((workspace, index) => {
                  const isSelected = selectedWorkspaceIds.includes(
                    workspace.id
                  );
                  const colorClasses = [
                    {
                      bg: "bg-blue-500/10",
                      border: "border-blue-500/50",
                      text: "text-blue-400",
                      dot: "bg-blue-500",
                    },
                    {
                      bg: "bg-green-500/10",
                      border: "border-green-500/50",
                      text: "text-green-400",
                      dot: "bg-green-500",
                    },
                    {
                      bg: "bg-purple-500/10",
                      border: "border-purple-500/50",
                      text: "text-purple-400",
                      dot: "bg-purple-500",
                    },
                    {
                      bg: "bg-orange-500/10",
                      border: "border-orange-500/50",
                      text: "text-orange-400",
                      dot: "bg-orange-500",
                    },
                    {
                      bg: "bg-pink-500/10",
                      border: "border-pink-500/50",
                      text: "text-pink-400",
                      dot: "bg-pink-500",
                    },
                  ];
                  const color = colorClasses[index % colorClasses.length];

                  return (
                    <button
                      key={workspace.id}
                      onClick={() => toggleWorkspace(workspace.id)}
                      className={cn(
                        "flex-1 min-w-[140px] md:min-w-[200px] p-2 md:p-4 rounded-lg md:rounded-xl border text-left transition-all duration-200",
                        isSelected
                          ? `${color.bg} ${color.border} shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]`
                          : "bg-card border-border/50 opacity-60 hover:opacity-100 hover:border-border hover:bg-muted/50 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-center justify-between mb-0.5 md:mb-1">
                        <span
                          className={cn(
                            "text-sm md:text-base font-semibold truncate",
                            isSelected ? color.text : "text-muted-foreground"
                          )}
                        >
                          {workspace.name}
                        </span>
                        {isSelected && (
                          <div
                            className={cn(
                              "h-3 w-3 md:h-4 md:w-4 rounded-full flex items-center justify-center shrink-0 ml-1",
                              color.dot
                            )}
                          >
                            <Check className="h-2 w-2 md:h-3 md:w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {workspace.profile_count} connections
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 w-full max-w-4xl mx-auto">
            <SearchInput
              onSearch={(query) => {
              setQuery(query);
              // On mobile, show immediately; on desktop, animate first
              if (window.innerWidth < 768) {
                setIsVoiceDiscoveryOpen(true);
                setShowOverlayAfterAnimation(true);
              } else {
                setShouldAnimateInput(true);
                // Delay showing overlay until animation completes
                setTimeout(() => {
                  setShowOverlayAfterAnimation(true);
                  setIsVoiceDiscoveryOpen(true);
                }, 600); // Match animation duration
              }
            }}
            animateToBottom={shouldAnimateInput}
            onAnimationComplete={() => {
              setShouldAnimateInput(false);
            }}
            isThinking={false}
            placeholder="Ask anything..."
          />
          </div>
        </div>
      )}

      {/* Voice Discovery Inline Component */}
      {showOverlayAfterAnimation && isVoiceDiscoveryOpen && (
        <VoiceDiscoveryInline
          isActive={isVoiceDiscoveryOpen}
          onClose={() => {
            setIsVoiceDiscoveryOpen(false);
            setShowOverlayAfterAnimation(false);
            setShouldAnimateInput(false);
            setQuery("");
          }}
          onSearch={(finalQuery, sessionId) => {
            setIsVoiceDiscoveryOpen(false);
            setShowOverlayAfterAnimation(false);
            setShouldAnimateInput(false);
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
