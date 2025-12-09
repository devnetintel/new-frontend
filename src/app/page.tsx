"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { SearchInput } from "@/components/search-input";
import { ProfileCard } from "@/components/profile-card";
import { IntroRequestModal } from "@/components/intro-request-modal";
import { Button } from "@/components/ui/button";
import { Users, Check, Plus, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VoiceDiscoveryInline } from "@/components/voice-discovery-overlay";
import { NetworkFilter } from "@/components/network-filter";
import { InspirationDeck } from "@/components/inspiration-deck";
import { GuardiansHeader } from "@/components/guardians-header";
import { RitualDisplay } from "@/components/ritual-display";

import { captureReferralFromUrl, processPendingWorkspace } from "@/utils/workspaceReferral";
import { fetchWorkspaces } from "@/apis/workspaces";
import { searchNetwork } from "@/apis/search";
import { transformPersonsToConnections } from "@/services/transformers";
import { Connection, WorkspaceInfo } from "@/types/connection";

function HomePageContent() {
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [query, setQuery] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingStep, setThinkingStep] = useState(0);
    const [results, setResults] = useState<Connection[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isClarifying, setIsClarifying] = useState(false);
    const [clarifyingOptions, setClarifyingOptions] = useState<string[]>([]);
    const [originalQuery, setOriginalQuery] = useState("");
    const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
    const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<string[]>([]);
    const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
    const [isSpotlight, setIsSpotlight] = useState(false);
    const [isVoiceDiscoveryOpen, setIsVoiceDiscoveryOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Connection | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Kept this as it was not explicitly removed by the instruction.

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
                    const ownerName = result.workspace.name.split("'")[0];
                    if (!result.already_had_access) {
                        toast.success(
                            `You now have access to ${ownerName}'s Network!`
                        );
                    } else {
                        toast.info(
                            `You already have access to ${ownerName}'s Network`
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
        setIsSpotlight(false); // Turn off spotlight when searching starts

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

            // THE RITUAL: Enforce minimum 3-second wait
            const startTime = Date.now();

            // Call backend API in parallel with the wait
            const searchPromise = searchNetwork(
                searchQuery,
                token,
                selectedWorkspaceIds,
                sessionId
            );

            // Wait for at least 3 seconds (The Ritual)
            await new Promise((resolve) => setTimeout(resolve, 3500));

            const result = await searchPromise;

            // Check if clarification is needed
            if (
                result.metadata.workflow_status === "clarification_needed" ||
                (result.success && result.profiles.length === 0 && !result.metadata.filters?.original_query)
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
                // Supportive "No results" message
                // Get the name of the first workspace owner for the message
                const ownerName = workspaces.find(w => w.id === selectedWorkspaceIds[0])?.name.split("'")[0] || "our";
                toast.info(`We couldn't find a perfect match in ${ownerName}'s current network. Try broadening your description.`);
            } else {
                toast.success(
                    `Found ${connections.length} ${connections.length === 1 ? "match" : "matches"
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

    const handleBackToHome = () => {
        setHasSearched(false);
        setQuery("");
        setResults([]);
        setIsSpotlight(false);
        setOriginalQuery("");
    };

    const handleConnect = (profileId: string) => {
        const profile = results.find((p) => p.id === profileId);
        if (profile) {
            setSelectedProfile(profile);
            setIsModalOpen(true);
        }
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

    const handleClarification = (option: string) => {
        setQuery(option);
        handleSearch(option);
    };

    return (
        <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-5xl mx-auto font-sans relative">
            {/* Spotlight Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/20 backdrop-blur-[1px] z-0 transition-opacity duration-500 pointer-events-none",
                    isSpotlight ? "opacity-100" : "opacity-0"
                )}
            />

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
                <div className="flex-1 flex flex-col items-center justify-center space-y-12 mb-20 animate-in fade-in duration-700 z-10 relative">
                    {/* Guardians Header */}
                    <GuardiansHeader
                        workspaces={workspaces}
                        userName={user?.firstName || "there"}
                    />

                    {/* Network Selector (Optional: Hide in spotlight mode for cleaner focus?) */}
                    <div className={cn("w-full max-w-2xl transition-opacity duration-300", isSpotlight ? "opacity-50" : "opacity-100")}>
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
                                setIsSpotlight(false); // Turn off spotlight when opening voice discovery
                                // Always trigger voice discovery / inquiry mode
                                setIsVoiceDiscoveryOpen(true);
                            }}
                            isThinking={isThinking}
                            onFocus={() => setIsSpotlight(true)}
                            onBlur={() => setIsSpotlight(false)}
                        // placeholder is handled in component
                        />
                    </div>

                    {/* Inspiration Deck */}
                    <div className={cn("w-full max-w-3xl animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 transition-opacity duration-300", isSpotlight ? "opacity-0 pointer-events-none" : "opacity-100")}>
                        <InspirationDeck onSelect={(q) => {
                            setQuery(q);
                            setIsSpotlight(false); // Turn off spotlight when opening voice discovery
                            // Always trigger voice discovery / inquiry mode
                            setIsVoiceDiscoveryOpen(true);
                        }} />
                    </div>
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
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full z-10">
                    {/* Sticky Search Bar for Follow-up */}
                    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-border/10">
                        <div className="max-w-5xl mx-auto flex items-center justify-between">
                            <p className="text-xl font-medium text-foreground/80 truncate max-w-2xl">
                                {query}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                    Searching {selectedWorkspaceIds.length} networks
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-8">
                        {isThinking ? (
                            <RitualDisplay connectorNames={workspaces.filter(w => selectedWorkspaceIds.includes(w.id)).map(w => w.name.split("'")[0])} />
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

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {deduplicateResults(results).map((profile) => (
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
                // Pass null to force the "Missing Info" check for demonstration/verification
                // In real app: user?.publicMetadata?.linkedin as string
                userLinkedin={null}
            />
        </div>
    );
}

function deduplicateResults(results: Connection[]): Connection[] {
    const seen = new Set<string>();
    return results.filter((profile) => {
        if (seen.has(profile.id)) {
            return false;
        }
        seen.add(profile.id);
        return true;
    });
}

// Export as default for main route
export default function HomePage() {
    return <HomePageContent />;
}

// Also export as named export for catch-all route
export { HomePageContent };
