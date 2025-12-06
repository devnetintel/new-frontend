"use client";

import React, { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { AdminSidebar } from "./AdminSidebar";
import { AdminStatsCards } from "./AdminStatsCards";
import { AdminTable } from "./AdminTable";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { AdminWorkspaceStatsCards } from "./AdminWorkspaceStatsCards";
import { CustomSelect } from "./CustomSelect";
import {
  RefreshCw,
  Search,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ViewType = "logs" | "database";

export function NewAdminDashboard() {
  const [activeView, setActiveView] = useState<ViewType>("logs");
  const [searchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    logs,
    logsLoading,
    refreshLogs,
    tables,
    workspaceStats,
    selectedTable,
    setSelectedTable,
    refreshTables,
    refreshTableData,
    databaseLoading,
    tablePage,
    setTablePage,
    tableLimit,
    tableTotalCount,
    tableColumns,
    tableSearchColumn,
    setTableSearchColumn,
    tableSearchValue,
    setTableSearchValue,
  } = useAdmin();

  // Load initial data
  useEffect(() => {
    refreshLogs();
    refreshTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    if (activeView === "logs") {
      refreshLogs();
    } else {
      if (selectedTable) {
        refreshTableData();
      } else {
        refreshTables();
      }
    }
  };

  const handleTableSearch = () => {
    if (selectedTable) {
      refreshTableData();
    }
  };

  const totalPages = Math.ceil(tableTotalCount / tableLimit);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-[250px] bg-background border-r border-border transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <AdminSidebar
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }}
          selectedTable={selectedTable}
          tables={tables}
          onTableSelect={setSelectedTable}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Breadcrumbs */}
        <div className="bg-background border-b border-border px-6 py-3">
          <AdminBreadcrumbs
            activeView={activeView}
            selectedTable={selectedTable}
            tables={tables}
            onTableSelect={setSelectedTable}
            onViewChange={setActiveView}
          />
        </div>

        {/* Header */}
        <div className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden h-10 w-10 p-0"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5 text-foreground" />
                ) : (
                  <Menu className="h-5 w-5 text-foreground" />
                )}
              </Button>
              <h1 className="text-2xl font-semibold text-foreground">
                {activeView === "logs" ? "Search Logs" : "Database Viewer"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Search Controls - Only for database view */}
              {activeView === "database" && selectedTable && (
                <>
                  <CustomSelect
                    value={tableSearchColumn}
                    onChange={setTableSearchColumn}
                    options={tableColumns.map((col) => ({
                      value: col.column_name,
                      label: col.column_name,
                    }))}
                    placeholder="-- Select Column --"
                  />
                  <Input
                    type="text"
                    placeholder="Search value..."
                    value={tableSearchValue}
                    onChange={(e) => setTableSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleTableSearch()}
                    className="flex-1 max-w-[300px] h-9 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-full"
                  />
                  <Button
                    onClick={handleTableSearch}
                    size="sm"
                    className="bg-[#761DE7] hover:bg-[#6518c4] text-white h-9 w-9 p-0 rounded-full"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={logsLoading || databaseLoading}
                className="h-10 w-10 p-0 rounded-full"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    logsLoading || databaseLoading ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {activeView === "logs" && (
          <div className="px-6 py-2">
            <AdminStatsCards logs={logs} />
          </div>
        )}

        {/* Workspace Stats Cards with Pagination */}
        {activeView === "database" && (
          <div className="px-6 py-2">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <AdminWorkspaceStatsCards workspaceStats={workspaceStats} />
              </div>
              {selectedTable && (
                <div className="flex items-center gap-2 bg-background border border-border rounded-md shadow-sm px-3 py-1.5 shrink-0">
                  <span className="text-xs text-foreground whitespace-nowrap">
                    Showing{" "}
                    {Math.min(
                      tableLimit,
                      tableTotalCount - (tablePage - 1) * tableLimit
                    )}{" "}
                    results of {tableTotalCount.toLocaleString()}
                  </span>
                  <div className="h-3 w-px bg-border" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTablePage(Math.max(1, tablePage - 1))}
                    disabled={databaseLoading || tablePage === 1}
                    className="flex items-center gap-1 h-7 px-2 text-xs border-border bg-transparent hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTablePage(tablePage + 1)}
                    disabled={
                      databaseLoading ||
                      tablePage * tableLimit >= tableTotalCount
                    }
                    className="flex items-center gap-1 h-7 px-2 text-xs border-border bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-hidden px-6 pb-6 min-w-0 relative">
          <div className="w-full h-[70vh] overflow-auto no-scrollbar">
            <AdminTable
              view={activeView}
              searchQuery={searchQuery}
              loading={activeView === "logs" ? logsLoading : databaseLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
