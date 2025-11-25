/**
 * @deprecated This file is kept for backward compatibility.
 * Please use imports from @/types instead:
 * - import { Connection, WorkspaceInfo } from "@/types"
 * - import { BackendPerson, BackendQueryResponse } from "@/types"
 * - import { IntroRequest, SubmitIntroRequestPayload } from "@/types"
 */

// Re-export from organized type files
export type { Connection, WorkspaceInfo } from "./connection";
export type { BackendPerson, BackendQueryResponse } from "./search";
export type {
  IntroRequest,
  SubmitIntroRequestPayload,
  SubmitIntroRequestResponse,
  MyRequestsResponse,
} from "./intro-requests";
