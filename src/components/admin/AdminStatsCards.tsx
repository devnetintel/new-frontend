"use client";

import React, { useMemo } from "react";
import type { AdminLog } from "@/types/admin";

interface AdminStatsCardsProps {
  logs: AdminLog[];
}

export function AdminStatsCards({ logs }: AdminStatsCardsProps) {
  const stats = useMemo(() => {
    const totalPrompts = logs.length;

    const avgResponseTime =
      logs.length > 0
        ? logs.reduce((sum, log) => {
            const time = log.total_execution_time_ms || 0;
            return sum + time;
          }, 0) /
          logs.length /
          1000
        : 0;

    const successRate =
      logs.length > 0
        ? (logs.filter(
            (log) => log.search_status === "success" || !log.error_message
          ).length /
            logs.length) *
          100
        : 0;

    const avgCoherenceScore =
      logs.length > 0
        ? logs.reduce((sum, log) => {
            const score = log.average_evaluation_score || 0;
            return sum + score;
          }, 0) / logs.length
        : 0;

    return {
      totalPrompts,
      avgResponseTime: avgResponseTime.toFixed(1),
      successRate: successRate.toFixed(1),
      avgCoherenceScore: avgCoherenceScore.toFixed(1),
    };
  }, [logs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-background rounded-lg border border-border p-5 shadow-sm">
        <div className="text-xs font-semibold text-muted-foreground mb-2">
          Total prompts
        </div>
        <div className="text-xl font-semibold text-foreground">
          {stats.totalPrompts}
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border p-5 shadow-sm">
        <div className="text-xs font-semibold text-muted-foreground mb-2">
          Avg. response time
        </div>
        <div className="text-xl font-semibold text-foreground">
          {stats.avgResponseTime}s
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border p-5 shadow-sm">
        <div className="text-xs font-semibold text-muted-foreground mb-2">
          Success rate
        </div>
        <div className="text-xl font-semibold text-foreground">
          {stats.successRate}%
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border p-5image.png shadow-sm">
        <div className="text-xs font-semibold text-muted-foreground mb-2">
          Avg. coherence score
        </div>
        <div className="text-xl font-semibold text-foreground">
          {stats.avgCoherenceScore}
        </div>
      </div>
    </div>
  );
}
