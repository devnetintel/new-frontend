"use client"

import { useState } from "react"
import { SearchInput } from "@/components/search-input"
import { ProfileCard } from "@/components/profile-card"
import { IntroRequestModal } from "@/components/intro-request-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { MOCK_DB, Profile } from "@/lib/mock-data"
import { useHub } from "@/lib/hub-context"
import { Users, Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { VoiceDiscoveryInline } from "@/components/voice-discovery-overlay"

export default function SearchPage() {
    const [isThinking, setIsThinking] = useState(false)
    const [thinkingStep, setThinkingStep] = useState(0)
    const [results, setResults] = useState<Profile[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [query, setQuery] = useState("")
    const { selectedHubs, toggleHub } = useHub()

    const [isClarifying, setIsClarifying] = useState(false)
    const [clarifyingOptions, setClarifyingOptions] = useState<string[]>([])
    const [isVoiceDiscoveryOpen, setIsVoiceDiscoveryOpen] = useState(false)

    const thinkingMessages = [
        "Analyzing request...",
        "Scanning Shubham's network...",
        "Scanning Ajay's network...",
        "Identifying relevant skills...",
        "Ranking best matches...",
        "Curating introductions..."
    ]

    const handleSearch = async (searchQuery: string) => {
        setQuery(searchQuery)
        setIsThinking(true)
        setHasSearched(true)
        setResults([]) // Clear previous results
        setThinkingStep(0)
        setIsClarifying(false)

        // Simulate "Thinking" time with steps
        const stepDuration = 1000 // 1 second per step
        const totalSteps = thinkingMessages.length

        for (let i = 0; i < totalSteps; i++) {
            setThinkingStep(i)
            await new Promise(resolve => setTimeout(resolve, stepDuration))
        }

        // MOCK CLARIFYING QUESTION LOGIC
        // If query contains "founder", ask for clarification
        if (searchQuery.toLowerCase().includes("founder") && !isClarifying) {
            setIsThinking(false)
            setIsClarifying(true)
            setClarifyingOptions(["Founders in Fintech", "Founders in AI/ML", "Bootstrapped Founders"])
            return
        }

        // 1. Filter by Hub first
        const hubFiltered = MOCK_DB.filter((profile) => {
            return selectedHubs.includes(profile.hubId)
        })

        // 2. Filter by Query
        const lowerQuery = searchQuery.toLowerCase()
        const keywords = lowerQuery.split(" ").filter(k => k.length > 2)

        let matches = hubFiltered.filter((profile) => {
            const content = `${profile.name} ${profile.title} ${profile.company} ${profile.location} ${profile.matchReason}`.toLowerCase()
            return keywords.some(keyword => content.includes(keyword)) || content.includes(lowerQuery)
        }).map(profile => ({
            ...profile,
            matchReason: profile.matchReason + ` (Matches '${searchQuery}')`
        }))

        // 3. Fallback to ensure at least 5 results
        if (matches.length < 5 && hubFiltered.length > 0) {
            const remainingNeeded = 5 - matches.length
            const existingIds = new Set(matches.map(p => p.id))

            const fallbacks = hubFiltered
                .filter(p => !existingIds.has(p.id))
                .slice(0, remainingNeeded)
                .map(p => ({
                    ...p,
                    matchReason: p.matchReason + " (Simulated match for demo)"
                }))

            matches = [...matches, ...fallbacks]
        }

        setResults(matches)
        setIsThinking(false)
    }

    const handleClarification = (option: string) => {
        // Proceed with the clarified option
        handleSearch(option)
    }

    const handleConnect = (id: string) => {
        const profile = results.find((p) => p.id === id)
        if (profile) {
            setSelectedProfile(profile)
            setIsModalOpen(true)
        }
    }

    const getGreeting = () => {
        return "Hi Piyush, how can we help you?"
    }

    return (
        <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
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
                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() => toggleHub('shubham')}
                                className={cn(
                                    "flex-1 p-4 rounded-xl border text-left transition-all duration-200",
                                    selectedHubs.includes('shubham')
                                        ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                        : "bg-card border-border/50 hover:border-border hover:bg-muted/50 opacity-60"
                                )}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={cn("font-semibold", selectedHubs.includes('shubham') ? "text-blue-400" : "text-muted-foreground")}>
                                        Shubham's Network
                                    </span>
                                    {selectedHubs.includes('shubham') && (
                                        <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">453 connections</p>
                            </button>

                            <button
                                onClick={() => toggleHub('ajay')}
                                className={cn(
                                    "flex-1 p-4 rounded-xl border text-left transition-all duration-200",
                                    selectedHubs.includes('ajay')
                                        ? "bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                                        : "bg-card border-border/50 hover:border-border hover:bg-muted/50 opacity-60"
                                )}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={cn("font-semibold", selectedHubs.includes('ajay') ? "text-green-400" : "text-muted-foreground")}>
                                        Ajay's Network
                                    </span>
                                    {selectedHubs.includes('ajay') && (
                                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">495 connections</p>
                            </button>

                            {/* Option 1: The "Empty Seat" Effect */}
                            <button
                                className="flex-1 p-4 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-all duration-200 group"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                                        Your Network
                                    </span>
                                    <div className="h-4 w-4 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10">
                                        <Plus className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground/70 group-hover:text-primary/70">Add to search...</p>
                            </button>
                        </div>
                    </div>

                    <SearchInput
                        onSearch={(query) => {
                            // Open voice discovery with initial query
                            setQuery(query)
                            setIsVoiceDiscoveryOpen(true)
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
                        setIsVoiceDiscoveryOpen(false)
                        setQuery("")
                    }}
                    onSearch={(finalQuery) => {
                        setIsVoiceDiscoveryOpen(false)
                        setQuery("")
                        handleSearch(finalQuery)
                    }}
                    initialQuery={query}
                    selectedNetworks={selectedHubs}
                />
            )}

            {/* Search Results State */}
            {hasSearched && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Sticky Search Bar for Follow-up */}
                    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-border/10">
                        <div className="max-w-6xl mx-auto">
                            <p className="text-2xl font-medium mb-4 text-foreground/80">{query}</p>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto space-y-8">
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
                                        {thinkingMessages[thinkingStep]}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Searching across {selectedHubs.length} connected networks...
                                    </p>
                                </div>
                            </div>
                        ) : isClarifying ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-medium">I found a few different types of matches.</h2>
                                    <p className="text-muted-foreground">To give you the best results, could you clarify?</p>
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
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <span className="text-sm font-medium uppercase tracking-wider">Sources</span>
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
                                        No matches found in the selected networks. Try selecting more networks or a different query.
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
            />

        </div>
    )
}
