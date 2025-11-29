"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  RefreshCw,
  Search,
  Database as DatabaseIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchAdminTables,
  fetchAdminTableData,
  type AdminTable,
  type AdminTableColumn,
  type AdminWorkspaceStats,
} from "@/services";

export const AdminDatabaseViewer: React.FC = () => {
  const { getToken } = useAuth();
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [workspaceStats, setWorkspaceStats] = useState<AdminWorkspaceStats[]>(
    []
  );
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<AdminTableColumn[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [searchColumn, setSearchColumn] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [orderDirection, setOrderDirection] = useState<"ASC" | "DESC">("DESC");

  // Load tables list
  const loadTables = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      const data = await fetchAdminTables(token);
      setTables(data.tables);
      setWorkspaceStats(data.workspace_stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tables");
    } finally {
      setIsLoading(false);
    }
  };

  // Load table data
  const loadTableData = useCallback(async () => {
    if (!selectedTable) return;

    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      const data = await fetchAdminTableData(token, selectedTable, {
        limit,
        offset: (page - 1) * limit,
        searchColumn: searchColumn || undefined,
        searchValue: searchValue || undefined,
        orderBy: orderBy || undefined,
        orderDirection,
      });
      setColumns(data.columns);
      setRows(data.rows);
      setTotalCount(data.total_count);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load table data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedTable,
    getToken,
    limit,
    page,
    searchColumn,
    searchValue,
    orderBy,
    orderDirection,
  ]);

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      setPage(1); // Reset to page 1 when table changes
      loadTableData();
    }
  }, [selectedTable, loadTableData]);

  useEffect(() => {
    if (selectedTable) {
      loadTableData();
    }
  }, [
    page,
    searchColumn,
    searchValue,
    orderBy,
    orderDirection,
    selectedTable,
    loadTableData,
  ]);

  const handleSelectTable = (tableName: string) => {
    setSelectedTable(tableName);
    setSearchColumn("");
    setSearchValue("");
    setOrderBy("");
    setPage(1);
  };

  const handleSort = (columnName: string) => {
    if (orderBy === columnName) {
      setOrderDirection(orderDirection === "ASC" ? "DESC" : "ASC");
    } else {
      setOrderBy(columnName);
      setOrderDirection("DESC");
    }
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchColumn("");
    setSearchValue("");
    setPage(1);
  };

  const totalPages = limit > 0 ? Math.max(1, Math.ceil(totalCount / limit)) : 1;

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">NULL</span>;
    }
    if (typeof value === "boolean") {
      return value ? "✓" : "✗";
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="h-full flex bg-gray-50 light">
      {/* Sidebar */}
      <div className="w-[250px] bg-white border-r border-gray-200 flex flex-col max-h-screen">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-base font-semibold m-0 text-gray-900">
            📊 Tables ({tables.length})
          </h3>
        </div>
        <div className="flex-1 overflow-auto p-2.5">
          {tables.map((table) => (
            <div
              key={table.table_name}
              onClick={() => handleSelectTable(table.table_name)}
              className={`p-3 mb-1.5 rounded-lg cursor-pointer border border-gray-200 transition-all duration-200 ${
                selectedTable === table.table_name
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="text-sm font-medium">{table.table_name}</div>
              <div className="text-[11px] opacity-70 mt-1">
                {table.row_count.toLocaleString()} rows · {table.column_count}{" "}
                cols
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-h-screen">
        {/* Workspace Stats */}
        {workspaceStats.length > 0 && (
          <div className="bg-gradient-to-br from-pink-400 to-red-500 p-5 px-8 text-white flex gap-5 flex-wrap">
            {workspaceStats.map((ws) => {
              const recorded = ws.recorded_count || 0;
              const actual = ws.actual_count || 0;
              const isSync = recorded === actual;

              return (
                <div
                  key={ws.workspace_id}
                  className="bg-white/20 backdrop-blur-md p-4 px-5 rounded-[10px] min-w-[200px] border border-white/30"
                >
                  <h3 className="text-sm opacity-90 mb-2 font-medium">
                    🏢 {ws.owner_name} ({ws.workspace_id})
                  </h3>
                  <div className="text-[32px] font-bold mb-1">{actual}</div>
                  <div className="text-xs opacity-85">
                    profiles in workspace
                  </div>
                  <div className="mt-2.5 text-xs">
                    Recorded: {recorded} | Actual: {actual}{" "}
                    <span
                      className={`text-lg ${
                        isSync ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isSync ? "✓" : "⚠️"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-5 px-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold m-0 text-gray-900">
                {selectedTable || "Select a Table"}
              </h2>
              {selectedTable && (
                <p className="text-sm text-gray-600 mt-1">
                  Showing {rows.length} of {totalCount.toLocaleString()} rows •
                  Page {page} of {totalPages}
                </p>
              )}
            </div>
            <button
              onClick={selectedTable ? loadTableData : loadTables}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 border-none rounded-lg text-white text-sm font-medium ${
                isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Search & Pagination */}
          {selectedTable && (
            <div className="flex justify-between items-center gap-4">
              <div className="flex gap-2.5 items-center flex-1">
                <select
                  value={searchColumn}
                  onChange={(e) => setSearchColumn(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                >
                  <option value="">-- Select Column --</option>
                  {columns.map((col) => (
                    <option key={col.column_name} value={col.column_name}>
                      {col.column_name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search value..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 max-w-[300px] px-3 py-2 border border-gray-200 rounded-md text-sm"
                />
                <button
                  onClick={handleSearch}
                  aria-label="Search table"
                  className="px-4 py-2 bg-indigo-600 text-white border-none rounded-md cursor-pointer text-sm"
                >
                  <Search size={16} />
                </button>
                {(searchColumn || searchValue) && (
                  <button
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                    className="px-4 py-2 bg-gray-600 text-white border-none rounded-md cursor-pointer text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex gap-2.5 items-center">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                  className={`px-3 py-2 bg-white border border-gray-200 rounded-md ${
                    page === 1
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                  className={`px-3 py-2 bg-white border border-gray-200 rounded-md ${
                    page === totalPages
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5 px-8 min-h-0 overflow-hidden">
          {error && (
            <div className="p-5 bg-red-100 rounded-lg text-red-800 mb-5 flex-shrink-0">
              <strong>Error:</strong> {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-[60px] px-5 text-gray-600">
              <RefreshCw
                size={48}
                color="#667eea"
                className="animate-spin mx-auto"
              />
              <p className="mt-4">Loading...</p>
            </div>
          ) : !selectedTable ? (
            <div className="text-center py-[60px] px-5 text-gray-600">
              <DatabaseIcon size={64} color="#ccc" />
              <h3 className="mt-4">Select a Table</h3>
              <p>Choose a table from the sidebar to view its data</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-[60px] px-5 text-gray-600">
              <h3>No Results Found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="h-[600px] w-[1550px] bg-white rounded-lg shadow-sm overflow-auto">
              <table className="w-max min-w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-300">
                    {columns.map((col) => (
                      <th
                        key={col.column_name}
                        onClick={() => handleSort(col.column_name)}
                        className="p-3 text-left font-semibold text-black cursor-pointer select-none whitespace-nowrap"
                      >
                        {col.column_name}
                        <br />
                        <span className="text-[10px] font-normal opacity-60">
                          {col.data_type}
                        </span>
                        {orderBy === col.column_name && (
                          <span className="ml-2">
                            {orderDirection === "ASC" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      {columns.map((col) => (
                        <td
                          key={col.column_name}
                          className="px-3 py-2.5 whitespace-nowrap align-top text-black"
                        >
                          {formatValue(row[col.column_name])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
