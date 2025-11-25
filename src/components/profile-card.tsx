import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, UserPlus } from "lucide-react"
import type { Connection } from "@/types"

export function ProfileCard({ profile, onConnect }: { profile: Connection; onConnect: (id: string) => void }) {
    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()

    // Get workspace name or use default
    const workspaceName = profile.workspace_id || "Network"

    return (
        <Card className="overflow-hidden border-transparent bg-card/50 shadow-none hover:shadow-md hover:border-border/50 transition-all duration-300 group">
            <CardContent className="p-6">
                {profile.workspace_id && (
                    <div className="flex items-start justify-between mb-4">
                        <div className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            {workspaceName}&apos;s Network
                        </div>
                    </div>
                )}

                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                            <AvatarImage src={profile.image || profile.picture_url} alt={profile.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-lg">{profile.name}</h3>
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
                    </div>
                </div>

                {profile.reason && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm border border-border/50">
                        <p className="font-semibold text-foreground/80 mb-2 text-xs uppercase tracking-wide">Why this match</p>
                        <p className="text-muted-foreground leading-loose">
                            {profile.reason.split(" ").map((word, i) => {
                                // Simple heuristic for highlighting keywords (longer words or capitalized)
                                const isKeyword = word.length > 5 || /^[A-Z]/.test(word);
                                return isKeyword ? (
                                    <span key={i} className="text-foreground font-medium bg-primary/10 px-0.5 rounded-sm">{word} </span>
                                ) : (
                                    <span key={i}>{word} </span>
                                )
                            })}
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-muted/20 p-4 flex justify-end">
                <Button size="sm" onClick={() => onConnect(profile.id)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Request Intro
                </Button>
            </CardFooter>
        </Card>
    )
}
