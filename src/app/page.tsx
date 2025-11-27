"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { SearchInput } from "@/components/search-input";
import { ProfileCard } from "@/components/profile-card";
import { IntroRequestModal } from "@/components/intro-request-modal";
import { Button } from "@/components/ui/button";
import { Users, Check, Plus, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceDiscoveryInline } from "@/components/voice-discovery-overlay";
import {
  searchNetwork,
  fetchWorkspaces,
  transformPersonsToConnections,
  Connection,
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
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [results, setResults] = useState<Connection[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Connection | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<string[]>(
    []
  );
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [isClarifying, setIsClarifying] = useState(false);
  const [clarifyingOptions, setClarifyingOptions] = useState<string[]>([]);
  const [isVoiceDiscoveryOpen, setIsVoiceDiscoveryOpen] = useState(false);
  const [originalQuery, setOriginalQuery] = useState<string>("");

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
    setIsThinking(true);
    setHasSearched(true);
    setResults([]);
    setThinkingStep(0);
    setIsClarifying(false);
    setOriginalQuery("");

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Please sign in");
        setIsThinking(false);
        return;
      }

      // Check if workspaces are selected
      if (selectedWorkspaceIds.length === 0) {
        toast.error("Please select at least one network to search");
        setIsThinking(false);
        return;
      }

      // Simulate thinking steps (can be removed if not needed)
      const stepDuration = 500;
      const totalSteps = Math.min(thinkingMessages.length, 3);
      for (let i = 0; i < totalSteps; i++) {
        setThinkingStep(i);
        await new Promise((resolve) => setTimeout(resolve, stepDuration));
      }

      // Call backend API with session_id if available
      const result = await searchNetwork(
        searchQuery,
        token,
        selectedWorkspaceIds,
        sessionId
      );

      // Check if clarification is needed
      if (
        result.metadata.workflow_status === "clarification_needed" ||
        (result.success && result.profiles.length === 0)
      ) {
        setIsThinking(false);
        setIsClarifying(true);
        setClarifyingOptions([
          result.response || "Could you provide more details?",
        ]);
        return;
      }

      // Transform backend results to Connection format
      const connections = transformPersonsToConnections(result.profiles, 2);
      setResults(connections);

      // Store original query from API
      if (result.metadata?.filters?.original_query) {
        setOriginalQuery(result.metadata.filters.original_query);
      }

      if (connections.length === 0) {
        toast.info("No matches found. Try different keywords.");
      } else {
        toast.success(
          `Found ${connections.length} ${
            connections.length === 1 ? "match" : "matches"
          }`
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to search network"
      );
    } finally {
      setIsThinking(false);
    }
  };

  const handleClarification = (option: string) => {
    handleSearch(option);
  };

  const handleConnect = (id: string) => {
    const profile = results.find((p) => p.id === id);
    if (profile) {
      setSelectedProfile(profile);
      setIsModalOpen(true);
    }
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

  const handleBackToHome = () => {
    setHasSearched(false);
    setResults([]);
    setQuery("");
    setOriginalQuery("");
    setIsClarifying(false);
    setIsVoiceDiscoveryOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-9xl mx-auto">
      {/* Back to Home Button - Only show when search results are displayed */}
      {hasSearched && (
        <Button
          onClick={handleBackToHome}
          variant="outline"
          size="sm"
          className="fixed top-4 right-20 z-50 rounded-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Button>
      )}
      {/* Header / Initial State - Hide when conversation is active */}
      {!hasSearched && !isVoiceDiscoveryOpen && (
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
              <div className="flex gap-3 mb-6 flex-wrap">
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
                        "flex-1 min-w-[200px] p-4 rounded-xl border text-left transition-all duration-200",
                        isSelected
                          ? `${color.bg} ${color.border} shadow-[0_0_15px_rgba(59,130,246,0.15)]`
                          : "bg-card border-border/50 hover:border-border hover:bg-muted/50 opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            "font-semibold",
                            isSelected ? color.text : "text-muted-foreground"
                          )}
                        >
                          {workspace.name}
                        </span>
                        {isSelected && (
                          <div
                            className={cn(
                              "h-4 w-4 rounded-full flex items-center justify-center",
                              color.dot
                            )}
                          >
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {workspace.profile_count} connections
                      </p>
                    </button>
                  );
                })}

                {/* Add Network Button */}
                <button className="flex-1 min-w-[200px] p-4 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-all duration-200 group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                      Your Network
                    </span>
                    <div className="h-4 w-4 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10">
                      <Plus className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground/70 group-hover:text-primary/70">
                    Add to search...
                  </p>
                </button>
              </div>
            )}
          </div>

          <SearchInput
            onSearch={(query) => {
              setQuery(query);
              setIsVoiceDiscoveryOpen(true);
            }}
            isThinking={isThinking}
            placeholder="Ask anything..."
          />
        </div>
      )}

      {/* Voice Discovery Inline Component */}
      {isVoiceDiscoveryOpen && !hasSearched && (
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

      {/* Search Results State */}
      {hasSearched && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Sticky Search Bar for Follow-up */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-border/10">
            <div className="max-w-9xl mx-auto">
              <p className="text-2xl font-medium mb-4 text-foreground/80">
                {query}
              </p>
            </div>
          </div>

          <div className="max-w-8xl mx-auto space-y-8">
            {isThinking ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-medium text-foreground animate-pulse">
                    {thinkingMessages[thinkingStep] ||
                      thinkingMessages[thinkingMessages.length - 1]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Searching across {selectedWorkspaceIds.length} connected
                    networks...
                  </p>
                </div>
              </div>
            ) : isClarifying ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-medium">
                    I found a few different types of matches.
                  </h2>
                  <p className="text-muted-foreground">
                    To give you the best results, could you clarify?
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {clarifyingOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleClarification(option)}
                      className="px-6 py-3 rounded-full bg-secondary hover:bg-primary/20 hover:text-primary border border-border transition-all duration-200 text-sm font-medium"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {originalQuery && (
                  <div className="mb-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Original Query
                    </p>
                    <p className="text-base font-medium text-foreground">
                      {originalQuery}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <span className="text-sm font-medium uppercase tracking-wider">
                    Sources
                  </span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      onConnect={() => handleConnect(profile.id)}
                    />
                  ))}
                </div>
                {results.length === 0 && (
                  <div className="text-center text-muted-foreground mt-12">
                    No matches found in the selected networks. Try selecting
                    more networks or a different query.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <IntroRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={selectedProfile}
        workspaceId={
          selectedProfile?.workspace_id ||
          (selectedWorkspaceIds.length > 0
            ? selectedWorkspaceIds[0]
            : undefined)
        }
        workspaceName={
          selectedProfile?.workspace_id
            ? workspaces.find((w) => w.id === selectedProfile.workspace_id)
                ?.name
            : selectedWorkspaceIds.length > 0
            ? workspaces.find((w) => w.id === selectedWorkspaceIds[0])?.name
            : undefined
        }
      />
    </div>
  );
}

// Export as default for main route
export default function HomePage() {
  return <HomePageContent />;
}

// Also export as named export for catch-all route
export { HomePageContent };
