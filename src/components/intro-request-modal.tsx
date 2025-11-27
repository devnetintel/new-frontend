"use client"

import { useState, useEffect } from "react"
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
import type { Connection } from "@/types"
import { submitIntroRequest } from "@/services"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface IntroRequestModalProps {
    isOpen: boolean
    onClose: () => void
    profile: Connection | null
    workspaceId?: string // Workspace ID from selected workspace
    workspaceName?: string // Optional workspace name for display
}

export function IntroRequestModal({
    isOpen,
    onClose,
    profile,
    workspaceId,
    workspaceName,
}: IntroRequestModalProps) {
    const { getToken } = useAuth()
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<
        "idle" | "success" | "error"
    >("idle")
    const [errorMessage, setErrorMessage] = useState("")

    // Initialize message when modal opens or profile changes
    useEffect(() => {
        if (isOpen && profile) {
            // Use s1_message if available, otherwise use a default template
            const defaultMessage = profile.s1_message || 
                `Hi, I saw that you know ${profile.name}. ${profile.reason ? `Based on ${profile.reason.substring(0, 100)}... ` : ""}I'd love to connect with them. Could you introduce us?`
            setMessage(defaultMessage)
            setSubmitStatus("idle")
            setErrorMessage("")
        }
    }, [isOpen, profile])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!profile) return

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
            })

            if (result.success) {
                setSubmitStatus("success")
                toast.success("Introduction request sent successfully!")
                // Close modal after 2 seconds
                setTimeout(() => {
                    onClose()
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
            <DialogContent className="max-w-[90vw] sm:max-w-[500px] p-4 sm:p-6 rounded-xl">
                <DialogHeader className="pb-2 sm:pb-4">
                    <DialogTitle className="text-lg sm:text-xl">Request Intro to {profile.name}</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        {workspaceName
                            ? `Ask ${workspaceName} to introduce you. The message is pre-filled based on your search context.`
                            : "Request an introduction. The message is pre-filled based on your search context."}
                    </DialogDescription>
                </DialogHeader>

                {/* Success State */}
                {submitStatus === "success" && (
                    <div className="rounded-lg sm:rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-sm sm:text-base text-green-900 dark:text-green-100">
                                Request Sent!
                            </h3>
                            <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 mt-1">
                                The network owner has been notified and will facilitate
                                the introduction.
                            </p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {submitStatus === "error" && (
                    <div className="rounded-lg sm:rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-sm sm:text-base text-red-900 dark:text-red-100">
                                Failed to Send
                            </h3>
                            <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 mt-1">
                                {errorMessage}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSend}>
                    <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
                        <div>
                            <label
                                htmlFor="message"
                                className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2"
                            >
                                Why do you want to connect?{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="h-24 sm:h-32 text-sm"
                                placeholder="Explain your reason for wanting an introduction. Be specific about what you hope to learn or discuss..."
                                disabled={isSubmitting || submitStatus === "success"}
                                required
                            />
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">
                                Minimum 10 characters • {message.length} characters
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                        <Button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                submitStatus === "success" ||
                                message.trim().length < 10
                            }
                            className="w-full sm:w-auto text-sm sm:text-base"
                        >
                            {isSubmitting
                                ? "Sending..."
                                : submitStatus === "success"
                                ? "Sent!"
                                : "Send Request"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto text-sm sm:text-base"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
