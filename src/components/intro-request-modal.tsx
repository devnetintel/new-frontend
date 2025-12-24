"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { Connection } from "@/types";
import { submitIntroRequest } from "@/services";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/contexts/user-context";
import { logTelemetryEvent } from "@/apis/telemetry";

interface IntroRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profileId: string) => void; // Callback when request is successfully sent
  profile: Connection | null;
  workspaceId?: string; // Workspace ID from selected workspace
  workspaceName?: string; // Optional workspace name for display
  isHubUser?: boolean | null; // Whether the requester is a hub user (from /ask API response)
  originalQuery?: string; // Original search query
  searchId?: string; // Optional search session ID from metadata.session_id
}

export function IntroRequestModal({
  isOpen,
  onClose,
  onSuccess,
  profile,
  workspaceId,
  workspaceName,
  isHubUser: isHubUserProp = null,
  originalQuery,
  searchId,
}: IntroRequestModalProps) {
  const { getToken } = useAuth();
  const { requesterHasLinkedIn, setRequesterHasLinkedIn } = useUserContext();
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens or profile changes
  useEffect(() => {
    if (isOpen && profile) {
      setLinkedinUrl("");
      setMessage("");
      setSubmitStatus("idle");
      setErrorMessage("");
      setIsGeneratingAI(false);
      setIsBannerDismissed(false);
      setIsBannerCollapsed(false);
    }
  }, [isOpen, profile]);

  // Function to handle banner collapse with animation
  const handleBannerCollapse = () => {
    if (!bannerRef.current) return;

    setIsBannerCollapsed(true);
    const banner = bannerRef.current;

    // Animate banner to hide (slide up and fade out)
    banner.style.transition = "all 0.4s ease-in-out";
    banner.style.height = `${banner.offsetHeight}px`;
    banner.style.overflow = "hidden";

    // Force reflow
    banner.offsetHeight;

    banner.style.height = "0";
    banner.style.opacity = "0";
    banner.style.paddingTop = "0";
    banner.style.paddingBottom = "0";
    banner.style.marginBottom = "0";

    // After animation completes, dismiss the banner
    setTimeout(() => {
      setIsBannerDismissed(true);
    }, 400);
  };

  // isHubUser is now passed as a prop from the /ask API response

  const handleAiDraft = async () => {
    if (!profile) return;

    setIsGeneratingAI(true);
    setMessage(""); // Clear existing

    // Send ai_draft telemetry event
    try {
      const token = await getToken();
      const resultId = profile.result_id ?? profile.search_result_id;
      if (resultId != null) {
        await logTelemetryEvent(
          "ai_draft",
          {
            person_id: profile.id, // profile.id is person_id
            result_id: resultId,
          },
          token,
          searchId
        );
      }
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error("Failed to log ai_draft event:", error);
    }

    // Use s1_message from API if available, otherwise generate a default
    const draftText =
      profile.s1_message ||
      `Hi ${workspaceName || "there"}, I'd love an introduction to ${
        profile.name
      }. ${
        profile.reason ? `Based on ${profile.reason.substring(0, 150)}... ` : ""
      }I think they could really help me. Could you connect us?`;

    // Typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      setMessage((prev) => prev + draftText.charAt(i));
      i++;
      if (i >= draftText.length) {
        clearInterval(interval);
        setIsGeneratingAI(false);
      }
    }, 15); // Fast typing
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    // Validate LinkedIn URL only if requester doesn't have LinkedIn
    if (!requesterHasLinkedIn) {
      if (!linkedinUrl.trim()) {
        setSubmitStatus("error");
        setErrorMessage("Please enter your LinkedIn URL.");
        return;
      }

      // Basic LinkedIn URL validation
      const linkedinUrlPattern =
        /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
      if (!linkedinUrlPattern.test(linkedinUrl.trim())) {
        setSubmitStatus("error");
        setErrorMessage(
          "Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/yourname)"
        );
        return;
      }
    }

    // Validate message
    if (message.trim().length < 10) {
      setSubmitStatus("error");
      setErrorMessage(
        "Please write at least 10 characters explaining why you want to connect."
      );
      return;
    }

    // Check if workspace is selected
    if (!workspaceId) {
      setSubmitStatus("error");
      setErrorMessage("Please select a workspace first.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Please sign in");
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
        requester_linkedin_url: requesterHasLinkedIn ? "" : linkedinUrl.trim(),
        result_id: profile.result_id,
        search_result_id: profile.search_result_id,
        user_query: originalQuery,
      });

      if (result.success) {
        setSubmitStatus("success");
        toast.success("Introduction request sent successfully!");

        // Update user context if LinkedIn URL was provided
        if (!requesterHasLinkedIn && linkedinUrl.trim()) {
          setRequesterHasLinkedIn(true);
        }

        // Notify parent of successful request
        if (onSuccess && profile) {
          onSuccess(profile.id);
        }

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setLinkedinUrl("");
          setMessage("");
          setSubmitStatus("idle");
        }, 2000);
      } else {
        setSubmitStatus("error");
        setErrorMessage(
          result.message || "Failed to submit request. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting intro request:", error);
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection and try again."
      );
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[500px] p-0 overflow-hidden rounded-2xl gap-0 z-55 [&>button]:hidden">
        {/* Banner - Permanent part of dialog */}
        {isHubUserProp === false && !isBannerDismissed && (
          <div
            ref={bannerRef}
            className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/30 px-3 py-4 flex items-center justify-between gap-4 bg-background overflow-hidden"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm md:text-base text-foreground ">
                  Onboard your Network
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Connect your network
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info("Feature coming soon", {
                    description: "This feature will be available soon.",
                    duration: 3000,
                  });
                  setIsBannerDismissed(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 text-xs md:text-sm whitespace-nowrap"
              >
                Create
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBannerCollapse();
                }}
                className="h-8 px-2 text-xs md:text-sm whitespace-nowrap text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="p-6 pb-4 bg-muted/30 border-b border-border/50 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogTitle className="text-xl font-semibold">
            Request Intro to {profile.name}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Request an introduction. The message is pre-filled based on your
            search context.
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          {/* Success State */}
          {submitStatus === "success" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Request Sent!
              </h3>
              <p className="text-muted-foreground mt-2 max-w-xs">
                {workspaceName || "The network owner"} has been notified and
                will facilitate the introduction.
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
                    LinkedIn URL <span className="text-red-500">*</span>
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
                  {isSubmitting ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
