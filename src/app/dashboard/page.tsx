"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { UserMenu } from "@/components/user-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { fetchMyRequests, type IntroRequest } from "@/services";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { MobileBottomMenu } from "@/components/mobile-bottom-menu";
import { ImpactHeader } from "@/components/impact-header";
import { RequestQueue } from "@/components/request-queue";
import { ReviewSendModal } from "@/components/review-send-modal";
import { RequestData } from "@/components/request-card";
import {
  fetchHubDashboard,
  fetchHubPendingRequests,
  approveHubRequest,
  declineHubRequest,
  type HubRequest,
} from "@/apis/hub";

export default function Dashboard() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // Hub State
  const [isHubUser, setIsHubUser] = useState(false);
  const [hubDashboard, setHubDashboard] = useState<any>(null);
  const [hubRequests, setHubRequests] = useState<RequestData[]>([]);
  const [isLoadingHubData, setIsLoadingHubData] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(
    null
  );

  // Spoke State
  const [requests, setRequests] = useState<IntroRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/sign-in");
      }
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch hub dashboard data - automatically called on page load
  useEffect(() => {
    const loadHubData = async () => {
      if (!isSignedIn || !user?.id) {
        setIsLoadingHubData(false);
        return;
      }

      try {
        setIsLoadingHubData(true);
        const token = await getToken();
        if (!token) {
          console.error("No token available for hub dashboard API call");
          setIsLoadingHubData(false);
          return;
        }

        console.log(
          "Fetching hub dashboard with token:",
          token.substring(0, 20) + "..."
        );
        // Fetch dashboard stats - API returns is_hub_user field
        const dashboardData = await fetchHubDashboard(token);
        setIsHubUser(dashboardData.is_hub_user);
        setHubDashboard(dashboardData.stats);

        // Only fetch requests if user is actually a hub user
        if (dashboardData.is_hub_user) {
          const requestsData = await fetchHubPendingRequests(token, {
            limit: 50,
            offset: 0,
          });

          // Transform hub requests to RequestData format
          const transformedRequests: RequestData[] = requestsData.requests.map(
            (req: HubRequest) => ({
              id: req.request_id.toString(),
              requester: {
                name: req.requester.name,
                headline:
                  req.requester.title && req.requester.company
                    ? `${req.requester.title} @ ${req.requester.company}`
                    : req.requester.title ||
                      req.requester.company ||
                      "Professional",
                avatarUrl: req.requester.picture_url || undefined,
                historyCount: req.helped_count,
              },
              target: {
                name: req.target.name,
                headline:
                  req.target.title && req.target.company
                    ? `${req.target.title} @ ${req.target.company}`
                    : req.target.title || req.target.company || "Professional",
                avatarUrl: req.target.picture_url || undefined,
              },
              context: req.user_message || req.reason,
              timestamp: req.created_at,
              approval_token: req.approval_token,
            })
          );

          setHubRequests(transformedRequests);
        }
      } catch (error) {
        console.error("Failed to load hub data:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load hub dashboard"
        );
      } finally {
        setIsLoadingHubData(false);
      }
    };

    if (isLoaded && isSignedIn) {
      loadHubData();
    }
  }, [isLoaded, isSignedIn, user?.id, getToken]);

  // Fetch spoke requests (My Requests) - only if user is not a hub user
  useEffect(() => {
    const loadRequests = async () => {
      if (!isSignedIn || !user?.id) {
        setIsLoadingRequests(false);
        return;
      }

      // Only fetch if user is not a hub user
      if (isHubUser) {
        setIsLoadingRequests(false);
        return;
      }

      try {
        setIsLoadingRequests(true);
        const token = await getToken();
        if (!token) {
          setIsLoadingRequests(false);
          return;
        }

        const data = await fetchMyRequests(token, {
          limit: 20,
          offset: 0,
        });

        setRequests(data.requests);
      } catch (error) {
        console.error("Failed to load requests:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load requests"
        );
      } finally {
        setIsLoadingRequests(false);
      }
    };

    if (isLoaded && isSignedIn) {
      loadRequests();
    }
  }, [isLoaded, isSignedIn, user?.id, getToken, isHubUser]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  // Helper functions
  const getTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return "Unknown";
    try {
      // Check if it's already a formatted relative time string (from hub API)
      // or an ISO date string (from spoke API)
      const date = new Date(timestamp);
      // If parsing fails or results in invalid date, assume it's already formatted
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      // If parsing fails, assume it's already a formatted string
      return timestamp || "Unknown";
    }
  };

  const getStatusBadge = (request: IntroRequest) => {
    const h1Approval = request.status.h1_approval?.toLowerCase() || "";
    const s2Consent = request.status.s2_consent?.toLowerCase() || "";
    const hubName = request.workspace.owner_name || "Hub";

    // Both approved = Connected
    if (
      (h1Approval === "approved" || h1Approval === "consented") &&
      (s2Consent === "approved" || s2Consent === "consented")
    ) {
      return {
        label: "Connected",
        variant: "secondary" as const,
        className:
          "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
        icon: <UserPlus className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />,
      };
    }

    // Hub approved but s2 not yet = Hub name + approved
    if (h1Approval === "approved" || h1Approval === "consented") {
      const hubFirstName = hubName.split(" ")[0] || hubName;
      return {
        label: `${hubFirstName} approved`,
        variant: "secondary" as const,
        className:
          "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
        icon: (
          <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
        ),
      };
    }

    // Declined
    if (
      h1Approval === "declined" ||
      s2Consent === "declined" ||
      request.status.display === "Declined"
    ) {
      return {
        label: "Declined",
        variant: "secondary" as const,
        className:
          "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
        icon: <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />,
      };
    }

    // Default: Pending
    return {
      label: "Pending",
      variant: "secondary" as const,
      className:
        "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20",
      icon: <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />,
    };
  };

  // Hub Actions
  const handleReview = (id: string) => {
    const request = hubRequests.find((r) => r.id === id);
    if (request) {
      setSelectedRequest(request);
      setIsReviewModalOpen(true);
    }
  };

  const handleDecline = async (id: string) => {
    const request = hubRequests.find((r) => r.id === id);
    if (!request || !request.approval_token) {
      toast.error("Unable to decline request. Missing approval token.");
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required. Please sign in.");
        return;
      }

      // Optimistic update
      setHubRequests((prev) => prev.filter((r) => r.id !== id));
      if (hubDashboard) {
        setHubDashboard((prev: any) => ({
          ...prev,
          active_requests: Math.max(0, (prev?.active_requests || 0) - 1),
        }));
      }

      await declineHubRequest(token, request.approval_token);

      toast.success("Request declined", {
        description: "We've notified the requester.",
      });
    } catch (error) {
      // Revert optimistic update on error
      setHubRequests((prev) => [...prev, request]);
      if (hubDashboard) {
        setHubDashboard((prev: any) => ({
          ...prev,
          active_requests: (prev?.active_requests || 0) + 1,
        }));
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to decline request"
      );
    }
  };

  const handleSendIntro = async (
    id: string,
    note: string,
    context: string,
    subject: string
  ) => {
    const request = hubRequests.find((r) => r.id === id);
    if (!request || !request.approval_token) {
      toast.error("Unable to approve request. Missing approval token.");
      setIsReviewModalOpen(false);
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required. Please sign in.");
        setIsReviewModalOpen(false);
        return;
      }

      // Optimistic update
      setHubRequests((prev) => prev.filter((r) => r.id !== id));
      if (hubDashboard) {
        setHubDashboard((prev: any) => ({
          ...prev,
          connections_made: (prev?.connections_made || 0) + 1,
          active_requests: Math.max(0, (prev?.active_requests || 0) - 1),
        }));
      }

      await approveHubRequest(token, request.approval_token, note);

      toast.success("Sent! You're awesome.", {
        description: "Intro email sent to target.",
      });
      setIsReviewModalOpen(false);
    } catch (error) {
      // Revert optimistic update on error
      setHubRequests((prev) => [...prev, request]);
      if (hubDashboard) {
        setHubDashboard((prev: any) => ({
          ...prev,
          connections_made: Math.max(0, (prev?.connections_made || 0) - 1),
          active_requests: (prev?.active_requests || 0) + 1,
        }));
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to approve request"
      );
    }
  };

  // Determine if we should show hub UI - based on API response
  const showHubUI = isHubUser;

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-3 md:px-6 py-3 md:py-6 space-y-6 md:space-y-10 box-border min-w-0">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0 border-b border-border/40 pb-4 md:pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-0.5 md:mb-1">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your network and track introductions.
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <Link href="/" className="shrink-0">
              <Button
                size="sm"
                className="h-7 md:h-10 text-xs md:text-sm whitespace-nowrap"
              >
                <Search className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Search Network</span>
                <span className="sm:hidden">Search</span>
              </Button>
            </Link>
            <UserMenu afterSignOutUrl="/sign-in" />
          </div>
        </header>

        {/* HUB VIEW: Network Management - Only show if hub user or hub user mode is enabled */}
        {showHubUI && (
          <section className="rounded-xl md:rounded-2xl bg-muted/30 p-3 md:p-6 border border-border/40 w-full box-border">
            {isLoadingHubData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : hubDashboard ? (
              <div className="space-y-8">
                <ImpactHeader
                  connectionsMade={hubDashboard.connections_made || 0}
                  activeRequests={hubDashboard.active_requests || 0}
                  userName={user?.firstName || "Connector"}
                  greeting={hubDashboard.greeting}
                  connectionsMadeChange={hubDashboard.connections_made_change}
                  potentialConnectionsThisMonth={
                    hubDashboard.potential_connections_this_month
                  }
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Request Queue
                  </h3>
                  <RequestQueue
                    requests={hubRequests}
                    isLoading={isLoadingHubData}
                    onReview={handleReview}
                    onDecline={handleDecline}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Unable to load hub dashboard data.
                </p>
              </div>
            )}
          </section>
        )}

        {/* SPOKE VIEW: My Requests - Only show if NOT hub user or hub user mode is disabled */}
        {!showHubUI && (
          <section className="space-y-3 md:space-y-4 pt-2 md:pt-4 w-full box-border">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-1.5 md:gap-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              My Requests
            </h2>

            {isLoadingRequests ? (
              <div className="flex items-center justify-center py-8 md:py-12">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 md:gap-4 w-full">
                {requests.length === 0 ? (
                  <Card className="rounded-lg md:rounded-xl p-6 md:p-8 text-center border-border/50 w-full box-border">
                    <p className="text-sm md:text-base text-muted-foreground">
                      You haven&apos;t made any introduction requests yet.
                    </p>
                  </Card>
                ) : (
                  requests.map((request) => {
                    const statusBadge = getStatusBadge(request);
                    const timeAgo = getTimeAgo(request.timestamps.created_at);
                    const titleCompany = [
                      request.target.title,
                      request.target.company,
                    ]
                      .filter(Boolean)
                      .join(" at ");

                    const initials = request.target.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase();

                    const isExpanded = expandedRequestId === request.id;
                    const hubName = request.workspace.owner_name || "Hub";
                    const hubFirstName = hubName.split(" ")[0] || hubName;
                    const s2Name = request.target.name;
                    const s2FirstName = s2Name.split(" ")[0] || s2Name;

                    const h1Approval =
                      request.status.h1_approval?.toLowerCase() || "";
                    const s2Consent =
                      request.status.s2_consent?.toLowerCase() || "";

                    const isHubApproved =
                      h1Approval === "approved" || h1Approval === "consented";
                    const isS2Connected =
                      (s2Consent === "approved" || s2Consent === "consented") &&
                      isHubApproved;

                    return (
                      <Card
                        key={request.id}
                        className="hover:bg-muted/20 transition-colors border-border/50 w-full box-border cursor-pointer"
                        onClick={() =>
                          setExpandedRequestId(isExpanded ? null : request.id)
                        }
                      >
                        <CardContent className="p-3 md:p-4 flex flex-col gap-3 w-full box-border">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-muted flex items-center justify-center text-xs md:text-sm font-medium flex-shrink-0">
                                {request.target.picture_url ? (
                                  <img
                                    src={request.target.picture_url}
                                    alt={request.target.name}
                                    className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  initials
                                )}
                              </div>
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <h3 className="font-medium text-sm md:text-base truncate">
                                  {request.target.name}
                                </h3>
                                <p className="text-xs md:text-sm text-muted-foreground truncate">
                                  {titleCompany || "Professional"}
                                </p>
                                <p className="text-[10px] md:text-xs text-muted-foreground/70 mt-0.5 truncate">
                                  via {request.workspace.owner_name}&apos;s
                                  Network • {timeAgo}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                              <Badge
                                variant={statusBadge.variant}
                                className={`${statusBadge.className} text-[10px] md:text-xs px-2 md:px-2.5 py-0.5 whitespace-nowrap`}
                              >
                                {statusBadge.icon}
                                <span className="whitespace-nowrap">
                                  {statusBadge.label}
                                </span>
                              </Badge>
                              <div className="ml-auto sm:ml-0">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Timeline View */}
                          {isExpanded && (
                            <div className="pt-3 border-t border-border/50 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="flex flex-col gap-4">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                  Timeline
                                </h4>

                                {/* Request Created */}
                                <div className="flex items-start gap-3">
                                  <div className="flex flex-col items-center pt-0.5">
                                    <div
                                      className={`h-2.5 w-2.5 rounded-full border-2 ${
                                        true
                                          ? "bg-primary border-primary"
                                          : "bg-background border-muted-foreground/30"
                                      }`}
                                    />
                                    <div
                                      className={`w-0.5 h-10 mt-1 ${
                                        isHubApproved
                                          ? "bg-primary"
                                          : "bg-border"
                                      }`}
                                    />
                                  </div>
                                  <div className="flex-1 pt-0.5">
                                    <p
                                      className={`text-sm font-medium ${
                                        true
                                          ? "text-foreground"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      Request sent
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {getTimeAgo(
                                        request.timestamps.created_at
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* Hub Approval */}
                                <div className="flex items-start gap-3">
                                  <div className="flex flex-col items-center pt-0.5">
                                    <div
                                      className={`h-2.5 w-2.5 rounded-full border-2 ${
                                        isHubApproved
                                          ? "bg-primary border-primary"
                                          : "bg-background border-muted-foreground/30"
                                      }`}
                                    />
                                    <div
                                      className={`w-0.5 h-10 mt-1 ${
                                        isS2Connected
                                          ? "bg-primary"
                                          : "bg-border"
                                      }`}
                                    />
                                  </div>
                                  <div className="flex-1 pt-0.5">
                                    <p
                                      className={`text-sm font-medium ${
                                        isHubApproved
                                          ? "text-foreground"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {isHubApproved
                                        ? `${hubFirstName} Approved`
                                        : `Awaiting ${hubFirstName}'s Review`}
                                    </p>
                                    {isHubApproved &&
                                    request.timestamps.h1_approved_at ? (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {getTimeAgo(
                                          request.timestamps.h1_approved_at
                                        )}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-muted-foreground/70 mt-0.5 italic">
                                        Request is under review...
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* S2 Connected */}
                                <div className="flex items-start gap-3">
                                  <div className="flex flex-col items-center pt-0.5">
                                    <div
                                      className={`h-2.5 w-2.5 rounded-full border-2 ${
                                        isS2Connected
                                          ? "bg-primary border-primary"
                                          : "bg-background border-muted-foreground/30"
                                      }`}
                                    />
                                  </div>
                                  <div className="flex-1 pt-0.5">
                                    <p
                                      className={`text-sm font-medium ${
                                        isS2Connected
                                          ? "text-foreground"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {isS2Connected
                                        ? `${s2FirstName} Connected`
                                        : `Awaiting ${s2FirstName}'s Acceptance`}
                                    </p>
                                    {isS2Connected &&
                                    request.timestamps.s2_consented_at ? (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {getTimeAgo(
                                          request.timestamps.s2_consented_at
                                        )}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-muted-foreground/70 mt-0.5 italic">
                                        {isHubApproved
                                          ? "Waiting for connection..."
                                          : "Pending Hub approval..."}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </section>
        )}
      </div>
      {/* Mobile Bottom Menu */}
      <MobileBottomMenu />
      <ReviewSendModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        request={selectedRequest}
        onSend={handleSendIntro}
      />
    </>
  );
}
