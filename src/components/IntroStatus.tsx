"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, Clock, X, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RequestDetails {
    requester_name: string
    target_person_name: string
    status: string
    h1_name?: string
    s2_name?: string
}

export default function IntroStatus() {
    const params = useParams()
    const requestId = params?.requestId as string

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null)

    useEffect(() => {
        loadRequestDetails()
    }, [requestId])

    async function loadRequestDetails() {
        if (!requestId) {
            setError('Invalid request ID.')
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`${API_BASE}/api/intro-requests/${requestId}/status`)

            if (!response.ok) {
                throw new Error('Failed to load request details')
            }

            const data = await response.json()
            setRequestDetails(data)
            setLoading(false)
        } catch (err) {
            console.error('Error loading request:', err)
            setError('Failed to load request details. Please try again or contact support.')
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="w-full max-w-md rounded-xl p-12 text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading request status...</p>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-6">
                <Card className="w-full max-w-md rounded-xl p-12 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <h2 className="mb-3 text-2xl font-semibold text-foreground">Error</h2>
                    <p className="mb-6 text-muted-foreground">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="rounded-xl"
                    >
                        Try Again
                    </Button>
                </Card>
            </div>
        )
    }

    if (!requestDetails) return null

    const getStatusInfo = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
            case 'consented':
            case 'completed':
                return {
                    icon: CheckCircle2,
                    color: 'text-green-600 dark:text-green-400',
                    bgColor: 'bg-green-100 dark:bg-green-900/30',
                    title: 'Introduction Confirmed',
                    message: 'The introduction has been confirmed and will be sent to both parties.'
                }
            case 'pending_h1_approval':
            case 'pending_s2_consent':
                return {
                    icon: Clock,
                    color: 'text-blue-600 dark:text-blue-400',
                    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                    title: 'Pending',
                    message: 'Waiting for approval or consent to proceed with the introduction.'
                }
            case 'declined':
            case 'passed':
            case 'cancelled':
                return {
                    icon: X,
                    color: 'text-red-600 dark:text-red-400',
                    bgColor: 'bg-red-100 dark:bg-red-900/30',
                    title: 'Request Closed',
                    message: 'This introduction request has been declined or cancelled.'
                }
            default:
                return {
                    icon: Clock,
                    color: 'text-muted-foreground',
                    bgColor: 'bg-muted',
                    title: 'Status Unknown',
                    message: 'Unable to determine the current status of this request.'
                }
        }
    }

    const statusInfo = getStatusInfo(requestDetails.status)
    const StatusIcon = statusInfo.icon
    const s1Name = requestDetails.requester_name || 'Requester'
    const s2Name = requestDetails.target_person_name || 'Target'
    const s1Initial = s1Name[0]?.toUpperCase() || 'R'
    const s2Initial = s2Name[0]?.toUpperCase() || 'T'

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 animate-in fade-in duration-300">
            <div className="mx-auto max-w-2xl">
                {/* Status Card */}
                <Card className="mb-6 rounded-xl border border-border/50 bg-card">
                    <CardContent className="p-8 text-center">
                        <div className="mb-6 flex justify-center animate-in fade-in zoom-in-95 duration-300 delay-200">
                            <div className={`flex h-20 w-20 items-center justify-center rounded-full ${statusInfo.bgColor}`}>
                                <StatusIcon className={`h-10 w-10 ${statusInfo.color}`} />
                            </div>
                        </div>
                        <h1 className="mb-2 text-3xl font-semibold text-foreground">{statusInfo.title}</h1>
                        <p className="text-muted-foreground">{statusInfo.message}</p>
                    </CardContent>
                </Card>

                {/* Details Card */}
                <Card className="rounded-xl border border-border/50 bg-card">
                    <CardContent className="p-8">
                        <h2 className="mb-6 text-lg font-semibold text-foreground">Introduction Details</h2>
                        
                        {/* Profile Cards */}
                        <div className="mb-6 space-y-4 rounded-xl bg-muted/30 border border-border/50 p-6">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                                        {s1Initial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-foreground">{s1Name}</h3>
                                    <p className="text-sm text-muted-foreground">Requester</p>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <div className="rounded-full bg-muted p-2">
                                    <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                                        {s2Initial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-foreground">{s2Name}</h3>
                                    <p className="text-sm text-muted-foreground">Target</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-6">
                            <p className="mb-2 text-sm font-semibold text-foreground">Status</p>
                            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${statusInfo.bgColor}`}>
                                <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                                <span className={`text-sm font-medium ${statusInfo.color}`}>
                                    {requestDetails.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={() => window.location.href = '/'}
                            className="w-full rounded-xl bg-primary hover:bg-primary/90"
                        >
                            Return to Network Intelligence
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

