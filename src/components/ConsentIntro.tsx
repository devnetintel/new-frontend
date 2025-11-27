"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { CheckCircle2, AlertCircle, Loader2, X, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RequestDetails {
    requester_name: string
    target_person_name: string
    llm_context?: {
        context_of_s1_need_and_how_s2_can_help?: string
        why_match_for_s2?: string
    }
    h1_note_to_s2?: string
    workspace_owner_name?: string
    status: string
}

export default function ConsentIntro() {
    const params = useParams()
    const searchParams = useSearchParams()
    const requestId = params?.requestId as string
    const token = searchParams?.get('token')

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [action, setAction] = useState<'consent' | 'decline' | null>(null)
    const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null)

    useEffect(() => {
        loadRequestDetails()
    }, [requestId])

    async function loadRequestDetails() {
        if (!requestId || !token) {
            setError('Invalid link. Please check your email for the correct consent link.')
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

    async function handleConsent() {
        if (!requestId || !token) return

        setSubmitting(true)
        setError(null)
        setAction('consent')

        try {
            const response = await fetch(
                `${API_BASE}/api/intro-requests/${requestId}/consent?token=${token}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Failed to process consent')
            }

            setSuccess(true)
        } catch (err: any) {
            console.error('Error consenting:', err)
            setError(err.message)
            setSubmitting(false)
            setAction(null)
        }
    }

    async function handleDecline() {
        if (!requestId || !token) return
        if (!confirm('Are you sure you want to decline this introduction?')) return

        setSubmitting(true)
        setError(null)
        setAction('decline')

        try {
            const response = await fetch(
                `${API_BASE}/api/intro-requests/${requestId}/decline?token=${token}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Failed to process request')
            }

            setSuccess(true)
        } catch (err: any) {
            console.error('Error declining:', err)
            setError(err.message)
            setSubmitting(false)
            setAction(null)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="w-full max-w-md rounded-xl p-12 text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading request details...</p>
                </Card>
            </div>
        )
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-6 animate-in fade-in duration-300">
                <Card className="w-full max-w-md rounded-xl p-12 text-center">
                    <div className="mb-6 flex justify-center animate-in fade-in zoom-in-95 duration-300 delay-200">
                        <div className={`flex h-20 w-20 items-center justify-center rounded-full ${action === 'consent' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                            }`}>
                            {action === 'consent' ? (
                                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                            ) : (
                                <Clock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            )}
                        </div>
                    </div>
                    <h2 className="mb-3 text-2xl font-semibold text-foreground">
                        {action === 'consent' ? 'Introduction Confirmed!' : 'Request Closed'}
                    </h2>
                    <p className="mb-6 text-muted-foreground">
                        {action === 'consent'
                            ? "Great! We'll send the formal introduction email to both of you shortly."
                            : "No problem. This introduction won't be made."}
                    </p>
                    <Button
                        onClick={() => window.location.href = '/'}
                        className="rounded-xl bg-primary hover:bg-primary/90"
                    >
                        Return to Network Intelligence
                    </Button>
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

    const s1Name = requestDetails.requester_name || 'Someone'
    const s1Initial = s1Name[0]?.toUpperCase() || 'S'
    const h1Name = requestDetails.workspace_owner_name || 'your connection'

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 animate-in fade-in duration-300">
            <div className="mx-auto max-w-2xl">
                {/* Header Card */}
                <Card className="mb-6 rounded-xl border border-border/50 bg-card">
                    <CardContent className="p-8 text-center">
                        <h1 className="mb-2 text-3xl font-semibold text-foreground">Hey, {h1Name} here.</h1>
                        <p className="text-muted-foreground">Someone would like to connect with you</p>
                    </CardContent>
                </Card>

                {/* Main Content Card */}
                <Card className="rounded-xl border border-border/50 bg-card">
                    <CardContent className="p-8">
                        {/* Profile */}
                        <div className="mb-6 flex items-center gap-4 rounded-xl bg-muted/30 border border-border/50 p-6">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                                    {s1Initial}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-foreground">{s1Name}</h3>
                                <p className="text-sm text-muted-foreground">wants to connect with you</p>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="mb-6 space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                Hope you're doing well. Wanted to run something by you.
                            </p>

                            <p className="text-muted-foreground leading-relaxed">
                                {s1Name} wants to connect with you. {requestDetails.llm_context?.context_of_s1_need_and_how_s2_can_help || ''}
                            </p>

                            <p className="text-muted-foreground leading-relaxed">
                                {requestDetails.llm_context?.why_match_for_s2 || ''}
                            </p>

                            {requestDetails.h1_note_to_s2 && (
                                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                                    <p className="text-sm font-semibold text-foreground mb-1">
                                        Personal note from {h1Name}:
                                    </p>
                                    <p className="text-sm text-muted-foreground italic">
                                        "{requestDetails.h1_note_to_s2}"
                                    </p>
                                </div>
                            )}

                            <p className="text-muted-foreground leading-relaxed">
                                If you're open to it, I can connect you both over a common email.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={handleConsent}
                                className="w-full rounded-xl bg-primary hover:bg-primary/90 h-12"
                                disabled={submitting}
                            >
                                {submitting && action === 'consent' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                        Yes, happy to connect
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={handleDecline}
                                variant="outline"
                                className="w-full rounded-xl h-12"
                                disabled={submitting}
                            >
                                {submitting && action === 'decline' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <X className="mr-2 h-5 w-5" />
                                        Pass for now
                                    </>
                                )}
                            </Button>
                        </div>

                        <p className="mt-4 text-center text-xs text-muted-foreground">
                            Let me know. I genuinely think you'll find good synergy here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

