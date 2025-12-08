"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Database, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminBreadcrumbsProps {
  activeView: "dashboard" | "logs" | "database";
  selectedTable: string | null;
  tables: Array<{ table_name: string }>;
  onTableSelect: (tableName: string) => void;
  onViewChange: (view: "dashboard" | "logs" | "database") => void;
}

export function AdminBreadcrumbs({
  activeView,
  selectedTable,
  tables,
  onTableSelect,
  onViewChange,
}: AdminBreadcrumbsProps) {
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [databaseDropdownOpen, setDatabaseDropdownOpen] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);
  const databaseRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        viewRef.current &&
        !viewRef.current.contains(event.target as Node)
      ) {
        setViewDropdownOpen(false);
      }
      if (
        databaseRef.current &&
        !databaseRef.current.contains(event.target as Node)
      ) {
        setDatabaseDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const viewOptions = [
    { label: "Dashboard", value: "dashboard" as const },
    { label: "Search Logs", value: "logs" as const },
    { label: "Database", value: "database" as const },
  ];
  const currentView = activeView === "logs" ? "Search Logs" : activeView === "database" ? "Database" : "Dashboard";

  const getDatabaseLabel = () => {
    if (activeView === "logs") {
      return "Search Logs";
    }
    return selectedTable || "Select Database";
  };

  return (
    <nav className="flex justify-between" aria-label="Breadcrumb">
      <ol className="inline-flex items-center mb-3 sm:mb-0">
        <li>
          <div className="flex items-center relative" ref={viewRef}>
            <button
              onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
              className="inline-flex items-center text-foreground bg-background box-border border border-transparent hover:bg-muted focus:ring-4 focus:ring-ring font-medium leading-5 rounded-md text-xs px-2 py-1 focus:outline-none transition-colors"
            >
              <Code2 className="w-3 h-3 me-1.5" />
              {currentView}
              <ChevronDown className="w-3 h-3 ms-1.5" />
            </button>
            {viewDropdownOpen && (
              <div className="z-10 bg-background border border-border rounded-md shadow-lg w-44 absolute top-full left-0 mt-1">
                <ul className="p-2 text-xs text-muted-foreground font-medium space-y-1">
                  {viewOptions.map((option) => (
                    <li key={option.value}>
                      <button
                        onClick={() => {
                          onViewChange(option.value);
                          setViewDropdownOpen(false);
                        }}
                        className={cn(
                          "inline-flex items-center w-full p-2 hover:bg-muted hover:text-foreground rounded-md text-left",
                          activeView === option.value &&
                            "bg-muted text-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </li>
        <span className="mx-2 text-muted-foreground text-xs">/</span>
        <li aria-current="page">
          <div className="flex items-center relative" ref={databaseRef}>
            <button
              onClick={() => {
                if (activeView === "database") {
                  setDatabaseDropdownOpen(!databaseDropdownOpen);
                }
              }}
              className="inline-flex items-center text-foreground bg-background box-border border border-transparent hover:bg-muted focus:ring-4 focus:ring-ring font-medium leading-5 rounded-md text-xs px-2 py-1 focus:outline-none transition-colors"
            >
              <Database className="w-3 h-3 me-1.5" />
              {getDatabaseLabel()}
              {activeView === "database" && (
                <ChevronDown className="w-3 h-3 ms-1.5" />
              )}
            </button>
            {databaseDropdownOpen && activeView === "database" && (
              <div className="z-10 bg-background border border-border rounded-md shadow-lg w-44 absolute top-full left-0 mt-1 max-h-60 overflow-y-auto themed-scrollbar">
                <ul className="p-2 text-sm text-muted-foreground font-medium space-y-1">
                  {tables.length === 0 ? (
                    <li className="p-2 text-muted-foreground">No tables available</li>
                  ) : (
                    tables.map((table) => (
                      <li key={table.table_name}>
                        <button
                          onClick={() => {
                            onTableSelect(table.table_name);
                            setDatabaseDropdownOpen(false);
                          }}
                          className={cn(
                            "inline-flex items-center w-full p-2 hover:bg-muted hover:text-foreground rounded-md text-left",
                            selectedTable === table.table_name &&
                              "bg-muted text-foreground"
                          )}
                        >
                          {table.table_name}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </li>
      </ol>
    </nav>
  );
}

