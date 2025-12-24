"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ProfileCard } from "@/components/profile-card";
import { IntroRequestModal } from "@/components/intro-request-modal";
import { ProfileDetailModal } from "@/components/profile-detail-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  searchNetwork,
  transformPersonsToConnections,
  Connection,
  fetchWorkspaces,
  WorkspaceInfo,
} from "@/services";
import { markResultViewed } from "@/apis/search";
import { toast } from "sonner";
import { MobileBottomMenu } from "@/components/mobile-bottom-menu";
import { useUserContext } from "@/contexts/user-context";

function ResultsPageContent() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasSearchedRef = useRef(false);
  const searchKeyRef = useRef<string>("");

  const [isThinking, setIsThinking] = useState(true);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [results, setResults] = useState<Connection[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Connection | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalIndex, setDetailModalIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [originalQuery, setOriginalQuery] = useState("");
  const [workspaceIds, setWorkspaceIds] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isClarifying, setIsClarifying] = useState(false);
  const [clarifyingOptions, setClarifyingOptions] = useState<string[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [isHubUser, setIsHubUser] = useState<boolean | null>(null);
  const { requesterHasLinkedIn, setRequesterHasLinkedIn } = useUserContext();
  const viewedResultIds = useRef<Set<number>>(new Set());
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());

  const thinkingMessages = [
    "Analyzing request...",
    "Scanning networks...",
    "Identifying relevant skills...",
    "Ranking best matches...",
    "Curating introductions...",
  ];

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      router.push("/");
      return;
    }

    // Get search parameters from URL
    const queryParam = searchParams.get("q");
    const workspaceIdsParam = searchParams.get("workspaces");
    const sessionIdParam = searchParams.get("sessionId");
    const queryEditedParam = searchParams.get("queryEdited");

    if (!queryParam) {
      router.push("/");
      return;
    }

    // Create a unique key for this search to prevent duplicate calls
    const searchKey = `${queryParam}-${workspaceIdsParam}-${
      sessionIdParam || ""
    }`;

    // Only perform search if we haven't searched with this exact key before
    if (hasSearchedRef.current && searchKeyRef.current === searchKey) {
      return;
    }

    searchKeyRef.current = searchKey;
    hasSearchedRef.current = true;

    setQuery(queryParam);
    if (workspaceIdsParam) {
      setWorkspaceIds(workspaceIdsParam.split(","));
    }
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }

    // Perform search
    performSearch(
      queryParam,
      workspaceIdsParam?.split(",") || [],
      sessionIdParam || undefined,
      queryEditedParam === 'true'
    );
  }, [isLoaded, isSignedIn, router, searchParams]);

  const performSearch = async (
    searchQuery: string,
    workspaceIdsArray: string[],
    sessionIdParam?: string,
    queryEditedParam?: boolean
  ) => {
    setIsThinking(true);
    setResults([]);
    setThinkingStep(0);
    setIsClarifying(false);
    setOriginalQuery("");

    try {
      // Get token
      let token = await getToken();
      if (!token) {
        toast.error("Please sign in");
        setIsThinking(false);
        router.push("/");
        return;
      }

      if (workspaceIdsArray.length === 0) {
        toast.error("Please select at least one network to search");
        setIsThinking(false);
        router.push("/");
        return;
      }

      // Simulate thinking steps
      const stepDuration = 500;
      const totalSteps = Math.min(thinkingMessages.length, 3);
      for (let i = 0; i < totalSteps; i++) {
        setThinkingStep(i);
        await new Promise((resolve) => setTimeout(resolve, stepDuration));
      }

      // Call backend API
      let result;
      try {
        result = await searchNetwork(
          searchQuery,
          token,
          workspaceIdsArray,
          sessionIdParam,
          queryEditedParam
        );
      } catch (searchError) {
        // If we get a 401, check if user is still signed in and try again
        if (
          searchError instanceof Error &&
          searchError.message.includes("Authentication failed")
        ) {
          console.log("Token may be expired, checking authentication...");
          // Check if user is still signed in
          if (!isSignedIn) {
            throw new Error("Authentication failed. Please sign in again.");
          }
          // Try getting token again (Clerk may refresh it)
          token = await getToken();
          if (!token) {
            throw new Error("Authentication failed. Please sign in again.");
          }
          // Retry with new token
          result = await searchNetwork(
            searchQuery,
            token,
            workspaceIdsArray,
            sessionIdParam,
            queryEditedParam
          );
        } else {
          throw searchError;
        }
      }

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

      // Store requester_has_linkedin from API response
      if (result.requester_has_linkedin !== undefined) {
        setRequesterHasLinkedIn(result.requester_has_linkedin);
      }

      // Store is_hub_user from API response
      if (result.is_hub_user !== undefined) {
        console.log("is_hub_user from API response:", result.is_hub_user);
        setIsHubUser(result.is_hub_user);
      }

      if (connections.length === 0) {
        toast.info(
          "No matches found. Try a different query or select more networks."
        );
      }

      setIsThinking(false);
    } catch (error) {
      console.error("Search error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to search network";

      // Handle authentication errors specifically
      if (
        error instanceof Error &&
        errorMessage.includes("Authentication failed")
      ) {
        toast.error("Your session has expired. Please sign in again.");
        setIsThinking(false);
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
        return;
      }

      toast.error(errorMessage);
      setIsThinking(false);
    }
  };

  const handleClarification = (option: string) => {
    // Reset search tracking when starting a new search
    hasSearchedRef.current = false;
    searchKeyRef.current = "";

    // Update URL with new query and trigger search
    const params = new URLSearchParams({
      q: option,
      workspaces: workspaceIds.join(","),
    });

    if (sessionId) {
      params.set("sessionId", sessionId);
    }

    router.push(`/results?${params.toString()}`);
  };

  const handleConnect = (profileId: string) => {
    const profile = results.find((p) => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      setIsModalOpen(true);
    }
  };

  const handleViewResult = async (resultId: number) => {
    // Prevent duplicate calls for the same result_id
    if (viewedResultIds.current.has(resultId)) {
      return;
    }

    try {
      const token = await getToken();
      if (token) {
        // Mark as being processed to prevent duplicate calls
        viewedResultIds.current.add(resultId);
        await markResultViewed(resultId, token);
      }
    } catch (error) {
      // Remove from set on error so it can be retried
      viewedResultIds.current.delete(resultId);
      console.error("Failed to mark result as viewed:", error);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6 lg:p-8 w-full">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBackToHome}
        className="fixed top-4 left-4 md:left-20 z-40 rounded-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 text-muted-foreground hover:text-foreground gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>

      <div className="w-full space-y-8">
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
                Searching across {workspaceIds.length} connected networks...
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
              <div className="mb-4 mt-16 md:mt-20 p-4 bg-muted/30 rounded-xl border border-border/50">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10 xl:gap-8">
              {results.map((profile, index) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onConnect={() => handleConnect(profile.id)}
                  onReadMore={(profile) => {
                    setDetailModalIndex(index);
                    setIsDetailModalOpen(true);
                  }}
                  onViewResult={handleViewResult}
                  searchId={sessionId}
                  sentRequestIds={sentRequestIds}
                />
              ))}
            </div>
            {results.length === 0 && (
              <div className="text-center text-muted-foreground mt-12">
                No matches found in the selected networks. Try selecting more
                networks or a different query.
              </div>
            )}
          </div>
        )}
      </div>

      <IntroRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(profileId) => {
          const sentRequests = JSON.parse(localStorage.getItem('sentIntroRequests') || '[]');
          if (!sentRequests.includes(profileId)) {
            sentRequests.push(profileId);
            localStorage.setItem('sentIntroRequests', JSON.stringify(sentRequests));
          }
          // Update state to trigger immediate UI update
          setSentRequestIds(prev => new Set(prev).add(profileId));
        }}
        profile={selectedProfile}
        workspaceId={
          selectedProfile?.workspace_id ||
          (workspaceIds.length > 0 ? workspaceIds[0] : undefined)
        }
        workspaceName={
          selectedProfile?.workspace_id
            ? workspaces.find((w) => w.id === selectedProfile.workspace_id)
                ?.name
            : workspaceIds.length > 0
            ? workspaces.find((w) => w.id === workspaceIds[0])?.name
            : undefined
        }
        isHubUser={isHubUser}
        originalQuery={originalQuery || query}
        searchId={sessionId}
      />

      <ProfileDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        profiles={results}
        initialIndex={detailModalIndex}
        onRequestIntro={(profileId) => {
          const profile = results.find((p) => p.id === profileId);
          if (profile) {
            setSelectedProfile(profile);
            setIsDetailModalOpen(false);
            setIsModalOpen(true);
          }
        }}
        onViewResult={handleViewResult}
        sentRequestIds={sentRequestIds}
      />

      {/* Mobile Bottom Menu */}
      <MobileBottomMenu />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ResultsPageContent />
    </Suspense>
  );
}
