"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, UserPlus, Linkedin } from "lucide-react"
import type { Connection } from "@/types"

export function ProfileCard({ profile, onConnect }: { profile: Connection; onConnect: (id: string) => void }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()

    // Mock multi-source logic (since backend doesn't support it yet)
    // In a real implementation, `profile` would have a `sources` array
    const sources = profile.workspace_id ? [profile.workspace_id] : []
    const primarySource = sources[0] || "Network"
    const additionalSourcesCount = sources.length - 1

    return (
        <Card className="overflow-hidden border-transparent bg-card/50 shadow-none hover:shadow-md hover:border-border/50 transition-all duration-300 group flex flex-col h-full relative">
            {/* Source Badge */}
            <div className="absolute top-4 right-4 z-10">
                <div className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-help" title={additionalSourcesCount > 0 ? `Also found via ${additionalSourcesCount} other networks` : undefined}>
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    via {primarySource} {additionalSourcesCount > 0 && `+ ${additionalSourcesCount}`}
                </div>
            </div>

            <CardContent className="p-8 flex-1 flex flex-col pt-12">
                <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-sm mb-4">
                        <AvatarImage src={profile.image || profile.picture_url} alt={profile.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex items-center justify-center gap-2 w-full">
                        <h3 className="font-bold text-xl truncate max-w-[200px]">{profile.name}</h3>
                        {profile.linkedin && (
                            <a
                                href={profile.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 p-1 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                                aria-label={`View ${profile.name}'s LinkedIn profile`}
                            >
                                <Linkedin className="h-4 w-4" />
                            </a>
                        )}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Briefcase className="mr-1 h-3 w-3" />
                        {profile.title} {profile.company ? `at ${profile.company}` : ""}
                    </div>
                    {profile.location && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="mr-1 h-3 w-3" />
                            {profile.location}
                        </div>
                    )}
                </div>

                {profile.reason && (
                    <div className="mt-auto p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                                <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-primary text-xs uppercase tracking-wide">Match Reasoning</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {(isExpanded || profile.reason.length <= 150
                                ? profile.reason
                                : profile.reason.substring(0, 150) + "..."
                            )}
                        </p>
                        {profile.reason.length > 150 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                {isExpanded ? "Read Less" : "Read More"}
                            </button>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <Button className="w-full font-medium" onClick={() => onConnect(profile.id)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Request Intro
                </Button>
            </CardFooter>
        </Card>
    )
}
