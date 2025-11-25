"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { RefreshCw, Search, Filter } from "lucide-react";
import { fetchAdminLogs, type AdminLog } from "@/services";

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
      const fetchedLogs = await fetchAdminLogs(token, limit, searchEmail || undefined);
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
        style={{ cursor: "pointer", userSelect: "none" }}
        title="Click to expand/collapse"
      >
        {isExpanded ? stringContent : truncated}
        <span style={{ marginLeft: "4px", color: "#667eea", fontSize: "10px" }}>
          {isExpanded ? "▲" : "▼"}
        </span>
      </div>
    );
  };

  const successful = logs.filter((l) => (l.final_result_count || 0) > 0).length;
  const noResults = logs.filter((l) => (l.final_result_count || 0) === 0).length;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "20px 30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                margin: 0,
                color: "#111",
              }}
            >
              Search Logs
            </h2>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
              Real-time monitoring • Auto-refresh: 1min • Showing latest{" "}
              {logs.length} searches
            </p>
          </div>
          <button
            onClick={loadLogs}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: "#667eea",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <RefreshCw
              size={16}
              style={{ animation: isLoading ? "spin 1s linear infinite" : "none" }}
            />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
          <div
            style={{
              padding: "12px 20px",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#111" }}>
              {logs.length}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>Total Logs</div>
          </div>
          <div
            style={{
              padding: "12px 20px",
              backgroundColor: "#d4edda",
              borderRadius: "8px",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#155724" }}
            >
              {successful}
            </div>
            <div style={{ fontSize: "12px", color: "#155724" }}>Successful</div>
          </div>
          <div
            style={{
              padding: "12px 20px",
              backgroundColor: "#fff3cd",
              borderRadius: "8px",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#856404" }}
            >
              {noResults}
            </div>
            <div style={{ fontSize: "12px", color: "#856404" }}>No Results</div>
          </div>
        </div>

        {/* Search Filter */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Filter size={16} color="#666" />
          <input
            type="text"
            placeholder="Filter by user email..."
            value={userEmailFilter}
            onChange={(e) => setUserEmailFilter(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            style={{
              flex: 1,
              maxWidth: "300px",
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
          <button
            onClick={handleSearch}
            aria-label="Search logs"
            style={{
              padding: "8px 16px",
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <Search size={16} style={{ display: "inline", verticalAlign: "middle" }} />
          </button>
          {searchEmail && (
            <button
              onClick={handleClearSearch}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 30px" }}>
        {error && (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f8d7da",
              borderRadius: "8px",
              color: "#721c24",
              marginBottom: "20px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoading && logs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#666",
            }}
          >
            <RefreshCw
              size={48}
              color="#667eea"
              style={{ animation: "spin 1s linear infinite" }}
            />
            <p style={{ marginTop: "16px" }}>Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#666",
            }}
          >
            <h3>No logs found</h3>
            <p>Logs will appear here once users start searching</p>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "max-content",
                borderCollapse: "collapse",
                fontSize: "13px",
                minWidth: "100%",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#495057",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Log ID
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#495057",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Timestamp
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#495057",
                      whiteSpace: "nowrap",
                    }}
                  >
                    User Email
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#495057",
                      minWidth: "300px",
                    }}
                  >
                    Query Text
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#495057",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Is Searchable
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#495057",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Final Result Count
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#495057",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Total Execution Time
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#495057",
                      whiteSpace: "nowrap",
                    }}
                  >
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
                      style={{ borderBottom: "1px solid #f1f3f5" }}
                    >
                      <td
                        style={{
                          padding: "10px 12px",
                          whiteSpace: "nowrap",
                          verticalAlign: "top",
                        }}
                      >
                        {log.log_id}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          whiteSpace: "nowrap",
                          verticalAlign: "top",
                        }}
                      >
                        {formatDate(log.timestamp)}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          whiteSpace: "nowrap",
                          verticalAlign: "top",
                        }}
                      >
                        {log.user_email || "—"}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          verticalAlign: "top",
                        }}
                      >
                        {renderCell(log.query_text, idx, "query_text", 150)}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          whiteSpace: "nowrap",
                          verticalAlign: "top",
                          color: log.is_searchable ? "#28a745" : "#dc3545",
                        }}
                      >
                        {log.is_searchable ? "✓" : "✗"}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          whiteSpace: "nowrap",
                          verticalAlign: "top",
                          fontWeight: "600",
                          fontSize: "14px",
                          color: resultCount > 0 ? "#28a745" : "#6c757d",
                        }}
                      >
                        {resultCount}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          whiteSpace: "nowrap",
                          verticalAlign: "top",
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            backgroundColor: isSlow ? "#fff3cd" : "#e7f3ff",
                            color: isSlow ? "#856404" : "#004085",
                          }}
                        >
                          {(durationMs / 1000).toFixed(2)}s
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          whiteSpace: "nowrap",
                          verticalAlign: "top",
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor:
                              resultCount > 0 ? "#d4edda" : "#fff3cd",
                            color: resultCount > 0 ? "#155724" : "#856404",
                          }}
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

      <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  );
};

