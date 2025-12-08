"use client";

import React, { useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, Building2 } from "lucide-react";
import type { AdminWorkspaceStats } from "@/types/admin";

interface AdminWorkspaceStatsCardsProps {
  workspaceStats: AdminWorkspaceStats[];
}

export function AdminWorkspaceStatsCards({
  workspaceStats,
}: AdminWorkspaceStatsCardsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (workspaceStats.length === 0) {
    return null;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={scrollContainerRef}
      className={`flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {workspaceStats.map((ws) => {
        const recorded = ws.recorded_count || 0;
        const actual = ws.actual_count || 0;
        const isSync = recorded === actual;

        return (
          <div
            key={ws.workspace_id}
            className="bg-[#761DE7]/90 border border-[#6518c4]/10 p-3 rounded-lg min-w-[240px] w-[240px] flex-shrink-0 select-none"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-white" />
              <h3 className="text-xs font-medium text-white truncate" title={`${ws.owner_name} (${ws.workspace_id})`}>
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
              <span className="truncate mr-2">
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
