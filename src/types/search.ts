/**
 * Search API Types
 */

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
}

/**
 * Backend Query Response Interface
 */
export interface BackendQueryResponse {
  response: string;
  success: boolean;
  profiles: BackendPerson[];
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

