/**
 * Search API Types
 */

/**
 * Chat Response Interface
 */
export interface ChatResponse {
  session_id: string;
  is_complete: boolean;
  question?: string;
  refined_query?: string;
  question_count: number;
}

/**
 * Ask Request Interface
 */
export interface AskRequest {
  question: string;
  workspace_ids?: string[];
  workspace_id?: string; // Deprecated, use workspace_ids
  session_id?: string; // Optional session ID from /chat
}

/**
 * Backend Person Profile Interface
 */
export interface BackendPerson {
  person_id: string;
  name: string;
  headline?: string; // AI-generated headline
  current_company?: string;
  location?: string;
  linkedin_profile?: string;
  reason?: string; // Overall assessment/reasoning for why this match
  technical_skills?: string[]; // For expertise badges
  workspace_id?: string; // Identifies which workspace this profile came from
  picture_url?: string; // URL for the profile picture
  s1_message?: string; // Pre-generated message for introduction request
  result_id?: number; // Result ID from search
  search_result_id?: number; // Search result ID
}

/**
 * Backend Query Response Interface
 */
export interface BackendQueryResponse {
  response: string;
  success: boolean;
  profiles: BackendPerson[];
  requester_has_linkedin?: boolean; // Whether the requester has a LinkedIn profile
  is_hub_user?: boolean; // Whether the requester is a hub user
  metadata: {
    session_id: string;
    execution_time: number;
    tools_used: string[];
    data_found: number;
    workflow_status: string;
    filters: {
      original_query: string;
      skill_filters: string[];
      company_filters: string[];
      location_filters: string[];
      [key: string]: any;
    };
    sub_queries: number;
  };
}
