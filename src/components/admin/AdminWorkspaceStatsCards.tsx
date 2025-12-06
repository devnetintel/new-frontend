"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Building2 } from "lucide-react";
import type { AdminWorkspaceStats } from "@/types/admin";

interface AdminWorkspaceStatsCardsProps {
  workspaceStats: AdminWorkspaceStats[];
}

export function AdminWorkspaceStatsCards({
  workspaceStats,
}: AdminWorkspaceStatsCardsProps) {
  if (workspaceStats.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {workspaceStats.map((ws) => {
        const recorded = ws.recorded_count || 0;
        const actual = ws.actual_count || 0;
        const isSync = recorded === actual;

        return (
          <div
            key={ws.workspace_id}
            className="bg-[#761DE7]/90 border border-[#6518c4]/10 p-3 rounded-lg min-w-[180px] flex-1 max-w-[240px]"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-white" />
              <h3 className="text-xs font-medium text-white">
                {ws.owner_name} ({ws.workspace_id})
              </h3>
            </div>
            <div className="text-xl font-bold text-white mb-1">
              {actual.toLocaleString()}
            </div>
            <div className="text-xs text-white mb-1.5">
              profiles in workspace
            </div>
            <div className="flex items-center justify-between text-xs text-white">
              <span>
                Recorded: {recorded.toLocaleString()} | Actual:{" "}
                {actual.toLocaleString()}
              </span>
              {isSync ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-300 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-300 flex-shrink-0" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
