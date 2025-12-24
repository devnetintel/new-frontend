"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, Linkedin, UserPlus, ChevronLeft, ChevronRight, X } from "lucide-react"
import type { Connection } from "@/types"
import { cn } from "@/lib/utils"
import { logTelemetryEvent } from "@/apis/telemetry"
import { useAuth } from "@clerk/nextjs"

interface ProfileDetailModalProps {
  isOpen: boolean
  onClose: () => void
  profiles: Connection[]
  initialIndex: number
  onRequestIntro: (profileId: string) => void
  onViewResult?: (resultId: number) => void
  searchId?: string; // Optional search session ID from metadata.session_id
  sentRequestIds?: Set<string>; // Set of profile IDs that have sent requests
}

export function ProfileDetailModal({
  isOpen,
  onClose,
  profiles,
  initialIndex,
  onRequestIntro,
  onViewResult,
  searchId,
  sentRequestIds,
}: ProfileDetailModalProps) {
  const { getToken } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const viewedResultIdsRef = useRef<Set<number>>(new Set());
  const [requestSent, setRequestSent] = useState(false);

  // Update index when modal opens with new initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      // Check if current profile has sent request
      const currentProfile = profiles[initialIndex];
      if (currentProfile) {
        const isRequestSent = Boolean(currentProfile.is_intro_requested) || sentRequestIds?.has(currentProfile.id) || false;
        setRequestSent(isRequestSent);
      }
    }
  }, [isOpen, initialIndex, profiles, sentRequestIds])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : profiles.length - 1))
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < profiles.length - 1 ? prev + 1 : 0))
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, profiles.length])

  // Check request status when navigating between profiles
  useEffect(() => {
    const currentProfile = profiles[currentIndex];
    if (currentProfile) {
      const isRequestSent = Boolean(currentProfile.is_intro_requested) || sentRequestIds?.has(currentProfile.id) || false;
      setRequestSent(isRequestSent);
    }
  }, [currentIndex, profiles, sentRequestIds]);

  // All hooks must be called before any conditional returns
  const currentProfile = profiles[currentIndex]
  
  if (!currentProfile) return null

  const initials = currentProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  const workspaceName = currentProfile.workspace_id || "Network"

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : profiles.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < profiles.length - 1 ? prev + 1 : 0))
  }

  const handleRequestIntro = async () => {
    onRequestIntro(currentProfile.id)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-4xl max-h-[98vh] md:max-h-[85vh] p-0 overflow-hidden rounded-xl md:rounded-2xl gap-0">
        {/* DialogTitle for accessibility - visually hidden */}
        <DialogTitle className="sr-only">
          Profile Details: {currentProfile.name}
        </DialogTitle>
        
        {/* Profile Counter - Top center */}
        {profiles.length > 1 && (
          <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-40 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-[10px] md:text-xs font-medium">
            {currentIndex + 1} / {profiles.length}
          </div>
        )}

        {/* Close button - Top right, highest z-index to ensure it's on top */}
        {/* Temporarily removed */}
        {/* <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button> */}

        {/* Carousel Navigation - Bottom Right Corner */}
        {profiles.length > 1 && (
          <div className="absolute bottom-2 right-2 md:bottom-6 md:right-6 lg:bottom-6 lg:right-6 z-50 flex items-center gap-1.5 md:gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 md:p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors shadow-lg"
              aria-label="Previous profile"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 md:p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors shadow-lg"
              aria-label="Next profile"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        )}

        {/* Main Content - Horizontal Layout */}
        <div className="flex flex-col md:flex-row max-h-[98vh] md:max-h-[85vh] overflow-y-auto md:overflow-hidden">
          {/* Left Side - Profile Info */}
          <div className="flex-1 flex flex-col p-4 md:p-5 lg:p-6 border-r-0 md:border-r border-b md:border-b-0 border-border/50">
            {/* Workspace Badge */}
            {currentProfile.workspace_id && (
              <div className="mb-3 md:mb-4">
                <div className="text-[10px] md:text-[9px] lg:text-[10px] font-bold px-2 md:px-1.5 py-1 md:py-0.5 rounded-full inline-flex items-center gap-1 md:gap-1 uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <div className="h-1 w-1 md:h-1 md:w-1 rounded-full bg-blue-500" />
                  {workspaceName}&apos;s Network
                </div>
              </div>
            )}

            {/* Profile Photo */}
            <div className="mb-3 md:mb-4">
              <Avatar className="h-20 w-20 md:h-16 lg:h-20 md:w-16 lg:w-20 border-2 md:border-3 border-background shadow-md">
                <AvatarImage src={currentProfile.image || currentProfile.picture_url} alt={currentProfile.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl md:text-lg lg:text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name and Title */}
            <div className="mb-3 md:mb-4">
              <div className="flex items-center gap-2 md:gap-2 mb-1.5 md:mb-1">
                <h2 className="font-bold text-xl md:text-xl lg:text-2xl">{currentProfile.name}</h2>
                {currentProfile.linkedin && (
                  <a
                    href={currentProfile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1.5 md:p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    aria-label={`View ${currentProfile.name}'s LinkedIn profile`}
                  >
                    <Linkedin className="h-5 w-5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                  </a>
                )}
              </div>
              <div className="flex items-center text-sm md:text-xs lg:text-sm text-muted-foreground mb-1 md:mb-1">
                <Briefcase className="mr-1.5 md:mr-1.5 h-4 w-4 md:h-3 md:w-3" />
                <span className="line-clamp-2">{currentProfile.title} {currentProfile.company ? `at ${currentProfile.company}` : ""}</span>
              </div>
              {currentProfile.location && (
                <div className="flex items-center text-sm md:text-xs lg:text-sm text-muted-foreground">
                  <MapPin className="mr-1.5 md:mr-1.5 h-4 w-4 md:h-3 md:w-3" />
                  {currentProfile.location}
                </div>
              )}
            </div>

            {/* Description/Expertise */}
            {currentProfile.expertise && currentProfile.expertise.length > 0 && (
              <div className="mb-3 md:mb-4">
                <h3 className="font-semibold text-xs md:text-[10px] lg:text-xs uppercase tracking-wide text-muted-foreground mb-2 md:mb-1.5">
                  Expertise
                </h3>
                <div className="flex flex-wrap gap-1.5 md:gap-1.5">
                  {currentProfile.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 md:px-2 py-1 md:py-0.5 rounded-full text-xs md:text-[10px] lg:text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Request Intro Button */}
            <Button
              onClick={handleRequestIntro}
              className={cn(
                "w-full font-medium py-3 md:py-2.5 lg:py-3 text-sm md:text-sm lg:text-base",
                requestSent && currentProfile.intro_status === 'connected' && "bg-green-600 hover:bg-green-600 cursor-default",
                requestSent && currentProfile.intro_status === 'declined' && "bg-red-600 hover:bg-red-600 cursor-default",
                requestSent && (!currentProfile.intro_status || currentProfile.intro_status === 'pending') && "bg-green-600 hover:bg-green-600 cursor-default"
              )}
              size="default"
              disabled={requestSent}
            >
              {requestSent ? (
                currentProfile.intro_status === 'connected' ? (
                  <>
                    <CheckCircle2 className="mr-2 md:mr-1.5 h-4 w-4 md:h-4 md:w-4" />
                    Connected
                  </>
                ) : currentProfile.intro_status === 'declined' ? (
                  <>
                    <XCircle className="mr-2 md:mr-1.5 h-4 w-4 md:h-4 md:w-4" />
                    Declined
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 md:mr-1.5 h-4 w-4 md:h-4 md:w-4" />
                    Request Sent
                  </>
                )
              ) : (
                <>
                  <UserPlus className="mr-2 md:mr-1.5 h-4 w-4 md:h-4 md:w-4" />
                  Request Intro
                </>
              )}
            </Button>
          </div>

          {/* Right Side - Why This Match */}
          <div className="flex-1 flex flex-col p-4 md:p-5 lg:p-6 pt-8 md:pt-8 lg:pt-10 pb-20 md:pb-16 lg:pb-16 bg-muted/20 border-t md:border-t-0 md:border-l border-border/50">
            <div className="mb-3 md:mb-4">
              <div className="flex items-center gap-2 md:gap-1.5 mb-2 md:mb-3">
                <div className="h-6 w-6 md:h-6 lg:h-7 md:w-6 lg:w-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="h-3.5 w-3.5 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sm md:text-sm lg:text-base uppercase tracking-wide text-foreground">
                  Why This Match
                </h3>
              </div>
              {currentProfile.reason ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm md:text-xs lg:text-sm text-muted-foreground leading-relaxed md:leading-relaxed whitespace-pre-wrap">
                    {(() => {
                      const parts = currentProfile.reason.split(/(\*\*.*?\*\*)/g)
                      return parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          const boldText = part.slice(2, -2)
                          return (
                            <span key={i} className="text-foreground font-semibold">
                              {boldText}
                            </span>
                          )
                        }
                        return <span key={i}>{part}</span>
                      })
                    })()}
                  </p>
                </div>
              ) : (
                <p className="text-sm md:text-xs lg:text-sm text-muted-foreground italic">
                  No match reasoning provided.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

