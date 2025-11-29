"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ProfileCard } from "@/components/profile-card";
import { IntroRequestModal } from "@/components/intro-request-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  searchNetwork,
  transformPersonsToConnections,
  Connection,
  fetchWorkspaces,
  WorkspaceInfo,
} from "@/services";
import { toast } from "sonner";
import { MobileBottomMenu } from "@/components/mobile-bottom-menu";

function ResultsPageContent() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isThinking, setIsThinking] = useState(true);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [results, setResults] = useState<Connection[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Connection | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [originalQuery, setOriginalQuery] = useState("");
  const [workspaceIds, setWorkspaceIds] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isClarifying, setIsClarifying] = useState(false);
  const [clarifyingOptions, setClarifyingOptions] = useState<string[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);

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

    if (!queryParam) {
      router.push("/");
      return;
    }

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
      sessionIdParam || undefined
    );
  }, [isLoaded, isSignedIn, router, searchParams]);

  const performSearch = async (
    searchQuery: string,
    workspaceIdsArray: string[],
    sessionIdParam?: string
  ) => {
    setIsThinking(true);
    setResults([]);
    setThinkingStep(0);
    setIsClarifying(false);
    setOriginalQuery("");

    try {
      const token = await getToken();
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
      const result = await searchNetwork(
        searchQuery,
        token,
        workspaceIdsArray,
        sessionIdParam
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
        toast.info(
          "No matches found. Try a different query or select more networks."
        );
      }

      setIsThinking(false);
    } catch (error) {
      console.error("Search error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to search network"
      );
      setIsThinking(false);
    }
  };

  const handleClarification = (option: string) => {
    performSearch(option, workspaceIds, sessionId);
  };

  const handleConnect = (profileId: string) => {
    const profile = results.find((p) => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      setIsModalOpen(true);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-9xl mx-auto">
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
      />

      {/* Mobile Bottom Menu */}
      <MobileBottomMenu />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  );
}
