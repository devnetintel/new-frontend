"use client";

import React, { useMemo } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";

interface AdminTableProps {
  view: "logs" | "database";
  searchQuery: string;
  loading: boolean;
}

export function AdminTable({ view, searchQuery, loading }: AdminTableProps) {
  const { logs, tableColumns, tableRows, selectedTable } = useAdmin();

  // Filter logs based on search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        log.query_text?.toLowerCase().includes(query) ||
        log.user_email?.toLowerCase().includes(query) ||
        log.log_id?.toLowerCase().includes(query)
    );
  }, [logs, searchQuery]);

  // Filter table rows based on search query
  const filteredTableRows = useMemo(() => {
    if (!searchQuery.trim() || !selectedTable) return tableRows;
    const query = searchQuery.toLowerCase();
    return tableRows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(query)
      )
    );
  }, [tableRows, searchQuery, selectedTable]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString();
  };

  const formatResponseTime = (ms: number | undefined) => {
    if (!ms) return "—";
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (view === "logs") {
    return (
      <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto overflow-y-auto themed-scrollbar">
          <table
            style={{ width: "100%", minWidth: "1200px" }}
            className="table-auto"
          >
            <thead className="bg-[#761DE7] border-b-2 border-border">
              <tr>
                <th className="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap min-w-[150px]">
                  Log ID
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap min-w-[150px]">
                  Timestamp
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap min-w-[150px]">
                  User Email
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-white min-w-[300px]">
                  Query Text
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Is Searchable
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap min-w-[130px]">
                  Final Result Count
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap min-w-[150px]">
                  Total Execution Time
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap min-w-[130px]">
                  Search Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const resultCount = log.final_result_count || 0;
                  const durationMs = log.total_execution_time_ms || 0;
                  const isSlow = durationMs > 3000;

                  return (
                    <tr
                      key={log.log_id}
                      className="border-b border-border hover:bg-[#761DE7]/20 transition-colors"
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">
                        <span className="text-sm text-white">
                          {log.log_id || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">
                        <span className="text-sm text-white">
                          {formatDate(log.timestamp)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">
                        <span className="text-sm text-white">
                          {log.user_email || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-pre-wrap align-top break-words">
                        <span className="text-sm text-white">
                          {log.query_text || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            log.is_searchable
                              ? "text-green-400"
                              : "text-red-400"
                          )}
                        >
                          {log.is_searchable ? "✓" : "✗"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            resultCount > 0 ? "text-green-400" : "text-white"
                          )}
                        >
                          {resultCount}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs",
                            isSlow
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-blue-900/30 text-blue-400"
                          )}
                        >
                          {formatResponseTime(durationMs)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-semibold",
                            resultCount > 0
                              ? "bg-green-900/30 text-green-400"
                              : "bg-yellow-900/30 text-yellow-400"
                          )}
                        >
                          {resultCount > 0 ? "Success" : "No Results"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Database view
  if (!selectedTable) {
    return (
      <div className="bg-background rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">
          Select a table from the sidebar to view data
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="w-full h-[55vh] lg:h-[68vh]  max-w-[850px] sm:max-w-[900px] sd:max-w-[1000px] md:max-w-[1100px] lg:max-w-[1355px] xl:max-w-[1560px] overflow-x-auto overflow-y-auto themed-scrollbar">
        <table
          style={{ width: "100%", minWidth: "1000px" }}
          className="table-auto"
        >
          <thead className="bg-[#761DE7] border-b-2 border-border">
            <tr>
              {tableColumns.map((column) => (
                <th
                  key={column.column_name}
                  className="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap min-w-[150px]"
                >
                  {column.column_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : filteredTableRows.length === 0 ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No data found
                </td>
              </tr>
            ) : (
              filteredTableRows.map((row, idx) => {
                return (
                  <tr
                    key={idx}
                    className="border-b border-border hover:bg-[#761DE7]/20 transition-colors"
                  >
                    {tableColumns.map((column) => {
                      const value = row[column.column_name];
                      return (
                        <td
                          key={column.column_name}
                          className="px-3 py-2.5 min-w-[150px]"
                        >
                          <span className="text-sm text-foreground whitespace-nowrap">
                            {value !== null && value !== undefined
                              ? String(value)
                              : "—"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
