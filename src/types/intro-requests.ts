/**
 * Introduction Request Types
 */

/**
 * Introduction Request Interface (from API response)
 */
export interface IntroRequest {
  id: number;
  target: {
    person_id: number;
    name: string;
    title: string | null;
    company: string | null;
    linkedin: string | null;
    picture_url: string | null;
  };
  workspace: {
    id: string;
    owner_name: string;
  };
  status: {
    internal: string;
    display: string;
    detail: string;
    h1_approval: string;
    s2_consent: string;
  };
  urgency: string;
  match_reason: string;
  user_message: string;
  timestamps: {
    created_at: string | null;
    h1_approved_at: string | null;
    s2_consented_at: string | null;
    completed_at: string | null;
  };
}

/**
 * Submit Introduction Request Payload
 */
export interface SubmitIntroRequestPayload {
  target_person_id: string;
  target_person_name: string;
  target_person_title: string;
  target_person_company: string;
  target_person_linkedin: string | null;
  match_reason: string;
  user_message: string;
  workspace_id: string;
  urgency?: string; // Optional, defaults to "medium" on backend
}

/**
 * Submit Introduction Request Response
 */
export interface SubmitIntroRequestResponse {
  success: boolean;
  message?: string;
  request_id?: number;
  [key: string]: any;
}

/**
 * My Requests Response Interface
 */
export interface MyRequestsResponse {
  success: boolean;
  requests: IntroRequest[];
  total_count: number;
  limit: number;
  offset: number;
}

