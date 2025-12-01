"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type { Connection } from "@/types"
import { submitIntroRequest } from "@/services"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2, Sparkles, Linkedin } from "lucide-react"
import { cn } from "@/lib/utils"

interface IntroRequestModalProps {
    isOpen: boolean
    onClose: () => void
    profile: Connection | null
    workspaceId?: string
    workspaceName?: string
    userLinkedin?: string | null // Pass user's LinkedIn to check if missing
}

export function IntroRequestModal({
    isOpen,
    onClose,
    profile,
    workspaceId,
    workspaceName,
    userLinkedin,
}: IntroRequestModalProps) {
    const { getToken } = useAuth()
    const [message, setMessage] = useState("")
    const [linkedinUrl, setLinkedinUrl] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen && profile) {
            setMessage("")
            setLinkedinUrl(userLinkedin || "")
            setSubmitStatus("idle")
            setErrorMessage("")
        }
    }, [isOpen, profile, userLinkedin])

    const handleAiDraft = async () => {
        if (!profile) return
        setIsGeneratingAI(true)
        setMessage("") // Clear existing

        const targetName = profile.name
        const targetSkill = profile.title || "their expertise"
        const userProblem = "the challenge I'm facing" // In real app, get from search query

        const draftText = `Hey ${workspaceName || "there"}, I'd really appreciate an intro to ${targetName}. Since they have deep experience in ${targetSkill}, I think they could really help me unblock ${userProblem}. Thanks!`

        // Typewriter effect
        let i = 0
        const interval = setInterval(() => {
            setMessage((prev) => prev + draftText.charAt(i))
            i++
            if (i >= draftText.length) {
                clearInterval(interval)
                setIsGeneratingAI(false)
            }
        }, 15) // Fast typing
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile || !workspaceId) return

        // Validation
        if (!userLinkedin && !linkedinUrl.includes("linkedin.com/in/")) {
            setErrorMessage("Please provide a valid LinkedIn URL.")
            return
        }
        if (message.trim().length < 10) {
            setErrorMessage("Please write at least 10 characters.")
            return
        }

        setIsSubmitting(true)
        setSubmitStatus("idle")
        setErrorMessage("")

        try {
            const token = await getToken()
            if (!token) throw new Error("Please sign in")

            // Mock API call for now, replace with actual service
            // const result = await submitIntroRequest(...) 
            // For demo purposes, we simulate success
            await new Promise(resolve => setTimeout(resolve, 1000))

            setSubmitStatus("success")
            toast.success("Request sent to " + (workspaceName || "Connector") + "! 🚀")

            setTimeout(() => {
                onClose()
            }, 2000)

        } catch (error) {
            console.error("Error:", error)
            setSubmitStatus("error")
            setErrorMessage("Failed to send request.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!profile) return null

    const showLinkedinInput = !userLinkedin && !profile.linkedin // Logic check: if user doesn't have LI, ask for it.

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] sm:max-w-[500px] p-0 overflow-hidden rounded-2xl gap-0">
                {/* Header */}
                <div className="p-6 pb-4 bg-muted/30 border-b border-border/50">
                    <DialogTitle className="text-xl font-semibold">
                        Ask {workspaceName || "Connector"} for an intro
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        to <span className="font-medium text-foreground">{profile.name}</span> • {profile.title}
                    </DialogDescription>
                </div>

                <div className="p-6 space-y-6">
                    {/* Success State */}
                    {submitStatus === "success" ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95">
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Request Sent!</h3>
                            <p className="text-muted-foreground mt-2 max-w-xs">
                                {workspaceName} has been notified and will facilitate the introduction.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="space-y-6">
                            {/* Step 1: LinkedIn (Conditional) */}
                            {(!userLinkedin) && (
                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Linkedin className="h-4 w-4 text-blue-600" />
                                        Your Professional Profile
                                    </label>
                                    <Input
                                        placeholder="https://linkedin.com/in/ajay..."
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                        className={cn(
                                            "bg-muted/30",
                                            errorMessage && !linkedinUrl.includes("linkedin") && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        {workspaceName} needs this to know who you are.
                                    </p>
                                </div>
                            )}

                            {/* Step 2: Pitch */}
                            <div className="space-y-2 relative">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">
                                        Note to {workspaceName || "Connector"}
                                    </label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleAiDraft}
                                        disabled={isGeneratingAI || message.length > 10}
                                        className={cn(
                                            "h-7 text-xs gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 transition-all",
                                            isGeneratingAI && "animate-pulse"
                                        )}
                                    >
                                        <Sparkles className="h-3 w-3" />
                                        {isGeneratingAI ? "Drafting..." : "Draft with AI"}
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Textarea
                                        ref={textareaRef}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={`e.g., Hey ${workspaceName}, I see ${profile.name.split(' ')[0]} is an expert in...`}
                                        className="min-h-[120px] resize-none bg-muted/30 pr-4"
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Explain why this connection is valuable for you right now.
                                </p>
                            </div>

                            {/* Error Message */}
                            {errorMessage && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                    <AlertCircle className="h-4 w-4" />
                                    {errorMessage}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                    disabled={isSubmitting || message.length < 10 || (!userLinkedin && !linkedinUrl)}
                                >
                                    {isSubmitting ? "Sending..." : "Send Request"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
