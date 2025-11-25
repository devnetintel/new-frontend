"use client"

import { useState } from "react"
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

type UserState = "new_spoke" | "active_hub"

export default function Dashboard() {
    // DEV ONLY: State Simulator
    const [userState, setUserState] = useState<UserState>("active_hub")

    // Mock Data for Requests
    const requests = [
        {
            id: 1,
            to: "Sarah Chen",
            title: "VP of Engineering at TechFlow",
            status: "pending",
            date: "2 hours ago",
            hub: "Shubham"
        },
        {
            id: 2,
            to: "Michael Ross",
            title: "Founder at Stealth AI",
            status: "approved",
            date: "1 day ago",
            hub: "Ajay"
        },
        {
            id: 3,
            to: "Jessica Wu",
            title: "Product Lead at Stripe",
            status: "connected",
            date: "3 days ago",
            hub: "Shubham"
        }
    ]

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

                    <Link href="/search">
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

                <div className="grid gap-4">
                    {requests.map((req) => (
                        <Card key={req.id} className="hover:bg-muted/20 transition-colors border-border/50">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                                        {req.to.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{req.to}</h3>
                                        <p className="text-sm text-muted-foreground">{req.title}</p>
                                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                                            via {req.hub}'s Network • {req.date}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {req.status === 'pending' && (
                                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">
                                            <Clock className="w-3 h-3 mr-1" /> Pending
                                        </Badge>
                                    )}
                                    {req.status === 'approved' && (
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                                        </Badge>
                                    )}
                                    {req.status === 'connected' && (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                                            <UserPlus className="w-3 h-3 mr-1" /> Connected
                                        </Badge>
                                    )}
                                    <Button variant="ghost" size="sm">View</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
