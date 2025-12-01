import { RequestCard, RequestData } from "./request-card"
import { Inbox } from "lucide-react"

interface RequestQueueProps {
    requests: RequestData[]
    isLoading: boolean
    onReview: (id: string) => void
    onDecline: (id: string) => void
}

export function RequestQueue({ requests, isLoading, onReview, onDecline }: RequestQueueProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Inbox className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">All caught up!</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                    You have no pending introduction requests. Enjoy your day!
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {requests.map((request) => (
                <RequestCard
                    key={request.id}
                    request={request}
                    onReview={onReview}
                    onDecline={onDecline}
                />
            ))}
        </div>
    )
}
