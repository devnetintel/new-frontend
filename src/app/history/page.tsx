"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { fetchHistory, type HistoryItem } from "@/apis/history";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { MobileBottomMenu } from "@/components/mobile-bottom-menu";

function HistoryPageContent() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/sign-in");
      }
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!isSignedIn || !isLoaded) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = await getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        const data = await fetchHistory(token, {
          limit: 50,
          offset: 0,
        });

        setHistoryItems(data);
      } catch (error) {
        console.error("Failed to load history:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load history"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      loadHistory();
    }
  }, [isLoaded, isSignedIn, getToken]);

  const getTimeAgo = (timestamp: string) => {
    try {
      // Backend sends UTC timestamps without timezone indicator (e.g., "2025-12-19T11:30:46.585605")
      // Parse as UTC by explicitly treating it as UTC
      let date: Date;
      
      if (timestamp.endsWith('Z') || timestamp.includes('+') || timestamp.includes('-', 10)) {
        // Has timezone indicator, parse as-is
        date = new Date(timestamp);
      } else {
        // No timezone indicator - explicitly parse as UTC
        // Append 'Z' to indicate UTC
        date = new Date(timestamp + 'Z');
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      // Show seconds if less than 1 minute
      if (diffSecs < 1) return "just now";
      if (diffSecs < 60) return `${diffSecs} second${diffSecs > 1 ? "s" : ""} ago`;
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      
      // For longer periods, use formatDistanceToNow
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6 md:space-y-10 box-border min-w-0">
        <header className="flex flex-row justify-between items-start md:items-center gap-3 md:gap-0 border-b border-border/40 pb-4 md:pb-6">
          <div className="flex-1 p-2 md:p-0 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-0.5 md:mb-1">
              Search History
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              View and access your previous searches.
            </p>
          </div>
          <div className="flex p-2 md:p-0 items-center gap-2 md:gap-4 shrink-0">
            <Link href="/" className="shrink-0">
              <Button
                size="sm"
                className="h-8 md:h-10 text-xs md:text-sm whitespace-nowrap"
              >
                <History className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">New Search</span>
                <span className="sm:hidden">Search</span>
              </Button>
            </Link>
          </div>
        </header>

        <section className="rounded-xl md:rounded-2xl bg-muted/30 p-3 md:p-6 border border-border/40 w-full box-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : historyItems.length === 0 ? (
            <Card className="rounded-lg md:rounded-xl p-6 md:p-8 text-center border-border/50 w-full box-border">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-sm md:text-base text-muted-foreground">
                You haven&apos;t made any searches yet.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3 md:gap-4 w-full">
              {historyItems.map((item) => (
                <Link key={item.search_id} href={`/history/${item.search_id}`}>
                  <Card className="group hover:shadow-md transition-all duration-200 border-border/50 bg-background w-full box-border cursor-pointer">
                    <CardContent className="p-4 md:p-5 flex flex-col gap-3 w-full box-border">
                      <div className="flex items-start justify-between gap-3 w-full">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base md:text-lg leading-tight mb-2 line-clamp-2">
                            {item.query_text}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              <span>{getTimeAgo(item.timestamp)}</span>
                            </div>
                            <span className="hidden sm:inline text-muted-foreground/50">
                              •
                            </span>
                            <div className="text-xs md:text-sm text-muted-foreground">
                              {item.final_result_count} result
                              {item.final_result_count !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
      {/* Mobile Bottom Menu */}
      <MobileBottomMenu />
    </>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <HistoryPageContent />
    </Suspense>
  );
}

