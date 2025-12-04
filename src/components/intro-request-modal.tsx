"use client"

import { useState, useEffect, useRef } from "react"
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
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface IntroRequestModalProps {
    isOpen: boolean
    onClose: () => void
    profile: Connection | null
    workspaceId?: string // Workspace ID from selected workspace
    workspaceName?: string // Optional workspace name for display
    requesterHasLinkedIn?: boolean // Whether the requester has a LinkedIn profile
}

export function IntroRequestModal({
    isOpen,
    onClose,
    profile,
    workspaceId,
    workspaceName,
    requesterHasLinkedIn = false,
}: IntroRequestModalProps) {
    const { getToken } = useAuth()
    const [linkedinUrl, setLinkedinUrl] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<
        "idle" | "success" | "error"
    >("idle")
    const [errorMessage, setErrorMessage] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Reset state when modal opens or profile changes
    useEffect(() => {
        if (isOpen && profile) {
            setLinkedinUrl("")
            setMessage("")
            setSubmitStatus("idle")
            setErrorMessage("")
            setIsGeneratingAI(false)
        }
    }, [isOpen, profile])

    const handleAiDraft = async () => {
        if (!profile) return
        
        setIsGeneratingAI(true)
        setMessage("") // Clear existing

        // Use s1_message from API if available, otherwise generate a default
        const draftText = profile.s1_message || 
            `Hi ${workspaceName || "there"}, I'd love an introduction to ${profile.name}. ${profile.reason ? `Based on ${profile.reason.substring(0, 150)}... ` : ""}I think they could really help me. Could you connect us?`

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

        if (!profile) return

        // Validate LinkedIn URL only if requester doesn't have LinkedIn
        if (!requesterHasLinkedIn) {
            if (!linkedinUrl.trim()) {
                setSubmitStatus("error")
                setErrorMessage("Please enter your LinkedIn URL.")
                return
            }

            // Basic LinkedIn URL validation
            const linkedinUrlPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/
            if (!linkedinUrlPattern.test(linkedinUrl.trim())) {
                setSubmitStatus("error")
                setErrorMessage("Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/yourname)")
                return
            }
        }

        // Validate message
        if (message.trim().length < 10) {
            setSubmitStatus("error")
            setErrorMessage(
                "Please write at least 10 characters explaining why you want to connect."
            )
            return
        }

        // Check if workspace is selected
        if (!workspaceId) {
            setSubmitStatus("error")
            setErrorMessage("Please select a workspace first.")
            return
        }

        setIsSubmitting(true)
        setSubmitStatus("idle")
        setErrorMessage("")

        try {
            const token = await getToken()
            if (!token) {
                throw new Error("Please sign in")
            }

            const result = await submitIntroRequest(token, {
                target_person_id: profile.id,
                target_person_name: profile.name,
                target_person_title: profile.title,
                target_person_company: profile.company,
                target_person_linkedin: profile.linkedin || null,
                match_reason: profile.reason || "",
                user_message: message.trim(),
                workspace_id: workspaceId,
                urgency: "medium", // Default urgency
                linkedin_url: requesterHasLinkedIn ? "" : linkedinUrl.trim(),
            })

            if (result.success) {
                setSubmitStatus("success")
                toast.success("Introduction request sent successfully!")
                // Close modal after 2 seconds
                setTimeout(() => {
                    onClose()
                    setLinkedinUrl("")
                    setMessage("")
                    setSubmitStatus("idle")
                }, 2000)
            } else {
                setSubmitStatus("error")
                setErrorMessage(
                    result.message || "Failed to submit request. Please try again."
                )
            }
        } catch (error) {
            console.error("Error submitting intro request:", error)
            setSubmitStatus("error")
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Network error. Please check your connection and try again."
            )
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to submit request"
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!profile) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] sm:max-w-[500px] p-0 overflow-hidden rounded-2xl gap-0">
                {/* Header */}
                <div className="p-6 pb-4 bg-muted/30 border-b border-border/50">
                    <DialogTitle className="text-xl font-semibold">
                        Request Intro to {profile.name}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        Request an introduction. The message is pre-filled based on your search context.
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
                                {workspaceName || "The network owner"} has been notified and will facilitate the introduction.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="space-y-6">
                            {/* LinkedIn URL Input - Only show if requester doesn't have LinkedIn */}
                            {!requesterHasLinkedIn && (
                                <div className="space-y-2">
                                    <label
                                        htmlFor="linkedin-url"
                                        className="block text-sm font-medium"
                                    >
                                        LinkedIn URL{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="linkedin-url"
                                        type="url"
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                        className="bg-muted/30"
                                        placeholder="https://linkedin.com/in/yourname"
                                        disabled={isSubmitting}
                                        required
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Enter your LinkedIn profile URL
                                    </p>
                                </div>
                            )}

                            {/* Message Input */}
                            <div className="space-y-2 relative">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="message"
                                        className="block text-sm font-medium"
                                    >
                                        Why do you want to connect?{" "}
                                        <span className="text-red-500">*</span>
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
                                <Textarea
                                    ref={textareaRef}
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="min-h-[120px] resize-none bg-muted/30"
                                    placeholder="Explain your reason for wanting an introduction. Be specific about what you hope to learn or discuss..."
                                    disabled={isSubmitting || isGeneratingAI}
                                    required
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Minimum 10 characters • {message.length} characters
                                </p>
                            </div>

                            {/* Error State */}
                            {submitStatus === "error" && errorMessage && (
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
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                    disabled={
                                        isSubmitting ||
                                        (!requesterHasLinkedIn && !linkedinUrl.trim()) ||
                                        message.trim().length < 10
                                    }
                                >
                                    {isSubmitting
                                        ? "Sending..."
                                        : "Send Request"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
