"use client";

import React, { useMemo, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";

interface AdminTableProps {
  view: "logs" | "database";
  searchQuery: string;
  loading: boolean;
}

export function AdminTable({ view, searchQuery, loading }: AdminTableProps) {
  const { logs, tableColumns, tableRows, selectedTable } = useAdmin();
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

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
        <span className="ml-1 text-[10px] text-purple-400">
          {isExpanded ? "▲" : "▼"}
        </span>
      </div>
    );
  };

  if (view === "logs") {
    const totalColumns = 50; // Total number of columns we're adding
    return (
      <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="w-full h-[80vh]  max-w-[850px] sm:max-w-[900px] sd:max-w-[1000px] md:max-w-[1100px] lg:max-w-[1355px] xl:max-w-[1560px] overflow-x-auto overflow-y-auto themed-scrollbar">
          <table
            style={{ width: "100%", minWidth: "5000px" }}
            className="table-auto"
          >
            <thead className="bg-[#761DE7] border-b-2 border-border">
              <tr>
                {/* Basic Info */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap sticky left-0 bg-[#761DE7] z-10 min-w-[100px]">
                  Log ID
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Timestamp
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Created At
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[150px]">
                  Session ID
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[150px]">
                  User ID
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[150px]">
                  User Email
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  User Name
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  User IP
                </th>

                {/* Query Info */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white min-w-[200px]">
                  Query Text
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[100px]">
                  Query Type
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[100px]">
                  Is Searchable
                </th>

                {/* Parsed Fields */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Parsed Skills
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Parsed Location
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Parsed Domains
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Parsed Company
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Parsed Seniority
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Parsed Education
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Parsed Exp Min
                </th>

                {/* Expanded Fields */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[150px]">
                  Expanded Skills
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[150px]">
                  Expanded Locations
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[150px]">
                  Expanded Companies
                </th>

                {/* Filters */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[150px]">
                  Filters Applied
                </th>

                {/* SQL Metrics */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white min-w-[300px]">
                  SQL Query
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  SQL Gen Time (ms)
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  SQL Exec Time (ms)
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  SQL Rows Returned
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  SQL Error
                </th>

                {/* Vector Metrics */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Vector Exec Time (ms)
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Vector Rows Returned
                </th>

                {/* Hybrid Metrics */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Hybrid Total Results
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Hybrid SQL Only
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Hybrid Vector Only
                </th>

                {/* Reranking */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Reranking Time (ms)
                </th>

                {/* Results */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Final Result Count
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Profiles Evaluated
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Profiles After Filtering
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white min-w-[200px]">
                  Final Results Summary
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[150px]">
                  Top Result Names
                </th>

                {/* Evaluation Pipeline */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[100px]">
                  Criteria Count
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Criteria Ext Success
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Criteria Ext Time (ms)
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white min-w-[300px]">
                  Criteria JSON
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Evaluation Time (ms)
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[150px]">
                  Avg Eval Time/Profile (ms)
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Parallel Eval Success
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Aggregation Time (ms)
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Aggregation Success
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Low Profiles Filtered
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white min-w-[300px]">
                  Detailed Eval Results
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white min-w-[300px]">
                  Results Before Rerank
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white min-w-[300px]">
                  Results After Rerank
                </th>

                {/* Status */}
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Total Exec Time (ms)
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[120px]">
                  Search Status
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white whitespace-nowrap min-w-[150px]">
                  Error Message
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const resultCount = log.final_result_count || 0;
                  const durationMs = log.total_execution_time_ms || 0;
                  const isSlow = durationMs > 3000;

                  return (
                    <tr
                      key={log.log_id || idx}
                      className="border-b border-border hover:bg-[#761DE7]/20 transition-colors"
                    >
                      {/* Basic Info */}
                      <td className="px-2 py-2 whitespace-nowrap align-top sticky left-0 bg-background z-10">
                        <span className="text-xs text-white">
                          {log.log_id || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {formatDate(log.timestamp)}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {formatDate(log.created_at)}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {renderCell(log.session_id, idx, "session_id", 50)}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {renderCell(log.user_id, idx, "user_id", 50)}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.user_email || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.user_name || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.user_ip || "—"}
                        </span>
                      </td>

                      {/* Query Info */}
                      <td className="px-2 py-2 whitespace-pre-wrap align-top break-words">
                        <span className="text-xs text-white">
                          {renderCell(log.query_text, idx, "query_text", 100)}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.query_type || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            log.is_searchable
                              ? "text-green-400"
                              : "text-red-400"
                          )}
                        >
                          {log.is_searchable ? "✓" : "✗"}
                        </span>
                      </td>

                      {/* Parsed Fields */}
                      <td className="px-2 py-2 align-top">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.parsed_skills,
                            idx,
                            "parsed_skills",
                            50
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.parsed_location || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.parsed_domains,
                            idx,
                            "parsed_domains",
                            50
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.parsed_company || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.parsed_seniority || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.parsed_education || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.parsed_experience_min ?? "—"}
                        </span>
                      </td>

                      {/* Expanded Fields */}
                      <td className="px-2 py-2 align-top">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.expanded_skills,
                            idx,
                            "expanded_skills",
                            50
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.expanded_locations,
                            idx,
                            "expanded_locations",
                            50
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.expanded_companies,
                            idx,
                            "expanded_companies",
                            50
                          )}
                        </span>
                      </td>

                      {/* Filters */}
                      <td className="px-2 py-2 align-top">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.filters_applied,
                            idx,
                            "filters_applied",
                            100
                          )}
                        </span>
                      </td>

                      {/* SQL Metrics */}
                      <td className="px-2 py-2 whitespace-pre-wrap align-top break-words">
                        <span className="text-xs text-white">
                          {renderCell(log.sql_query, idx, "sql_query", 100)}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.sql_generation_time_ms ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.sql_execution_time_ms ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.sql_rows_returned ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <span className="text-xs text-white">
                          {renderCell(log.sql_error, idx, "sql_error", 50)}
                        </span>
                      </td>

                      {/* Vector Metrics */}
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.vector_execution_time_ms ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.vector_rows_returned ?? "—"}
                        </span>
                      </td>

                      {/* Hybrid Metrics */}
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.hybrid_total_results ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.hybrid_sql_only ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.hybrid_vector_only ?? "—"}
                        </span>
                      </td>

                      {/* Reranking */}
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.reranking_time_ms ?? "—"}
                        </span>
                      </td>

                      {/* Results */}
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            resultCount > 0 ? "text-green-400" : "text-white"
                          )}
                        >
                          {resultCount}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.profiles_evaluated_count ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.profiles_after_filtering ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-pre-wrap align-top break-words">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.final_results_summary,
                            idx,
                            "final_results_summary",
                            100
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.top_result_names,
                            idx,
                            "top_result_names",
                            100
                          )}
                        </span>
                      </td>

                      {/* Evaluation Pipeline */}
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.criteria_count ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.criteria_extraction_success
                            ? "✓"
                            : log.criteria_extraction_success === false
                            ? "✗"
                            : "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.criteria_extraction_time_ms ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-pre-wrap align-top break-words">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.criteria_json,
                            idx,
                            "criteria_json",
                            100
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.evaluation_time_ms ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.average_evaluation_time_per_profile_ms ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.parallel_evaluation_success
                            ? "✓"
                            : log.parallel_evaluation_success === false
                            ? "✗"
                            : "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.aggregation_time_ms ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.aggregation_success
                            ? "✓"
                            : log.aggregation_success === false
                            ? "✗"
                            : "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span className="text-xs text-white">
                          {log.all_low_profiles_filtered ?? "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-pre-wrap align-top break-words">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.detailed_evaluation_results,
                            idx,
                            "detailed_evaluation_results",
                            100
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-pre-wrap align-top break-words">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.detailed_results_before_rerank,
                            idx,
                            "detailed_results_before_rerank",
                            100
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-pre-wrap align-top break-words">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.detailed_results_after_rerank,
                            idx,
                            "detailed_results_after_rerank",
                            100
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs",
                            isSlow
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-blue-900/30 text-blue-400"
                          )}
                        >
                          {durationMs ? formatResponseTime(durationMs) : "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap align-top">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-semibold",
                            log.search_status === "success"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-yellow-900/30 text-yellow-400"
                          )}
                        >
                          {log.search_status || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <span className="text-xs text-white">
                          {renderCell(
                            log.error_message,
                            idx,
                            "error_message",
                            50
                          )}
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
