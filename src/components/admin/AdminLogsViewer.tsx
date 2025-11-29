"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { RefreshCw, Search, Filter } from "lucide-react";
import { fetchAdminLogs, type AdminLog } from "@/services";
import { cn } from "@/lib/utils";

export const AdminLogsViewer: React.FC = () => {
  const { getToken } = useAuth();
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 50;
  const [userEmailFilter, setUserEmailFilter] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

  const loadLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      const fetchedLogs = await fetchAdminLogs(
        token,
        limit,
        searchEmail || undefined
      );
      setLogs(fetchedLogs);
    } catch (err) {
      console.error("Error loading logs:", err);
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadLogs, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchEmail]);

  const handleSearch = () => {
    setSearchEmail(userEmailFilter);
  };

  const handleClearSearch = () => {
    setUserEmailFilter("");
    setSearchEmail("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const toggleCell = (cellId: string) => {
    setExpandedCells((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cellId)) {
        newSet.delete(cellId);
      } else {
        newSet.add(cellId);
      }
      return newSet;
    });
  };

  const renderCell = (
    content: any,
    rowIdx: number,
    colName: string,
    maxLength: number = 100
  ) => {
    const cellId = `${rowIdx}-${colName}`;
    const isExpanded = expandedCells.has(cellId);

    if (content === null || content === undefined) {
      return "—";
    }

    let stringContent =
      typeof content === "object"
        ? JSON.stringify(content, null, 2)
        : String(content);

    if (stringContent.length <= maxLength) {
      return stringContent;
    }

    const truncated = stringContent.substring(0, maxLength) + "...";

    return (
      <div
        onClick={() => toggleCell(cellId)}
        className="cursor-pointer select-none"
        title="Click to expand/collapse"
      >
        {isExpanded ? stringContent : truncated}
        <span className="ml-1 text-[10px] text-[#667eea]">
          {isExpanded ? "▲" : "▼"}
        </span>
      </div>
    );
  };

  const successful = logs.filter((l) => (l.final_result_count || 0) > 0).length;
  const noResults = logs.filter(
    (l) => (l.final_result_count || 0) === 0
  ).length;

  return (
    <div className="h-full flex flex-col bg-gray-50 light">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold m-0 text-gray-900">
              Search Logs
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Real-time monitoring • Auto-refresh: 1min • Showing latest{" "}
              {logs.length} searches
            </p>
          </div>
          <button
            onClick={loadLogs}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 bg-[#667eea] border-none rounded-lg text-white text-sm font-medium transition-opacity",
              isLoading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer opacity-100"
            )}
          >
            <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-5 mb-4">
          <div className="px-5 py-3 bg-gray-100 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {logs.length}
            </div>
            <div className="text-xs text-gray-600">Total Logs</div>
          </div>
          <div className="px-5 py-3 bg-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-800">
              {successful}
            </div>
            <div className="text-xs text-green-800">Successful</div>
          </div>
          <div className="px-5 py-3 bg-yellow-100 rounded-lg">
            <div className="text-2xl font-bold text-yellow-800">
              {noResults}
            </div>
            <div className="text-xs text-yellow-800">No Results</div>
          </div>
        </div>

        {/* Search Filter */}
        <div className="flex gap-2.5 items-center">
          <Filter size={16} className="text-gray-600" />
          <input
            type="text"
            placeholder="Filter by user email..."
            value={userEmailFilter}
            onChange={(e) => setUserEmailFilter(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 max-w-[300px] px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#667eea]/20 focus:border-[#667eea]"
          />
          <button
            onClick={handleSearch}
            aria-label="Search logs"
            className="px-4 py-2 bg-[#667eea] text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-[#5568d3] transition-colors"
          >
            <Search size={16} className="inline align-middle" />
          </button>
          {searchEmail && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-red-600 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-5">
        {error && (
          <div className="p-5 bg-red-100 rounded-lg text-red-800 mb-5">
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoading && logs.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-600">
            <RefreshCw
              size={48}
              className="text-[#667eea] mx-auto animate-spin"
            />
            <p className="mt-4">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-600">
            <h3 className="text-lg font-semibold mb-2">No logs found</h3>
            <p>Logs will appear here once users start searching</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-max border-collapse text-[13px] min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-300">
                  <th className="px-3 py-3 text-left font-semibold text-black whitespace-nowrap">
                    Log ID
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-black whitespace-nowrap">
                    Timestamp
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-black whitespace-nowrap">
                    User Email
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-black min-w-[300px]">
                    Query Text
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-black whitespace-nowrap">
                    Is Searchable
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-black whitespace-nowrap">
                    Final Result Count
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-black whitespace-nowrap">
                    Total Execution Time
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-black whitespace-nowrap">
                    Search Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const resultCount = log.final_result_count || 0;
                  const durationMs = log.total_execution_time_ms || 0;
                  const isSlow = durationMs > 3000;

                  return (
                    <tr
                      key={log.log_id || idx}
                      className="border-b border-gray-100"
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap align-top text-black">
                        {log.log_id}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top text-black">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top text-black">
                        {log.user_email || "—"}
                      </td>
                      <td className="px-3 py-2.5 whitespace-pre-wrap align-top break-words text-black">
                        {renderCell(log.query_text, idx, "query_text", 150)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2.5 whitespace-nowrap align-top",
                          log.is_searchable ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {log.is_searchable ? "✓" : "✗"}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2.5 whitespace-nowrap align-top font-semibold text-sm",
                          resultCount > 0 ? "text-green-600" : "text-gray-500"
                        )}
                      >
                        {resultCount}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs",
                            isSlow
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-900"
                          )}
                        >
                          {(durationMs / 1000).toFixed(2)}s
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-semibold",
                            resultCount > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          )}
                        >
                          {resultCount > 0 ? "Success" : "No Results"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
