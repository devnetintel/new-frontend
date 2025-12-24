/**
 * API Services Index
 * Central export point for all API services
 */

// Search APIs
export * from "./search";

// Chat APIs
export * from "./chat";

// Transcription APIs
export * from "./transcribe";

// Workspace APIs
export * from "./workspaces";

// My Requests APIs
export * from "./my-requests";

// Introduction Requests APIs
export * from "./intro-requests";

// Admin APIs
export * from "./admin";

// History APIs
export * from "./history";

// Onboarding APIs
export * from "./onboarding";

// Re-export types for convenience
export type {
  Connection,
  WorkspaceInfo,
  BackendPerson,
  BackendQueryResponse,
  ChatResponse,
  AskRequest,
  IntroRequest,
  SubmitIntroRequestPayload,
  SubmitIntroRequestResponse,
  MyRequestsResponse,
  AdminLog,
  AdminTable,
  AdminTableColumn,
  AdminWorkspaceStats,
} from "@/types";

// Re-export transcription types
export type { TranscriptionResponse } from "./transcribe";

// Onboarding types
export type { OnboardingSubmitResponse } from "./onboarding";
