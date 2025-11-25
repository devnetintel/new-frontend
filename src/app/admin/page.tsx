"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Database, FileText, Activity, ChevronLeft } from "lucide-react";
import { AdminLogsViewer } from "@/components/admin/AdminLogsViewer";
import { AdminDatabaseViewer } from "@/components/admin/AdminDatabaseViewer";

export default function AdminPage() {
  const { user } = useUser();
  const [activeView, setActiveView] = useState<
    "dashboard" | "logs" | "database"
  >("dashboard");

  if (activeView === "dashboard") {
    return (
      <div
        style={{
          maxWidth: "1200px",
          margin: "80px auto",
          padding: "40px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "8px",
              color: "#111",
            }}
          >
            🔧 Admin Dashboard
          </h1>
          <p style={{ color: "#666", fontSize: "16px" }}>
            Welcome, {user?.emailAddresses[0]?.emailAddress || "Admin"}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "24px",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          <div
            onClick={() => setActiveView("logs")}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "32px",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "150px",
                height: "150px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                opacity: 0.1,
                borderRadius: "50%",
                transform: "translate(30%, -30%)",
              }}
            />
            <FileText size={48} color="#667eea" style={{ marginBottom: "16px" }} />
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#111",
              }}
            >
              Search Logs
            </h3>
            <p
              style={{
                color: "#666",
                fontSize: "15px",
                marginBottom: "24px",
                lineHeight: "1.6",
              }}
            >
              View search queries, user activity, performance metrics, and system
              events in real-time
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#667eea",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Open Logs <Activity size={16} style={{ marginLeft: "8px" }} />
            </div>
          </div>

          <div
            onClick={() => setActiveView("database")}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "32px",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "150px",
                height: "150px",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                opacity: 0.1,
                borderRadius: "50%",
                transform: "translate(30%, -30%)",
              }}
            />
            <Database size={48} color="#f5576c" style={{ marginBottom: "16px" }} />
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#111",
              }}
            >
              Database Viewer
            </h3>
            <p
              style={{
                color: "#666",
                fontSize: "15px",
                marginBottom: "24px",
                lineHeight: "1.6",
              }}
            >
              Browse and search all database tables, profiles, and connections
              interactively
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#f5576c",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Open Database <Database size={16} style={{ marginLeft: "8px" }} />
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "48px",
            padding: "24px",
            backgroundColor: "#f9fafb",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ fontSize: "20px" }}>ℹ️</div>
            <div>
              <strong
                style={{ display: "block", marginBottom: "8px", color: "#111" }}
              >
                Admin Access
              </strong>
              <p
                style={{
                  fontSize: "14px",
                  color: "#666",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                These tools are only accessible to admin users. All views are
                embedded directly in the dashboard for a seamless experience. You
                can also open them in new tabs if needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Embedded viewer for logs or database
  const viewTitle = activeView === "logs" ? "Search Logs" : "Database Viewer";
  const viewIcon =
    activeView === "logs" ? (
      <FileText size={24} color="#667eea" />
    ) : (
      <Database size={24} color="#f5576c" />
    );

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f9fafb",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => setActiveView("dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: "transparent",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              color: "#666",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(15, 37, 87, 0.05)";
              e.currentTarget.style.borderColor = "rgba(15, 37, 87, 0.2)";
              e.currentTarget.style.color = "#0f2557";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#666";
            }}
          >
            <ChevronLeft size={16} />
            Back to Dashboard
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              paddingLeft: "16px",
              borderLeft: "1px solid #e5e7eb",
            }}
          >
            {viewIcon}
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                margin: 0,
                color: "#111",
              }}
            >
              {viewTitle}
            </h2>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeView === "logs" ? <AdminLogsViewer /> : <AdminDatabaseViewer />}
      </div>
    </div>
  );
}

