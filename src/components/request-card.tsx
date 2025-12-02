import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ThumbsUp, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export interface RequestData {
    id: string
    requester: {
        name: string
        headline: string
        avatarUrl?: string
        historyCount: number
    }
    target: {
        name: string
        headline: string
        avatarUrl?: string
    }
    context: string // The draft note preview
    timestamp: string
    approval_token?: string // Token for approving/declining the request
}

interface RequestCardProps {
    request: RequestData
    onReview: (id: string) => void
    onDecline: (id: string) => void
}

export function RequestCard({ request, onReview, onDecline }: RequestCardProps) {
    const timeAgo = formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })

    return (
        <Card className="group hover:shadow-md transition-all duration-200 border-border/50 bg-background">
            <CardContent className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row gap-4 md:items-start">
                    {/* Left: Requester & Target Info */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            {/* Requester */}
                            <div className="flex items-center gap-2 min-w-0 max-w-[45%]">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-medium text-xs shrink-0">
                                    {request.requester.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold text-sm truncate">{request.requester.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{request.requester.headline}</div>
                                </div>
                            </div>

                            <div className="text-muted-foreground text-xs px-1">→</div>

                            {/* Target */}
                            <div className="flex items-center gap-2 min-w-0 max-w-[45%]">
                                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-300 font-medium text-xs shrink-0">
                                    {request.target.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold text-sm truncate">{request.target.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{request.target.headline}</div>
                                </div>
                            </div>
                        </div>

                        {/* Context Preview */}
                        <div className="bg-muted/30 rounded-lg p-3 relative">
                            <div className="absolute top-3 right-3">
                                <Badge variant="secondary" className="text-[10px] h-5 bg-background/50 backdrop-blur-sm">
                                    {request.requester.historyCount > 0 ? `Helped ${request.requester.historyCount}x` : "New Request"}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 pr-16 italic">
                                &quot;{request.context}&quot;
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Requested {timeAgo}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                        <Button
                            onClick={() => onReview(request.id)}
                            className="flex-1 md:w-32 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                            Review & Send
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => onDecline(request.id)}
                            className="flex-1 md:w-32 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            Decline
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

