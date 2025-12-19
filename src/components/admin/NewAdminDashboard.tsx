"use client";

import React, { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { AdminSidebar } from "./AdminSidebar";
import { AdminStatsCards } from "./AdminStatsCards";
import { AdminTable } from "./AdminTable";
import { AdminTable1 } from "./AdminTable1";
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
  FileText,
  Database,
  Activity,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ViewType = "dashboard" | "logs" | "database";

export function NewAdminDashboard() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
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
    setTableOrderDirection,
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
      // Set order direction to DESC when searching (matches API format)
      setTableOrderDirection("DESC");
      // Reset to first page when searching
      setTablePage(1);
      refreshTableData();
    }
  };

  const totalPages = Math.ceil(tableTotalCount / tableLimit);

  // Show landing page when dashboard is selected
  if (activeView === "dashboard") {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              🔧 Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome,{" "}
              {(typeof window !== "undefined" &&
                localStorage.getItem("userEmail")) ||
                "Admin"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Search Logs Card */}
            <div
              onClick={() => setActiveView("logs")}
              className="bg-background border border-border rounded-2xl p-8 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#761DE7]/10 rounded-full transform translate-x-1/2 -translate-y-1/2" />
              <FileText className="h-12 w-12 text-[#761DE7] mb-4 relative z-10" />
              <h3 className="text-2xl font-semibold text-foreground mb-3 relative z-10">
                Search Logs
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                View search queries, user activity, performance metrics, and
                system events in real-time.
              </p>
              <div className="flex items-center text-[#761DE7] font-medium text-sm relative z-10 group-hover:gap-2 transition-all">
                Open Logs <Activity className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Database Viewer Card */}
            <div
              onClick={() => setActiveView("database")}
              className="bg-background border border-border rounded-2xl p-8 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#f5576c]/10 rounded-full transform translate-x-1/2 -translate-y-1/2" />
              <Database className="h-12 w-12 text-[#f5576c] mb-4 relative z-10" />
              <h3 className="text-2xl font-semibold text-foreground mb-3 relative z-10">
                Database Viewer
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                Browse and search all database tables, profiles, and connections
                interactively.
              </p>
              <div className="flex items-center text-[#f5576c] font-medium text-sm relative z-10 group-hover:gap-2 transition-all">
                Open Database <Database className="h-4 w-4 ml-2" />
              </div>
            </div>
          </div>

          {/* Admin Access Info Card */}
          <div className="bg-background border border-border rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <strong className="block mb-2 text-foreground text-lg">
                  Admin Access
                </strong>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  These tools are only accessible to admin users. All views are
                  embedded directly in the dashboard for a seamless experience.
                  You can also open them in new tabs if needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-[250px] shrink-0 bg-background border-r border-border transform transition-transform duration-300 ease-in-out",
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
          onTableSelect={(table) => {
            setSelectedTable(table);
            setSidebarOpen(false);
          }}
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
      <div className="flex-1 flex flex-col overflow-hidden bg-background min-w-0">
        {/* Header */}
        <div className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
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
              <div>
                <h1 className="text-2xl font-semibold text-foreground whitespace-nowrap">
                  {activeView === "logs"
                    ? "Search Logs"
                    : activeView === "database"
                    ? "Database Viewer"
                    : "Admin Dashboard"}
                </h1>
                <div className="-ml-2 mt-1">
                  <AdminBreadcrumbs
                    activeView={activeView}
                    selectedTable={selectedTable}
                    tables={tables}
                    onTableSelect={setSelectedTable}
                    onViewChange={setActiveView}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {activeView === "logs" && (
          <div className="px-6 py-2">
            <AdminStatsCards logs={logs} />
          </div>
        )}

        {/* Workspace Stats Cards */}
        {activeView === "database" && (
          <div className="px-6 py-2">
            <div className="w-full max-w-[calc(100vw-48px)] lg:max-w-[calc(100vw-300px)]">
              <AdminWorkspaceStatsCards workspaceStats={workspaceStats} />
            </div>
          </div>
        )}

        {/* Search Controls & Pagination */}
        {activeView === "database" && selectedTable && (
          <div className="px-6 pb-4">
            <div className="w-full max-w-[calc(100vw-48px)] lg:max-w-[calc(100vw-300px)] flex flex-col gap-2">
              <div className="flex items-center gap-2 w-full">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={logsLoading || databaseLoading}
                  className="h-9 w-9 p-0 rounded-full ml-1"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      logsLoading || databaseLoading ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </div>

              {/* Pagination Controls (Top) */}
              <div className="flex items-center gap-3 self-start lg:hidden">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {(tablePage - 1) * tableLimit + 1}-
                  {Math.min(tablePage * tableLimit, tableTotalCount)} of{" "}
                  {tableTotalCount.toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTablePage(Math.max(1, tablePage - 1))}
                    disabled={databaseLoading || tablePage === 1}
                    className="h-9 w-9 p-0 rounded-full border-border bg-transparent hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTablePage(tablePage + 1)}
                    disabled={
                      databaseLoading ||
                      tablePage * tableLimit >= tableTotalCount
                    }
                    className="h-9 w-9 p-0 rounded-full border-border bg-muted hover:bg-muted/80"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 px-6 pb-6 min-w-0 relative flex flex-col overflow-hidden">
          <div className="w-full flex-1 relative overflow-hidden max-w-[calc(100vw-48px)] lg:max-w-[calc(100vw-300px)]">
            <AdminTable1
              view={activeView}
              searchQuery={searchQuery}
              loading={activeView === "logs" ? logsLoading : databaseLoading}
            />
          </div>

          {/* Pagination Controls (Bottom - Desktop Only) */}
          {activeView === "database" && selectedTable && (
            <div className="hidden lg:flex items-center justify-start gap-2 pt-4">
              <span className="text-xs text-muted-foreground whitespace-nowrap mr-2">
                Showing{" "}
                {Math.min(
                  tableLimit,
                  tableTotalCount - (tablePage - 1) * tableLimit
                )}{" "}
                results of {tableTotalCount.toLocaleString()}
              </span>
              <div className="h-3 w-px bg-border mx-2" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTablePage(Math.max(1, tablePage - 1))}
                disabled={databaseLoading || tablePage === 1}
                className="flex items-center gap-1 h-8 px-3 text-xs border-border bg-transparent hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <ChevronLeft className="h-3 w-3" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTablePage(tablePage + 1)}
                disabled={
                  databaseLoading || tablePage * tableLimit >= tableTotalCount
                }
                className="flex items-center gap-1 h-8 px-3 text-xs border-border bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
