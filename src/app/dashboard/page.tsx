"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Upload, Share2, Copy, Clock, CheckCircle2, XCircle, UserPlus, ChevronDown, Sparkles } from "lucide-react"
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
        const status = request.status.display

        if (status === "Connected") {
            return {
                label: "Connected",
                variant: "secondary" as const,
                className: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
                icon: <UserPlus className="w-3 h-3 mr-1" />
            }
        } else if (status === "Awaiting Target") {
            return {
                label: "Approved",
                variant: "secondary" as const,
                className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
                icon: <CheckCircle2 className="w-3 h-3 mr-1" />
            }
        } else if (status === "Declined") {
            return {
                label: "Declined",
                variant: "secondary" as const,
                className: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
                icon: <XCircle className="w-3 h-3 mr-1" />
            }
        } else {
            // "Sent to Hub" or other pending states
            return {
                label: "Pending",
                variant: "secondary" as const,
                className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20",
                icon: <Clock className="w-3 h-3 mr-1" />
            }
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-10 max-w-6xl">
            <header className="flex justify-between items-center border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your network and track introductions.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* DEV TOOL: State Simulator */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-dashed border-yellow-500/50 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10">
                                <Sparkles className="mr-2 h-3 w-3" />
                                Sim: {userState === "new_spoke" ? "New Spoke User" : "Active Hub User"}
                                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
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

                    <Link href="/">
                        <Button>
                            <Search className="mr-2 h-4 w-4" />
                            Search Network
                        </Button>
                    </Link>
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                        <span className="font-semibold text-primary">P</span>
                    </div>
                </div>
            </header>

            {/* HUB VIEW: Network Management */}
            <section className="rounded-2xl bg-muted/30 p-6 border border-border/40">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        My Network Hub
                    </h2>
                    {userState === "active_hub" && (
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            Hub Active
                        </Badge>
                    )}
                </div>

                {userState === "new_spoke" ? (
                    // COLLAPSED STATE: "Activate your Hub" Banner
                    <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg text-primary">Activate your Hub</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Upload your contacts to start generating Magic Links and helping your friends find intros.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="gap-2">
                                    <Upload className="h-4 w-4" />
                                    Sync Google Contacts
                                </Button>
                                <Button variant="default" className="gap-2" onClick={() => setUserState("active_hub")}>
                                    Upload CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // EXPANDED STATE: Full Stats & Tools
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Stats Card */}
                        <Card className="bg-background border-border/50 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Network Size</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">495</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    +12 new contacts this week
                                </p>
                                <div className="mt-4 flex gap-2 flex-wrap">
                                    <Badge variant="secondary" className="text-[10px]">Tech (60%)</Badge>
                                    <Badge variant="secondary" className="text-[10px]">Finance (25%)</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upload Card */}
                        <Card className="bg-background border-border/50 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Sync Contacts</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start text-xs h-9">
                                    <Upload className="mr-2 h-3 w-3" />
                                    Upload Google Contacts
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-xs h-9">
                                    <Upload className="mr-2 h-3 w-3" />
                                    Upload LinkedIn CSV
                                </Button>
                                <p className="text-[10px] text-muted-foreground text-center pt-1">
                                    Last synced: 2 days ago
                                </p>
                            </CardContent>
                        </Card>

                        {/* Magic Link Card */}
                        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Your Magic Link</CardTitle>
                                <CardDescription className="text-xs">Share access to your network.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 bg-background/80 p-2 rounded-md border border-border/50">
                                    <code className="text-xs flex-1 truncate text-muted-foreground">pni.ai/join?ref=piyush</code>
                                    <Button size="icon" variant="ghost" className="h-6 w-6">
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                                <Button className="w-full h-8 text-xs" variant="secondary">
                                    Copy Invite Link
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </section>

            {/* SPOKE VIEW: My Requests */}
            <section className="space-y-4 pt-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    My Requests
                </h2>

                {isLoadingRequests ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.length === 0 ? (
                            <Card className="rounded-xl p-8 text-center border-border/50">
                                <p className="text-muted-foreground">
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

                                return (
                                    <Card
                                        key={request.id}
                                        className="hover:bg-muted/20 transition-colors border-border/50"
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                                                    {request.target.picture_url ? (
                                                        <img
                                                            src={request.target.picture_url}
                                                            alt={request.target.name}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        initials
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">
                                                        {request.target.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {titleCompany || "Professional"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                                                        via {request.workspace.owner_name}&apos;s
                                                        Network • {timeAgo}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant={statusBadge.variant}
                                                    className={statusBadge.className}
                                                >
                                                    {statusBadge.icon}
                                                    {statusBadge.label}
                                                </Badge>
                                                <Button variant="ghost" size="sm">
                                                    View
                                                </Button>
                                            </div>
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
