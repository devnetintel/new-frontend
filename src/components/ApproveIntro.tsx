"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RequestDetails {
    requester_name: string
    target_person_name: string
    llm_context?: {
        short_bio_s1?: string
        short_bio_s2?: string
        why_match?: string
        context_of_s1_need_and_how_s2_can_help?: string
    }
    status: string
}

export default function ApproveIntro() {
    const params = useParams()
    const searchParams = useSearchParams()
    const requestId = params?.requestId as string
    const token = searchParams?.get('token')

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null)
    const [note, setNote] = useState("")

    useEffect(() => {
        loadRequestDetails()
    }, [requestId])

    async function loadRequestDetails() {
        if (!requestId || !token) {
            setError('Invalid link. Please check your email for the correct approval link.')
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

    async function handleApprove() {
        if (!requestId || !token) return

        setSubmitting(true)
        setError(null)

        try {
            const response = await fetch(
                `${API_BASE}/api/intro-requests/${requestId}/approve?token=${token}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ h1_note: note.trim() || null })
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Failed to approve request')
            }

            setSuccess(true)
        } catch (err: any) {
            console.error('Error approving:', err)
            setError(err.message)
            setSubmitting(false)
        }
    }

    async function handlePass() {
        if (!requestId || !token) return
        if (!confirm('Are you sure you want to pass on this introduction?')) return

        setSubmitting(true)
        setError(null)

        try {
            const response = await fetch(
                `${API_BASE}/api/intro-requests/${requestId}/pass?token=${token}`,
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
            console.error('Error passing:', err)
            setError(err.message)
            setSubmitting(false)
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
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <h2 className="mb-3 text-2xl font-semibold">Introduction Approved!</h2>
                    <p className="mb-6 text-muted-foreground">
                        We'll reach out to them on your behalf. Thanks for helping build connections!
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
                    <h2 className="mb-3 text-2xl font-semibold">Error</h2>
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

    const s1Name = requestDetails.requester_name || 'Requester'
    const s2Name = requestDetails.target_person_name || 'Target'
    const s1Initial = s1Name[0]?.toUpperCase() || 'S'
    const s2Initial = s2Name[0]?.toUpperCase() || 'T'

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 animate-in fade-in duration-300">
            <div className="mx-auto max-w-3xl">
                {/* Header Card */}
                <Card className="mb-6 rounded-xl border border-border/50 bg-card">
                    <CardContent className="p-8 text-center">
                        <h1 className="mb-2 text-3xl font-semibold text-foreground">Introduction Request</h1>
                        <p className="text-muted-foreground">Review and approve this connection</p>
                    </CardContent>
                </Card>

                {/* Main Content Card */}
                <Card className="rounded-xl border border-border/50 bg-card">
                    <CardContent className="p-8">
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
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {requestDetails.llm_context?.short_bio_s1 || 'No bio available'}
                                    </p>
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
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {requestDetails.llm_context?.short_bio_s2 || 'No bio available'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Why This Connection */}
                        <div className="mb-6">
                            <h2 className="mb-2 text-lg font-semibold text-foreground">Why This Connection?</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {requestDetails.llm_context?.why_match || 'No match reason available'}
                            </p>
                        </div>

                        {/* Context */}
                        <div className="mb-6">
                            <h2 className="mb-2 text-lg font-semibold text-foreground">Context</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {requestDetails.llm_context?.context_of_s1_need_and_how_s2_can_help || 'No context available'}
                            </p>
                        </div>

                        {/* Personal Note */}
                        <div className="mb-6">
                            <label htmlFor="note" className="mb-2 block text-sm font-semibold text-foreground">
                                Add a Personal Note (Optional)
                            </label>
                            <Textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={`Example: Hey ${s2Name}, I think you two would really benefit from connecting. [Your personal insight about why this makes sense]`}
                                className="rounded-xl"
                                rows={4}
                                disabled={submitting}
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                This note will be included when we reach out to them on your behalf
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handlePass}
                                variant="outline"
                                className="flex-1 rounded-xl"
                                disabled={submitting}
                            >
                                Pass for Now
                            </Button>
                            <Button
                                onClick={handleApprove}
                                className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Approve Introduction
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

