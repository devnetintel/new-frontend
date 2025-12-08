"use client";

import React, { useMemo, useState } from "react";
import { Table, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAdmin } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";
import type { AdminLog } from "@/types/admin";
import { Eye } from "lucide-react";

interface AdminTable1Props {
  view: "logs" | "database";
  searchQuery: string;
  loading: boolean;
}

export function AdminTable1({ view, searchQuery, loading }: AdminTable1Props) {
  const { logs, tableColumns, tableRows, selectedTable } = useAdmin();
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());
  const [jsonModal, setJsonModal] = useState<{
    visible: boolean;
    title: string;
    content: string;
  }>({ visible: false, title: "", content: "" });

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

  const renderJsonCell = (
    content: any,
    rowIdx: number,
    colName: string,
    title: string,
    maxLength: number = 50
  ) => {
    if (content === null || content === undefined) {
      return "—";
    }

    let jsonString = "";
    let isJson = false;

    try {
      if (typeof content === "string") {
        // Try to parse if it's a JSON string
        const parsed = JSON.parse(content);
        jsonString = JSON.stringify(parsed, null, 2);
        isJson = true;
      } else if (typeof content === "object") {
        jsonString = JSON.stringify(content, null, 2);
        isJson = true;
      } else {
        jsonString = String(content);
      }
    } catch {
      jsonString = String(content);
    }

    const displayText =
      jsonString.length > maxLength
        ? jsonString.substring(0, maxLength) + "..."
        : jsonString;

    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-white truncate flex-1">
          {displayText}
        </span>
        {isJson && jsonString.length > maxLength && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setJsonModal({
                visible: true,
                title: `${title} (Row ${rowIdx + 1})`,
                content: jsonString,
              });
            }}
            className="shrink-0 p-1 hover:bg-purple-900/30 rounded transition-colors"
            title="View full JSON"
          >
            <Eye className="h-3 w-3 text-purple-400" />
          </button>
        )}
      </div>
    );
  };

  if (view === "logs") {
    // Convert logs to Ant Design dataSource format
    const dataSource = filteredLogs.map((log, idx) => ({
      key: log.log_id || `log-${idx}`,
      ...log,
      _rowIndex: idx, // Store row index for renderCell
    }));

    // Define columns for logs
    const columns: ColumnsType<AdminLog & { key: string; _rowIndex: number }> =
      [
        // Basic Info
        {
          title: "Log ID",
          dataIndex: "log_id",
          key: "log_id",
          width: 100,
          render: (text) => (
            <span className="text-xs text-white">{text || "—"}</span>
          ),
        },
        {
          title: "Timestamp",
          dataIndex: "timestamp",
          key: "timestamp",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{formatDate(text)}</span>
          ),
        },
        {
          title: "Created At",
          dataIndex: "created_at",
          key: "created_at",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{formatDate(text)}</span>
          ),
        },
        {
          title: "Session ID",
          dataIndex: "session_id",
          key: "session_id",
          width: 150,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderCell(text, record._rowIndex, "session_id", 50)}
            </span>
          ),
        },
        {
          title: "User ID",
          dataIndex: "user_id",
          key: "user_id",
          width: 150,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderCell(text, record._rowIndex, "user_id", 50)}
            </span>
          ),
        },
        {
          title: "User Email",
          dataIndex: "user_email",
          key: "user_email",
          width: 150,
          render: (text) => (
            <span className="text-xs text-white">{text || "—"}</span>
          ),
        },
        {
          title: "User Name",
          dataIndex: "user_name",
          key: "user_name",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text || "—"}</span>
          ),
        },
        {
          title: "User IP",
          dataIndex: "user_ip",
          key: "user_ip",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text || "—"}</span>
          ),
        },
        // Query Info
        {
          title: "Query Text",
          dataIndex: "query_text",
          key: "query_text",
          width: 200,
          render: (text, record) => (
            <span className="text-xs text-white whitespace-pre-wrap break-words">
              {renderCell(text, record._rowIndex, "query_text", 100)}
            </span>
          ),
        },
        {
          title: "Query Type",
          dataIndex: "query_type",
          key: "query_type",
          width: 100,
          render: (text) => (
            <span className="text-xs text-white">{text || "—"}</span>
          ),
        },
        {
          title: "Is Searchable",
          dataIndex: "is_searchable",
          key: "is_searchable",
          width: 100,
          render: (text) => (
            <span
              className={cn(
                "text-xs font-semibold",
                text ? "text-green-400" : "text-red-400"
              )}
            >
              {text ? "✓" : "✗"}
            </span>
          ),
        },
        // Parsed Fields
        {
          title: "Parsed Skills",
          dataIndex: "parsed_skills",
          key: "parsed_skills",
          width: 120,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderCell(text, record._rowIndex, "parsed_skills", 50)}
            </span>
          ),
        },
        {
          title: "Parsed Location",
          dataIndex: "parsed_location",
          key: "parsed_location",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text || "—"}</span>
          ),
        },
        {
          title: "Parsed Domains",
          dataIndex: "parsed_domains",
          key: "parsed_domains",
          width: 120,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderCell(text, record._rowIndex, "parsed_domains", 50)}
            </span>
          ),
        },
        {
          title: "Parsed Company",
          dataIndex: "parsed_company",
          key: "parsed_company",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text || "—"}</span>
          ),
        },
        {
          title: "Parsed Seniority",
          dataIndex: "parsed_seniority",
          key: "parsed_seniority",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text || "—"}</span>
          ),
        },
        {
          title: "Parsed Education",
          dataIndex: "parsed_education",
          key: "parsed_education",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text || "—"}</span>
          ),
        },
        {
          title: "Parsed Exp Min",
          dataIndex: "parsed_experience_min",
          key: "parsed_experience_min",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        // Expanded Fields
        {
          title: "Expanded Skills",
          dataIndex: "expanded_skills",
          key: "expanded_skills",
          width: 150,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderCell(text, record._rowIndex, "expanded_skills", 50)}
            </span>
          ),
        },
        {
          title: "Expanded Locations",
          dataIndex: "expanded_locations",
          key: "expanded_locations",
          width: 150,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderCell(text, record._rowIndex, "expanded_locations", 50)}
            </span>
          ),
        },
        {
          title: "Expanded Companies",
          dataIndex: "expanded_companies",
          key: "expanded_companies",
          width: 150,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderCell(text, record._rowIndex, "expanded_companies", 50)}
            </span>
          ),
        },
        // Filters
        {
          title: "Filters Applied",
          dataIndex: "filters_applied",
          key: "filters_applied",
          width: 150,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderJsonCell(
                text,
                record._rowIndex,
                "filters_applied",
                "Filters Applied",
                50
              )}
            </span>
          ),
        },
        // SQL Metrics
        {
          title: "SQL Query",
          dataIndex: "sql_query",
          key: "sql_query",
          width: 300,
          render: (text, record) => (
            <span className="text-xs text-white whitespace-pre-wrap break-words">
              {renderCell(text, record._rowIndex, "sql_query", 100)}
            </span>
          ),
        },
        {
          title: "SQL Gen Time (ms)",
          dataIndex: "sql_generation_time_ms",
          key: "sql_generation_time_ms",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "SQL Exec Time (ms)",
          dataIndex: "sql_execution_time_ms",
          key: "sql_execution_time_ms",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "SQL Rows Returned",
          dataIndex: "sql_rows_returned",
          key: "sql_rows_returned",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "SQL Error",
          dataIndex: "sql_error",
          key: "sql_error",
          width: 120,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderCell(text, record._rowIndex, "sql_error", 50)}
            </span>
          ),
        },
        // Vector Metrics
        {
          title: "Vector Exec Time (ms)",
          dataIndex: "vector_execution_time_ms",
          key: "vector_execution_time_ms",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "Vector Rows Returned",
          dataIndex: "vector_rows_returned",
          key: "vector_rows_returned",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        // Hybrid Metrics
        {
          title: "Hybrid Total Results",
          dataIndex: "hybrid_total_results",
          key: "hybrid_total_results",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "Hybrid SQL Only",
          dataIndex: "hybrid_sql_only",
          key: "hybrid_sql_only",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "Hybrid Vector Only",
          dataIndex: "hybrid_vector_only",
          key: "hybrid_vector_only",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        // Reranking
        {
          title: "Reranking Time (ms)",
          dataIndex: "reranking_time_ms",
          key: "reranking_time_ms",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        // Results
        {
          title: "Final Result Count",
          dataIndex: "final_result_count",
          key: "final_result_count",
          width: 120,
          render: (text) => (
            <span
              className={cn(
                "text-xs font-semibold",
                (text || 0) > 0 ? "text-green-400" : "text-white"
              )}
            >
              {text || 0}
            </span>
          ),
        },
        {
          title: "Profiles Evaluated",
          dataIndex: "profiles_evaluated_count",
          key: "profiles_evaluated_count",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "Profiles After Filtering",
          dataIndex: "profiles_after_filtering",
          key: "profiles_after_filtering",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "Final Results Summary",
          dataIndex: "final_results_summary",
          key: "final_results_summary",
          width: 200,
          render: (text, record) => (
            <span className="text-xs text-white whitespace-pre-wrap break-words">
              {renderCell(text, record._rowIndex, "final_results_summary", 100)}
            </span>
          ),
        },
        {
          title: "Top Result Names",
          dataIndex: "top_result_names",
          key: "top_result_names",
          width: 150,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderCell(text, record._rowIndex, "top_result_names", 100)}
            </span>
          ),
        },
        // Evaluation Pipeline
        {
          title: "Criteria Count",
          dataIndex: "criteria_count",
          key: "criteria_count",
          width: 100,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "Criteria Ext Success",
          dataIndex: "criteria_extraction_success",
          key: "criteria_extraction_success",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">
              {text ? "✓" : text === false ? "✗" : "—"}
            </span>
          ),
        },
        {
          title: "Criteria Ext Time (ms)",
          dataIndex: "criteria_extraction_time_ms",
          key: "criteria_extraction_time_ms",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "Criteria JSON",
          dataIndex: "criteria_json",
          key: "criteria_json",
          width: 300,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderJsonCell(
                text,
                record._rowIndex,
                "criteria_json",
                "Criteria JSON",
                50
              )}
            </span>
          ),
        },
        {
          title: "Evaluation Time (ms)",
          dataIndex: "evaluation_time_ms",
          key: "evaluation_time_ms",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "Avg Eval Time/Profile (ms)",
          dataIndex: "average_evaluation_time_per_profile_ms",
          key: "average_evaluation_time_per_profile_ms",
          width: 150,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "Parallel Eval Success",
          dataIndex: "parallel_evaluation_success",
          key: "parallel_evaluation_success",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">
              {text ? "✓" : text === false ? "✗" : "—"}
            </span>
          ),
        },
        {
          title: "Aggregation Time (ms)",
          dataIndex: "aggregation_time_ms",
          key: "aggregation_time_ms",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "Aggregation Success",
          dataIndex: "aggregation_success",
          key: "aggregation_success",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">
              {text ? "✓" : text === false ? "✗" : "—"}
            </span>
          ),
        },
        {
          title: "Low Profiles Filtered",
          dataIndex: "all_low_profiles_filtered",
          key: "all_low_profiles_filtered",
          width: 120,
          render: (text) => (
            <span className="text-xs text-white">{text ?? "—"}</span>
          ),
        },
        {
          title: "Detailed Eval Results",
          dataIndex: "detailed_evaluation_results",
          key: "detailed_evaluation_results",
          width: 300,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderJsonCell(
                text,
                record._rowIndex,
                "detailed_evaluation_results",
                "Detailed Evaluation Results",
                50
              )}
            </span>
          ),
        },
        {
          title: "Results Before Rerank",
          dataIndex: "detailed_results_before_rerank",
          key: "detailed_results_before_rerank",
          width: 300,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderJsonCell(
                text,
                record._rowIndex,
                "detailed_results_before_rerank",
                "Results Before Rerank",
                50
              )}
            </span>
          ),
        },
        {
          title: "Results After Rerank",
          dataIndex: "detailed_results_after_rerank",
          key: "detailed_results_after_rerank",
          width: 300,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderJsonCell(
                text,
                record._rowIndex,
                "detailed_results_after_rerank",
                "Results After Rerank",
                50
              )}
            </span>
          ),
        },
        // Status
        {
          title: "Total Exec Time (ms)",
          dataIndex: "total_execution_time_ms",
          key: "total_execution_time_ms",
          width: 120,
          render: (text) => {
            const durationMs = text || 0;
            const isSlow = durationMs > 3000;
            return (
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
            );
          },
        },
        {
          title: "Search Status",
          dataIndex: "search_status",
          key: "search_status",
          width: 120,
          render: (text, record) => {
            const resultCount = record.final_result_count || 0;
            return (
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold",
                  text === "success"
                    ? "bg-green-900/30 text-green-400"
                    : "bg-yellow-900/30 text-yellow-400"
                )}
              >
                {text || "—"}
              </span>
            );
          },
        },
        {
          title: "Error Message",
          dataIndex: "error_message",
          key: "error_message",
          width: 150,
          render: (text, record) => (
            <span className="text-xs text-white">
              {renderCell(text, record._rowIndex, "error_message", 50)}
            </span>
          ),
        },
      ];

    return (
      <>
        <style>{`
          .custom-admin-table .ant-table {
            background: transparent;
          }
          .custom-admin-table .ant-table-thead > tr > th {
            background: #761DE7 !important;
            color: white !important;
            border-bottom: 2px solid #e5e7eb;
            font-size: 12px;
            font-weight: 600;
            padding: 8px;
          }
          .custom-admin-table .ant-table-tbody > tr > td {
            background: transparent;
            color: white;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
            padding: 8px;
          }
          .custom-admin-table .ant-table-tbody > tr:hover > td {
            background: rgba(118, 29, 231, 0.2) !important;
          }
          .custom-admin-table .ant-table-container {
            border: none;
          }
          .json-viewer-modal .ant-modal-content {
            background: hsl(240, 15.2%, 6.5%) !important;
            border: 1px solid hsl(266.5, 81.1%, 18.6%) !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
          }
          .json-viewer-modal .ant-modal-header {
            background: hsl(240, 15.2%, 6.5%) !important;
            border-bottom: 1px solid hsl(266.5, 81.1%, 18.6%) !important;
            padding: 20px 24px 20px 24px !important;
            padding-right: 60px !important;
            border-radius: 16px 16px 0 0 !important;
            position: relative !important;
          }
          .json-viewer-modal .ant-modal-title {
            color: hsl(0, 0%, 95%) !important;
            font-size: 16px !important;
            font-weight: 600 !important;
          }
          .json-viewer-modal .ant-modal-close {
            color: hsl(0, 0%, 95%) !important;
            width: 32px !important;
            height: 32px !important;
            border-radius: 8px !important;
            transition: all 0.2s !important;
            top: 16px !important;
            right: 16px !important;
            background: transparent !important;
            border: 1px solid hsl(266.5, 81.1%, 18.6%) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 10 !important;
          }
          .json-viewer-modal .ant-modal-close:hover {
            background: hsl(266.5, 81.1%, 18.6%) !important;
            color: hsl(0, 0%, 95%) !important;
            border-color: hsl(266.4, 80.8%, 51.0%) !important;
          }
          .json-viewer-modal .ant-modal-close-x {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            height: 100% !important;
            font-size: 18px !important;
            line-height: 1 !important;
          }
          .json-viewer-modal .ant-modal-body {
            background: hsl(240, 15.2%, 6.5%) !important;
            padding: 24px !important;
          }
          .custom-admin-table .ant-table-body::-webkit-scrollbar {
            display: none;
          }
          .custom-admin-table .ant-table-body {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .custom-admin-table .ant-spin-dot i {
            background-color: #761DE7 !important;
          }
          .custom-admin-table .ant-spin-text {
            color: #761DE7 !important;
          }
          .custom-admin-table .ant-table-placeholder {
            background: transparent !important;
            border: none !important;
            height: calc(100vh - 340px) !important;
          }
          .custom-admin-table .ant-table-placeholder .ant-empty-description {
            color: #9ca3af !important;
          }
          .custom-admin-table .ant-table-placeholder:hover > td {
            background: transparent !important;
          }
        `}</style>
        <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden h-full flex flex-col">
          <div className="w-full overflow-x-auto max-w-full flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <Table
              dataSource={dataSource}
              columns={columns}
              loading={loading}
              scroll={{ x: "max-content", y: "calc(100vh - 340px)" }}
              pagination={false}
              size="small"
              className="custom-admin-table"
            />
          </div>
        </div>
        <Modal
          title={jsonModal.title}
          open={jsonModal.visible}
          onCancel={() =>
            setJsonModal({ visible: false, title: "", content: "" })
          }
          footer={null}
          width={800}
          className="json-viewer-modal"
        >
          <div className="bg-card/50 border border-border/50 rounded-lg p-4 max-h-[70vh] overflow-auto">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {jsonModal.content}
            </pre>
          </div>
        </Modal>
      </>
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

  // Convert database rows to Ant Design format
  const dbDataSource = filteredTableRows.map((row, idx) => ({
    key: `row-${idx}`,
    ...row,
  }));

  const dbColumns: ColumnsType<any> = tableColumns.map((col, colIdx) => ({
    title: col.column_name,
    dataIndex: col.column_name,
    key: col.column_name,
    width: 150,
    render: (text, record, rowIdx) => {
      // Check if the value is JSON
      let isJson = false;
      let jsonString = "";

      try {
        if (
          typeof text === "string" &&
          (text.startsWith("{") || text.startsWith("["))
        ) {
          const parsed = JSON.parse(text);
          jsonString = JSON.stringify(parsed, null, 2);
          isJson = true;
        } else if (typeof text === "object" && text !== null) {
          jsonString = JSON.stringify(text, null, 2);
          isJson = true;
        }
      } catch {
        // Not JSON
      }

      const displayText = String(
        text !== null && text !== undefined ? text : "—"
      );
      const truncated =
        displayText.length > 50
          ? displayText.substring(0, 50) + "..."
          : displayText;

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground whitespace-nowrap truncate flex-1">
            {truncated}
          </span>
          {isJson && jsonString.length > 50 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setJsonModal({
                  visible: true,
                  title: `${col.column_name} (Row ${rowIdx + 1})`,
                  content: jsonString,
                });
              }}
              className="shrink-0 p-1 hover:bg-purple-900/30 rounded transition-colors"
              title="View full JSON"
            >
              <Eye className="h-3 w-3 text-purple-400" />
            </button>
          )}
        </div>
      );
    },
  }));

  return (
    <>
      <style>{`
        .custom-admin-table .ant-table {
          background: transparent;
        }
        .custom-admin-table .ant-table-thead > tr > th {
          background: #761DE7 !important;
          color: white !important;
          border-bottom: 2px solid #e5e7eb;
          font-size: 12px;
          font-weight: 600;
          padding: 8px;
        }
        .custom-admin-table .ant-table-tbody > tr > td {
          background: transparent;
          color: white;
          border-bottom: 1px solid #e5e7eb;
          font-size: 12px;
          padding: 8px;
        }
        .custom-admin-table .ant-table-tbody > tr:hover > td {
          background: rgba(118, 29, 231, 0.2) !important;
        }
        .custom-admin-table .ant-table-container {
          border: none;
        }
        .json-viewer-modal .ant-modal-content {
          background: hsl(240, 15.2%, 6.5%) !important;
          border: 1px solid hsl(266.5, 81.1%, 18.6%) !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
        }
        .json-viewer-modal .ant-modal-header {
          background: hsl(240, 15.2%, 6.5%) !important;
          border-bottom: 1px solid hsl(266.5, 81.1%, 18.6%) !important;
          padding: 20px 24px 20px 24px !important;
          padding-right: 60px !important;
          border-radius: 16px 16px 0 0 !important;
          position: relative !important;
        }
        .json-viewer-modal .ant-modal-body {
          background: hsl(240, 15.2%, 6.5%) !important;
          padding: 24px !important;
        }
        .json-viewer-modal .ant-modal-title {
          color: hsl(0, 0%, 95%) !important;
          font-size: 16px !important;
          font-weight: 600 !important;
        }
        .json-viewer-modal .ant-modal-close {
          color: black !important;
          width: 32px !important;
          height: 32px !important;
          transition: all 0.2s !important;
          top: 0px !important;
          right: 0px !important;
          background: transparent !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 10 !important;  
        }
       
        .json-viewer-modal .ant-modal-close-x {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          font-size: 18px !important;
          line-height: 1 !important;
        }
        .json-content-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .json-content-wrapper::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .json-content-wrapper::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .json-content-wrapper::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
        .custom-admin-table .ant-table-body::-webkit-scrollbar {
          display: none;
        }
        .custom-admin-table .ant-table-body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-admin-table .ant-spin-dot i {
          background-color: #761DE7 !important;
        }
        .custom-admin-table .ant-spin-text {
          color: #761DE7 !important;
        }
        .custom-admin-table .ant-table-placeholder {
          background: transparent !important;
          border: none !important;
          height: calc(100vh - 340px) !important;
        }
        .custom-admin-table .ant-table-placeholder .ant-empty-description {
          color: #9ca3af !important;
        }
        .custom-admin-table .ant-table-placeholder:hover > td {
          background: transparent !important;
        }
      `}</style>
      <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden h-full flex flex-col">
        <div className="w-full overflow-x-auto max-w-full flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <Table
            dataSource={dbDataSource}
            columns={dbColumns}
            loading={loading}
            scroll={{ x: "max-content", y: "calc(100vh - 340px)" }}
            pagination={false}
            size="small"
            className="custom-admin-table"
          />
        </div>
        <Modal
          title={jsonModal.title}
          open={jsonModal.visible}
          onCancel={() =>
            setJsonModal({ visible: false, title: "", content: "" })
          }
          footer={null}
          width={800}
          className="json-viewer-modal"
        >
          <div className="bg-card/50 border border-border/50 rounded-lg p-4 max-h-[70vh] overflow-auto json-content-wrapper">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {jsonModal.content}
            </pre>
          </div>
        </Modal>
      </div>
    </>
  );
}
