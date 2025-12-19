"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { fetchHistoryDetail, type HistoryDetailResponse } from "@/apis/history";
import type { Connection } from "@/types/connection";
import { ProfileCard } from "@/components/profile-card";
import { IntroRequestModal } from "@/components/intro-request-modal";
import { ProfileDetailModal } from "@/components/profile-detail-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchWorkspaces } from "@/apis/workspaces";
import type { WorkspaceInfo } from "@/types/connection";
import { MobileBottomMenu } from "@/components/mobile-bottom-menu";
import { useUserContext } from "@/contexts/user-context";
import { markResultViewed } from "@/apis/search";

function HistoryDetailContent() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchId = params?.searchId as string | undefined;
  const { requesterHasLinkedIn, setRequesterHasLinkedIn } = useUserContext();

  const [historyDetail, setHistoryDetail] = useState<HistoryDetailResponse | null>(null);
  const [results, setResults] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Connection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalIndex, setDetailModalIndex] = useState(0);
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<string[]>([]);
  const [isHubUser, setIsHubUser] = useState<boolean | null>(null);
  const viewedResultIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && isSignedIn && searchId) {
      loadHistoryDetail();
      loadWorkspaces();
    }
  }, [isLoaded, isSignedIn, searchId, router]);

  const loadWorkspaces = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { workspaces: userWorkspaces } = await fetchWorkspaces(token);
      setWorkspaces(userWorkspaces);
      if (userWorkspaces.length > 0) {
        setSelectedWorkspaceIds(userWorkspaces.map((w) => w.id));
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
    }
  };

  const loadHistoryDetail = async () => {
    if (!searchId) {
      toast.error("Invalid history item");
      router.push("/history");
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error("Please sign in");
        return;
      }

      const data = await fetchHistoryDetail(token, searchId);
      setHistoryDetail(data);
      setIsHubUser(data.is_hub_user || false);

      // Update requester_has_linkedin in context
      if (data.requester_has_linkedin !== undefined) {
        setRequesterHasLinkedIn(data.requester_has_linkedin);
      }

      // Transform the detailed results to Connection format
      const connections = transformHistoryProfilesToConnections(data.profiles);
      console.log("HistoryDetail: Transformed connections with result_ids:", connections.map(c => ({ id: c.id, result_id: c.result_id })));
      setResults(connections);
    } catch (error) {
      console.error("Failed to load history detail:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load history details"
      );
      router.push("/history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (profileId: string) => {
    const profile = results.find((p) => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      setIsModalOpen(true);
    }
  };

  const handleReadMore = (profile: Connection) => {
    const index = results.findIndex((p) => p.id === profile.id);
    setDetailModalIndex(index);
    setIsDetailModalOpen(true);
    // Note: Don't call handleViewResult here - ProfileCard already calls it on click
    // and ProfileDetailModal will call it when modal opens if not already viewed
  };

  const handleViewResult = useCallback(async (resultId: number) => {
    // Prevent duplicate calls for the same result_id
    const resultIdNum = Number(resultId);
    if (viewedResultIds.current.has(resultIdNum)) {
      return;
    }

    // Mark immediately to prevent race conditions
    viewedResultIds.current.add(resultIdNum);

    try {
      const token = await getToken();
      if (!token) {
        viewedResultIds.current.delete(resultIdNum);
        return;
      }
      if (isNaN(resultIdNum)) {
        viewedResultIds.current.delete(resultIdNum);
        return;
      }
      
      await markResultViewed(resultIdNum, token);
    } catch (error) {
      // Remove from set on error so it can be retried
      viewedResultIds.current.delete(resultIdNum);
      console.error("HistoryDetail: Failed to mark result as viewed:", error);
    }
  }, [getToken]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!historyDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground mb-4">History item not found</p>
        <Button onClick={() => router.push("/history")} variant="outline">
          Back to History
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-4 md:px-6 py-4 md:py-6 space-y-6 md:space-y-10 box-border min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4 md:pb-6">
          <div className="flex-1 min-w-0">
            <Button
              onClick={() => router.push("/history")}
              variant="ghost"
              size="sm"
              className="mb-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Search Results
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              {historyDetail.metadata?.query_text || historyDetail.response || "Previous search results"}
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No results found for this search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {results.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onConnect={() => handleConnect(profile.id)}
                  onReadMore={handleReadMore}
                  onViewResult={handleViewResult}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Intro Request Modal */}
      <IntroRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={selectedProfile}
        workspaceId={
          selectedProfile?.workspace_id ||
          (selectedWorkspaceIds.length > 0 ? selectedWorkspaceIds[0] : undefined)
        }
        workspaceName={
          selectedProfile?.workspace_id
            ? workspaces.find((w) => w.id === selectedProfile.workspace_id)?.name
            : selectedWorkspaceIds.length > 0
              ? workspaces.find((w) => w.id === selectedWorkspaceIds[0])?.name
              : undefined
        }
        isHubUser={isHubUser || false}
      />

      {/* Profile Detail Modal */}
      <ProfileDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        profiles={results}
        initialIndex={detailModalIndex}
        onRequestIntro={(profileId) => {
          const profile = results.find((p) => p.id === profileId);
          if (profile) {
            setSelectedProfile(profile);
            setIsDetailModalOpen(false);
            setIsModalOpen(true);
          }
        }}
        onViewResult={handleViewResult}
      />

      {/* Mobile Bottom Menu */}
      <MobileBottomMenu />
    </>
  );
}

/**
 * Transform history detailed profiles to Connection format
 */
function transformHistoryProfilesToConnections(
  profiles: HistoryDetailResponse["profiles"]
): Connection[] {
  return profiles.map((item) => {
    const profile = item.profile;

    // Generate avatar color based on name
    const getAvatarColor = (name: string) => {
      const colors = [
        "bg-blue-500",
        "bg-red-500",
        "bg-purple-700",
        "bg-teal-400",
        "bg-pink-400",
        "bg-amber-400",
        "bg-green-500",
        "bg-indigo-600",
        "bg-orange-500",
        "bg-cyan-500",
      ];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    };

    // Generate initials for avatar
    const getInitials = (name: string) => {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    const avatarColor = getAvatarColor(profile.name);
    const initials = getInitials(profile.name);
    const avatarUrl = profile.picture_url
      ? profile.picture_url
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          profile.name
        )}`;

    return {
      id: profile.person_id,
      name: profile.name,
      title: profile.headline || profile.current_title || profile.current_company || "Professional",
      company: profile.current_company || "",
      image: avatarUrl,
      expertise: [], // History API doesn't provide technical_skills
      degree: 2, // Default to 2nd degree
      consented: false,
      location: undefined, // History API doesn't provide location
      linkedin: profile.linkedin_profile || undefined,
      reason: item.overall_assessment, // Use overall_assessment as reason
      workspace_id: undefined, // History API doesn't provide workspace_id
      picture_url: profile.picture_url || undefined,
      s1_message: undefined, // History API doesn't provide s1_message
      result_id: item.result_id ?? item.search_result_id, // Use result_id, fallback to search_result_id
      search_result_id: item.search_result_id,
    };
  });
}

export default function HistoryDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <HistoryDetailContent />
    </Suspense>
  );
}

