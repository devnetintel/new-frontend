"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useUser } from "@clerk/nextjs"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Upload, Share2, Copy, Clock, CheckCircle2, XCircle, UserPlus, ChevronDown, Sparkles, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchMyRequests, type IntroRequest } from "@/services"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

type UserState = "new_spoke" | "active_hub"

export default function Dashboard() {
    const { isSignedIn, isLoaded, getToken } = useAuth()
    const { user } = useUser()
    const router = useRouter()
    // DEV ONLY: State Simulator
    const [userState, setUserState] = useState<UserState>("active_hub")
    const [requests, setRequests] = useState<IntroRequest[]>([])
    const [isLoadingRequests, setIsLoadingRequests] = useState(true)
    const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null)

    useEffect(() => {
        if (isLoaded) {
            if (!isSignedIn) {
                router.push("/sign-in")
            }
        }
    }, [isLoaded, isSignedIn, router])

    // Fetch requests from API
    useEffect(() => {
        const loadRequests = async () => {
            if (!isSignedIn || !user?.id) {
                setIsLoadingRequests(false)
                return
            }

            try {
                setIsLoadingRequests(true)
                const token = await getToken()
                if (!token) {
                    setIsLoadingRequests(false)
                    return
                }

                const data = await fetchMyRequests(token, {
                    limit: 20,
                    offset: 0,
                })

                setRequests(data.requests)
            } catch (error) {
                console.error("Failed to load requests:", error)
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to load requests"
                )
            } finally {
                setIsLoadingRequests(false)
            }
        }

        if (isLoaded && isSignedIn) {
            loadRequests()
        }
    }, [isLoaded, isSignedIn, user?.id, getToken])

    if (!isLoaded || !isSignedIn) {
        return null
    }

    // Helper functions
    const getTimeAgo = (timestamp: string | null) => {
        if (!timestamp) return "Unknown"
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
        } catch {
            return "Unknown"
        }
    }

    const getStatusBadge = (request: IntroRequest) => {
        const h1Approval = request.status.h1_approval?.toLowerCase() || ""
        const s2Consent = request.status.s2_consent?.toLowerCase() || ""
        const hubName = request.workspace.owner_name || "Hub"
        
        // Both approved = Connected
        if ((h1Approval === "approved" || h1Approval === "consented") && 
            (s2Consent === "approved" || s2Consent === "consented")) {
            return {
                label: "Connected",
                variant: "secondary" as const,
                className: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
                icon: <UserPlus className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
            }
        }
        
        // Hub approved but s2 not yet = Hub name + approved
        if (h1Approval === "approved" || h1Approval === "consented") {
            // Get first name from hub name
            const hubFirstName = hubName.split(" ")[0] || hubName
            return {
                label: `${hubFirstName} approved`,
                variant: "secondary" as const,
                className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
                icon: <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
            }
        }
        
        // Declined
        if (h1Approval === "declined" || s2Consent === "declined" || 
            request.status.display === "Declined") {
            return {
                label: "Declined",
                variant: "secondary" as const,
                className: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
                icon: <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
            }
        }
        
        // Default: Pending (both not approved)
        return {
            label: "Pending",
            variant: "secondary" as const,
            className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20",
            icon: <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
        }
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-3 md:px-6 py-3 md:py-6 space-y-6 md:space-y-10 box-border min-w-0">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0 border-b border-border/40 pb-4 md:pb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-0.5 md:mb-1">Dashboard</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Manage your network and track introductions.</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                    {/* DEV TOOL: State Simulator - Hidden on mobile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 md:h-8 text-xs md:text-sm border-dashed border-yellow-500/50 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 hidden md:flex shrink-0">
                                <Sparkles className="mr-1.5 md:mr-2 h-3 w-3" />
                                <span className="hidden lg:inline">Sim: {userState === "new_spoke" ? "New Spoke User" : "Active Hub User"}</span>
                                <span className="lg:hidden">Sim</span>
                                <ChevronDown className="ml-1.5 md:ml-2 h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setUserState("new_spoke")}>
                                New Spoke User (No Uploads)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setUserState("active_hub")}>
                                Active Hub User (Has Network)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href="/" className="shrink-0">
                        <Button size="sm" className="h-7 md:h-10 text-xs md:text-sm whitespace-nowrap">
                            <Search className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Search Network</span>
                            <span className="sm:hidden">Search</span>
                        </Button>
                    </Link>
                    <UserMenu afterSignOutUrl="/sign-in" />
                </div>
            </header>

            {/* HUB VIEW: Network Management */}
            <section className="rounded-xl md:rounded-2xl bg-muted/30 p-3 md:p-6 border border-border/40 w-full box-border">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-semibold flex items-center gap-1.5 md:gap-2">
                        <Share2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        My Network Hub
                    </h2>
                    {userState === "active_hub" && (
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                            Hub Active
                        </Badge>
                    )}
                </div>

                {userState === "new_spoke" ? (
                    // COLLAPSED STATE: "Activate your Hub" Banner
                    <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
                        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-1 min-w-0 flex-1">
                                <h3 className="font-semibold text-base md:text-lg text-primary">Activate your Hub</h3>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Upload your contacts to start generating Magic Links and helping your friends find intros.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 shrink-0">
                                <Button variant="outline" className="gap-2 text-xs md:text-sm h-8 md:h-10">
                                    <Upload className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    <span className="hidden sm:inline">Sync Google Contacts</span>
                                    <span className="sm:hidden">Google Contacts</span>
                                </Button>
                                <Button variant="default" className="gap-2 text-xs md:text-sm h-8 md:h-10" onClick={() => setUserState("active_hub")}>
                                    <Upload className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    Upload CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // EXPANDED STATE: Full Stats & Tools
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Stats Card */}
                        <Card className="bg-background border-border/50 shadow-sm">
                            <CardHeader className="pb-1.5 md:pb-2 p-3 md:p-6">
                                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Network Size</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 md:p-6 pt-0">
                                <div className="text-2xl md:text-3xl font-bold">495</div>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                                    +12 new contacts this week
                                </p>
                                <div className="mt-3 md:mt-4 flex gap-1.5 md:gap-2 flex-wrap">
                                    <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1.5 py-0.5">Tech (60%)</Badge>
                                    <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1.5 py-0.5">Finance (25%)</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upload Card */}
                        <Card className="bg-background border-border/50 shadow-sm">
                            <CardHeader className="pb-1.5 md:pb-2 p-3 md:p-6">
                                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Sync Contacts</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 md:space-y-3 p-3 md:p-6 pt-0">
                                <Button variant="outline" className="w-full justify-start text-[10px] md:text-xs h-8 md:h-9">
                                    <Upload className="mr-1.5 md:mr-2 h-3 w-3" />
                                    <span className="hidden sm:inline">Upload Google Contacts</span>
                                    <span className="sm:hidden">Google Contacts</span>
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-[10px] md:text-xs h-8 md:h-9">
                                    <Upload className="mr-1.5 md:mr-2 h-3 w-3" />
                                    <span className="hidden sm:inline">Upload LinkedIn CSV</span>
                                    <span className="sm:hidden">LinkedIn CSV</span>
                                </Button>
                                <p className="text-[9px] md:text-[10px] text-muted-foreground text-center pt-0.5 md:pt-1">
                                    Last synced: 2 days ago
                                </p>
                            </CardContent>
                        </Card>

                        {/* Magic Link Card */}
                        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-sm">
                            <CardHeader className="pb-1.5 md:pb-2 p-3 md:p-6">
                                <CardTitle className="text-xs md:text-sm font-medium text-primary">Your Magic Link</CardTitle>
                                <CardDescription className="text-[10px] md:text-xs">Share access to your network.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 md:space-y-3 p-3 md:p-6 pt-0">
                                <div className="flex items-center gap-1.5 md:gap-2 bg-background/80 p-1.5 md:p-2 rounded-md border border-border/50 min-w-0">
                                    <code className="text-[10px] md:text-xs flex-1 truncate text-muted-foreground min-w-0">pni.ai/join?ref=piyush</code>
                                    <Button size="icon" variant="ghost" className="h-5 w-5 md:h-6 md:w-6 shrink-0">
                                        <Copy className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                    </Button>
                                </div>
                                <Button className="w-full h-7 md:h-8 text-[10px] md:text-xs" variant="secondary">
                                    Copy Invite Link
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </section>

            {/* SPOKE VIEW: My Requests */}
            <section className="space-y-3 md:space-y-4 pt-2 md:pt-4 w-full box-border">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-1.5 md:gap-2">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    My Requests
                </h2>

                {isLoadingRequests ? (
                    <div className="flex items-center justify-center py-8 md:py-12">
                        <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 md:gap-4 w-full">
                        {requests.length === 0 ? (
                            <Card className="rounded-lg md:rounded-xl p-6 md:p-8 text-center border-border/50 w-full box-border">
                                <p className="text-sm md:text-base text-muted-foreground">
                                    You haven&apos;t made any introduction requests yet.
                                </p>
                            </Card>
                        ) : (
                            requests.map((request) => {
                                const statusBadge = getStatusBadge(request)
                                const timeAgo = getTimeAgo(request.timestamps.created_at)
                                const titleCompany = [
                                    request.target.title,
                                    request.target.company,
                                ]
                                    .filter(Boolean)
                                    .join(" at ")

                                const initials = request.target.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()

                                const isExpanded = expandedRequestId === request.id
                                const hubName = request.workspace.owner_name || "Hub"
                                const hubFirstName = hubName.split(" ")[0] || hubName
                                const s2Name = request.target.name
                                const s2FirstName = s2Name.split(" ")[0] || s2Name
                                
                                const h1Approval = request.status.h1_approval?.toLowerCase() || ""
                                const s2Consent = request.status.s2_consent?.toLowerCase() || ""
                                
                                const isHubApproved = h1Approval === "approved" || h1Approval === "consented"
                                const isS2Connected = (s2Consent === "approved" || s2Consent === "consented") && isHubApproved

                                return (
                                    <Card
                                        key={request.id}
                                        className="hover:bg-muted/20 transition-colors border-border/50 w-full box-border cursor-pointer"
                                        onClick={() => setExpandedRequestId(isExpanded ? null : request.id)}
                                    >
                                        <CardContent className="p-3 md:p-4 flex flex-col gap-3 w-full box-border">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-muted flex items-center justify-center text-xs md:text-sm font-medium flex-shrink-0">
                                                        {request.target.picture_url ? (
                                                            <img
                                                                src={request.target.picture_url}
                                                                alt={request.target.name}
                                                                className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            initials
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 overflow-hidden">
                                                        <h3 className="font-medium text-sm md:text-base truncate">
                                                            {request.target.name}
                                                        </h3>
                                                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                                                            {titleCompany || "Professional"}
                                                        </p>
                                                        <p className="text-[10px] md:text-xs text-muted-foreground/70 mt-0.5 truncate">
                                                            via {request.workspace.owner_name}&apos;s Network • {timeAgo}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                                                    <Badge
                                                        variant={statusBadge.variant}
                                                        className={`${statusBadge.className} text-[10px] md:text-xs px-2 md:px-2.5 py-0.5 whitespace-nowrap`}
                                                    >
                                                        {statusBadge.icon}
                                                        <span className="whitespace-nowrap">{statusBadge.label}</span>
                                                    </Badge>
                                                    <div className="ml-auto sm:ml-0">
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Timeline View */}
                                            {isExpanded && (
                                                <div className="pt-3 border-t border-border/50 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="flex flex-col gap-4">
                                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                                            Timeline
                                                        </h4>
                                                        
                                                        {/* Request Created */}
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex flex-col items-center pt-0.5">
                                                                <div className={`h-2.5 w-2.5 rounded-full border-2 ${true ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/30'}`} />
                                                                <div className={`w-0.5 h-10 mt-1 ${isHubApproved ? 'bg-primary' : 'bg-border'}`} />
                                                            </div>
                                                            <div className="flex-1 pt-0.5">
                                                                <p className={`text-sm font-medium ${true ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                                    Request sent
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    {getTimeAgo(request.timestamps.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Hub Approval */}
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex flex-col items-center pt-0.5">
                                                                <div className={`h-2.5 w-2.5 rounded-full border-2 ${isHubApproved ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/30'}`} />
                                                                <div className={`w-0.5 h-10 mt-1 ${isS2Connected ? 'bg-primary' : 'bg-border'}`} />
                                                            </div>
                                                            <div className="flex-1 pt-0.5">
                                                                <p className={`text-sm font-medium ${isHubApproved ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                                    {hubFirstName} approved
                                                                </p>
                                                                {isHubApproved && request.timestamps.h1_approved_at ? (
                                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                                        {getTimeAgo(request.timestamps.h1_approved_at)}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-xs text-muted-foreground/70 mt-0.5 italic">
                                                                        Waiting for approval...
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* S2 Connected */}
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex flex-col items-center pt-0.5">
                                                                <div className={`h-2.5 w-2.5 rounded-full border-2 ${isS2Connected ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/30'}`} />
                                                            </div>
                                                            <div className="flex-1 pt-0.5">
                                                                <p className={`text-sm font-medium ${isS2Connected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                                    {s2FirstName} connected
                                                                </p>
                                                                {isS2Connected && request.timestamps.s2_consented_at ? (
                                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                                        {getTimeAgo(request.timestamps.s2_consented_at)}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-xs text-muted-foreground/70 mt-0.5 italic">
                                                                        Waiting for connection...
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                )}
            </section>
        </div>
    )
}
