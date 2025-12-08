"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  fetchAdminLogs,
  fetchAdminTables,
  fetchAdminTableData,
  type AdminLog,
  type AdminTable,
  type AdminTableColumn,
  type AdminWorkspaceStats,
} from "@/services";

interface AdminContextType {
  // Logs data
  logs: AdminLog[];
  logsLoading: boolean;
  logsError: string | null;
  refreshLogs: () => Promise<void>;
  
  // Database data
  tables: AdminTable[];
  workspaceStats: AdminWorkspaceStats[];
  selectedTable: string | null;
  tableColumns: AdminTableColumn[];
  tableRows: any[];
  tableTotalCount: number;
  databaseLoading: boolean;
  databaseError: string | null;
  
  // Actions
  setSelectedTable: (tableName: string | null) => void;
  refreshTables: () => Promise<void>;
  refreshTableData: () => Promise<void>;
  
  // Table data filters
  tablePage: number;
  setTablePage: (page: number) => void;
  tableLimit: number;
  tableSearchColumn: string;
  setTableSearchColumn: (col: string) => void;
  tableSearchValue: string;
  setTableSearchValue: (val: string) => void;
  tableOrderBy: string;
  setTableOrderBy: (col: string) => void;
  tableOrderDirection: "ASC" | "DESC";
  setTableOrderDirection: (dir: "ASC" | "DESC") => void;
  
  // Logs filters
  logsLimit: number;
  setLogsLimit: (limit: number) => void;
  logsUserEmail: string;
  setLogsUserEmail: (email: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  
  // Logs state
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [logsLimit, setLogsLimit] = useState(50);
  const [logsUserEmail, setLogsUserEmail] = useState("");
  
  // Database state
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [workspaceStats, setWorkspaceStats] = useState<AdminWorkspaceStats[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState<AdminTableColumn[]>([]);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [tableTotalCount, setTableTotalCount] = useState(0);
  const [databaseLoading, setDatabaseLoading] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  
  // Table filters
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit] = useState(50);
  const [tableSearchColumn, setTableSearchColumn] = useState("");
  const [tableSearchValue, setTableSearchValue] = useState("");
  const [tableOrderBy, setTableOrderBy] = useState("");
  const [tableOrderDirection, setTableOrderDirection] = useState<"ASC" | "DESC">("ASC");
  
  // Load logs
  const refreshLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      const fetchedLogs = await fetchAdminLogs(
        token,
        logsLimit,
        logsUserEmail || undefined
      );
      setLogs(fetchedLogs);
    } catch (err) {
      setLogsError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLogsLoading(false);
    }
  }, [getToken, logsLimit, logsUserEmail]);
  
  // Load tables list
  const refreshTables = useCallback(async () => {
    setDatabaseLoading(true);
    setDatabaseError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      const data = await fetchAdminTables(token);
      setTables(data.tables);
      setWorkspaceStats(data.workspace_stats);
    } catch (err) {
      setDatabaseError(err instanceof Error ? err.message : "Failed to load tables");
    } finally {
      setDatabaseLoading(false);
    }
  }, [getToken]);
  
  // Load table data
  const refreshTableData = useCallback(async () => {
    if (!selectedTable) return;
    
    setDatabaseLoading(true);
    setDatabaseError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      // Read search values directly from state (not from dependencies)
      // This prevents auto-refresh when search values change
      const data = await fetchAdminTableData(token, selectedTable, {
        limit: tableLimit,
        offset: (tablePage - 1) * tableLimit,
        searchColumn: tableSearchColumn || undefined,
        searchValue: tableSearchValue || undefined,
        orderBy: tableOrderBy || undefined,
        orderDirection: tableOrderDirection,
      });
      setTableColumns(data.columns);
      setTableRows(data.rows);
      setTableTotalCount(data.total_count);
    } catch (err) {
      setDatabaseError(
        err instanceof Error ? err.message : "Failed to load table data"
      );
    } finally {
      setDatabaseLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedTable,
    getToken,
    tableLimit,
    tablePage,
    // Removed tableSearchColumn and tableSearchValue from dependencies
    // They are read directly from state to prevent auto-refresh
    tableOrderBy,
    tableOrderDirection,
  ]);
  
  // Load table data when filters change (but not search column/value - those are manual)
  useEffect(() => {
    if (selectedTable) {
      refreshTableData();
    }
  }, [selectedTable, tablePage, tableOrderBy, tableOrderDirection, refreshTableData]);
  
  // Reset table data when table changes
  useEffect(() => {
    if (selectedTable) {
      setTablePage(1);
      setTableSearchColumn("");
      setTableSearchValue("");
      setTableOrderBy("");
      setTableOrderDirection("ASC");
    }
  }, [selectedTable]);
  
  const value: AdminContextType = {
    logs,
    logsLoading,
    logsError,
    refreshLogs,
    tables,
    workspaceStats,
    selectedTable,
    tableColumns,
    tableRows,
    tableTotalCount,
    databaseLoading,
    databaseError,
    setSelectedTable,
    refreshTables,
    refreshTableData,
    tablePage,
    setTablePage,
    tableLimit,
    tableSearchColumn,
    setTableSearchColumn,
    tableSearchValue,
    setTableSearchValue,
    tableOrderBy,
    setTableOrderBy,
    tableOrderDirection,
    setTableOrderDirection,
    logsLimit,
    setLogsLimit,
    logsUserEmail,
    setLogsUserEmail,
  };
  
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

