"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, UserPlus, Linkedin, CheckCircle2, XCircle } from "lucide-react";
import type { Connection } from "@/types";
import { logTelemetryEvent } from "@/apis/telemetry";
import { useAuth } from "@clerk/nextjs";

interface ProfileCardProps {
  profile: Connection;
  onConnect: (id: string) => void;
  onReadMore?: (profile: Connection) => void;
  onViewResult?: (resultId: number) => void;
  searchId?: string; // Optional search session ID from metadata.session_id
  sentRequestIds?: Set<string>; // Set of profile IDs that have sent requests
}

// Shared ref across all ProfileCard instances to prevent duplicate calls
const viewedResultIdsGlobal = new Set<number>();

export function ProfileCard({
  profile,
  onConnect,
  onReadMore,
  onViewResult,
  searchId,
  sentRequestIds,
}: ProfileCardProps) {
  const { getToken } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Get workspace name or use default
  const workspaceName = profile.workspace_id || "Network";

  // Check if request was already sent for this profile
  useEffect(() => {
    // Check backend field first (source of truth), fallback to sentRequestIds for optimistic updates
    const isRequestSent = Boolean(profile.is_intro_requested) || sentRequestIds?.has(profile.id) || false;
    setRequestSent(isRequestSent);
  }, [profile.is_intro_requested, profile.id, sentRequestIds]);

  // Function to mark request as sent
  const markRequestAsSent = () => {
    const sentRequests = JSON.parse(localStorage.getItem('sentIntroRequests') || '[]');
    if (!sentRequests.includes(profile.id)) {
      sentRequests.push(profile.id);
      localStorage.setItem('sentIntroRequests', JSON.stringify(sentRequests));
    }
    setRequestSent(true);
  };

  const handleCardClick = async (e: React.MouseEvent) => {
    // Prevent event bubbling and default behavior
    e.stopPropagation();
    e.preventDefault();

    // Mark result as viewed FIRST, before opening modal
    // Use result_id if available, otherwise fallback to search_result_id
    const resultIdToUse = profile.result_id ?? profile.search_result_id;
    if (resultIdToUse != null && onViewResult) {
      // Use global set to prevent duplicate calls across all card instances
      const resultIdNum = Number(resultIdToUse);
      if (!viewedResultIdsGlobal.has(resultIdNum)) {
        viewedResultIdsGlobal.add(resultIdNum);
        onViewResult(resultIdNum);
      }
    }

    // Then open the detail modal
    if (onReadMore) {
      onReadMore(profile);
    }
  };

  const handleLinkedInClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Send linkedin_click telemetry event
    try {
      const token = await getToken();
      const resultId = profile.result_id ?? profile.search_result_id;
      if (profile.linkedin && resultId != null) {
        await logTelemetryEvent(
          "linkedin_click",
          {
            linkedin_profile: profile.linkedin,
            person_id: profile.id, // profile.id is person_id
            result_id: resultId,
          },
          token,
          searchId
        );
      }
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error("Failed to log linkedin_click event:", error);
    }
    // Link will navigate naturally
  };

  const handleRequestIntroClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    onConnect(profile.id);
  };

  return (
    <Card
      className="overflow-hidden border-transparent bg-card/50 shadow-none hover:shadow-md hover:border-border/50 transition-all duration-300 group flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 md:p-6 lg:p-6 flex-1 flex flex-col">
        {profile.workspace_id && (
          <div className="flex items-start justify-between mb-3 md:mb-3 lg:mb-3">
            <div className="text-[10px] md:text-[10px] lg:text-xs font-bold px-2 md:px-2 lg:px-2.5 py-1 md:py-1 lg:py-1 rounded-full flex items-center gap-1.5 md:gap-1.5 lg:gap-1.5 uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <div className="h-1.5 w-1.5 md:h-1.5 md:w-1.5 lg:h-1.5 lg:w-1.5 rounded-full bg-blue-500" />
              {workspaceName}&apos;s Network
            </div>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex gap-3 md:gap-3 lg:gap-4 flex-1">
            <Avatar className="h-16 w-16 md:h-20 lg:h-20 md:w-20 lg:w-20 border-2 md:border-2 lg:border-2 border-background shadow-sm">
              <AvatarImage
                src={profile.image || profile.picture_url}
                alt={profile.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg md:text-xl lg:text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 md:gap-2 lg:gap-2">
                <h3 className="font-bold text-xl md:text-xl lg:text-2xl">
                  {profile.name}
                </h3>
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkedInClick}
                    className="flex-shrink-0 p-1.5 md:p-1.5 lg:p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    aria-label={`View ${profile.name}'s LinkedIn profile`}
                  >
                    <Linkedin className="h-5 w-5 md:h-5 md:w-5 lg:h-5 lg:w-5" />
                  </a>
                )}
              </div>
              <div className="flex items-center text-sm md:text-sm lg:text-sm text-muted-foreground mt-1 md:mt-1 lg:mt-1.5">
                <Briefcase className="mr-1.5 md:mr-1.5 lg:mr-1.5 h-4 w-4 md:h-4 md:w-4 lg:h-4 lg:w-4" />
                {profile.title} {profile.company ? `at ${profile.company}` : ""}
              </div>
              {profile.location && (
                <div className="flex items-center text-sm md:text-sm lg:text-sm text-muted-foreground mt-1 md:mt-1 lg:mt-1.5">
                  <MapPin className="mr-1.5 md:mr-1.5 lg:mr-1.5 h-4 w-4 md:h-4 md:w-4 lg:h-4 lg:w-4" />
                  {profile.location}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {profile.reason && (
          <div className="mt-3 md:mt-4 lg:mt-4 p-3 md:p-4 lg:p-4 bg-muted/30 rounded-lg border border-border/50">
            <p className="font-semibold text-foreground/80 mb-2 md:mb-2 lg:mb-2 text-xs md:text-xs lg:text-xs uppercase tracking-wide">
              Why this match
            </p>
            <p className="text-sm md:text-sm lg:text-sm text-muted-foreground leading-relaxed md:leading-relaxed lg:leading-relaxed">
              {(() => {
                const reasonText =
                  isExpanded || profile.reason.length <= 200
                    ? profile.reason
                    : profile.reason.substring(0, 200) + "...";
                const parts = reasonText.split(/(\*\*.*?\*\*)/g);
                return parts.map((part, i) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    const boldText = part.slice(2, -2);
                    return (
                      <span key={i} className="text-foreground font-semibold">
                        {boldText}
                      </span>
                    );
                  }
                  return <span key={i}>{part}</span>;
                });
              })()}
            </p>
            {profile.reason.length > 200 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onReadMore) {
                    onReadMore(profile);
                  } else {
                    setIsExpanded(!isExpanded);
                  }
                }}
                className="mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {isExpanded ? "Read Less" : "Read More..."}
              </button>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/20 p-4 md:p-4 lg:p-4 flex justify-end">
        <Button
          size="default"
          className={cn(
            "text-sm md:text-sm lg:text-sm px-6 md:px-6 lg:px-6 py-2 md:py-2 lg:py-2",
            requestSent && profile.intro_status === 'connected' && "bg-green-600 hover:bg-green-600 cursor-default",
            requestSent && profile.intro_status === 'declined' && "bg-red-600 hover:bg-red-600 cursor-default",
            requestSent && (!profile.intro_status || profile.intro_status === 'pending') && "bg-green-600 hover:bg-green-600 cursor-default"
          )}
          onClick={handleRequestIntroClick}
          disabled={requestSent}
        >
          {requestSent ? (
            profile.intro_status === 'connected' ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 md:h-4 md:w-4 lg:h-4 lg:w-4" />
                Connected
              </>
            ) : profile.intro_status === 'declined' ? (
              <>
                <XCircle className="mr-2 h-4 w-4 md:h-4 md:w-4 lg:h-4 lg:w-4" />
                Declined
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 md:h-4 md:w-4 lg:h-4 lg:w-4" />
                Request Sent
              </>
            )
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4 md:h-4 md:w-4 lg:h-4 lg:w-4" />
              Request Intro
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
