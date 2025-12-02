import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, Users, Zap } from "lucide-react"

interface ImpactHeaderProps {
    connectionsMade: number
    activeRequests: number
    userName: string
    greeting?: string
    connectionsMadeChange?: string
    potentialConnectionsThisMonth?: number
}

export function ImpactHeader({ 
    connectionsMade, 
    activeRequests, 
    userName,
    greeting,
    connectionsMadeChange,
    potentialConnectionsThisMonth
}: ImpactHeaderProps) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{greeting || `Good morning, ${userName}`}</h2>
                    <p className="text-muted-foreground">
                        You&apos;re the bridge for <span className="font-medium text-foreground">{potentialConnectionsThisMonth || (connectionsMade + activeRequests)} potential connections</span> this month.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/20 shadow-sm">
                    <CardContent className="p-4 md:p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Connections Made</span>
                            <Users className="h-4 w-4 text-primary opacity-70" />
                        </div>
                        <div className="mt-2">
                            <div className="text-3xl font-bold text-primary">{connectionsMade}</div>
                            {connectionsMadeChange && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    {connectionsMadeChange.includes("+") ? (
                                        <>
                                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                                            <span className="text-green-600 dark:text-green-400 font-medium">{connectionsMadeChange}</span>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">{connectionsMadeChange}</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-background border-border/50 shadow-sm">
                    <CardContent className="p-4 md:p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Active Requests</span>
                            <Zap className="h-4 w-4 text-yellow-500 opacity-70" />
                        </div>
                        <div className="mt-2">
                            <div className="text-3xl font-bold">{activeRequests}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Needs your attention
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

