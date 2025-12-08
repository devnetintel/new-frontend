"use client";

import React from "react";
import { Database, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminTable } from "@/types/admin";

interface AdminSidebarProps {
  activeView: "dashboard" | "logs" | "database";
  onViewChange: (view: "dashboard" | "logs" | "database") => void;
  selectedTable: string | null;
  tables: AdminTable[];
  onTableSelect: (tableName: string | null) => void;
}

export function AdminSidebar({
  activeView,
  onViewChange,
  selectedTable,
  tables,
  onTableSelect,
}: AdminSidebarProps) {
  return (
    <div className="w-[250px] bg-background border-r border-border flex flex-col h-full">
      {/* Navigation */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => {
            onViewChange("logs");
            onTableSelect(null);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
            activeView === "logs"
              ? "bg-[#761DE7] text-white"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <FileText className="h-5 w-5" />
          <span className="font-medium">Search Logs</span>
        </button>
        <button
          onClick={() => {
            onViewChange("database");
            onTableSelect(null);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mt-2",
            activeView === "database"
              ? "bg-[#761DE7] text-white"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Database className="h-5 w-5" />
          <span className="font-medium">Database</span>
        </button>
      </div>

      {/* Table List (only for database view) */}
      {activeView === "database" && (
        <div className="flex-1 overflow-auto p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Tables
          </h3>
          <div className="space-y-1">
            {tables.map((table) => (
              <button
                key={table.table_name}
                onClick={() => onTableSelect(table.table_name)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedTable === table.table_name
                    ? "bg-[#761DE7] text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{table.table_name}</span>
                  <span className="text-xs opacity-70">
                    {table.row_count.toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

