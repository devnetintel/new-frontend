"use client";

import React from "react";
import { AdminProvider } from "@/contexts/AdminContext";
import { NewAdminDashboard } from "@/components/admin/NewAdminDashboard";

export default function NewAdminPage() {
  return (
    <AdminProvider>
      <NewAdminDashboard />
    </AdminProvider>
  );
}

