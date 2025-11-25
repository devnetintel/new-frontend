/**
 * API Services Index
 * Central export point for all API services
 */

// Search APIs
export * from "./search";

// Workspace APIs
export * from "./workspaces";

// My Requests APIs
export * from "./my-requests";

// Introduction Requests APIs
export * from "./intro-requests";

// Admin APIs
export * from "./admin";

// Re-export types for convenience
export type {
  Connection,
  WorkspaceInfo,
  BackendPerson,
  BackendQueryResponse,
  IntroRequest,
  SubmitIntroRequestPayload,
  SubmitIntroRequestResponse,
  MyRequestsResponse,
  AdminLog,
  AdminTable,
  AdminTableColumn,
  AdminWorkspaceStats,
} from "@/types";
