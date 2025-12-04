/**
 * Introduction Requests API Service
 * Handles submitting and managing introduction requests
 */

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

import type {
  SubmitIntroRequestPayload,
  SubmitIntroRequestResponse,
} from "@/types";

/**
 * Submit an introduction request
 * @param token JWT authentication token from Clerk
 * @param payload Introduction request data
 * @returns Response with success status
 */
export async function submitIntroRequest(
  token: string,
  payload: SubmitIntroRequestPayload
): Promise<SubmitIntroRequestResponse> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const response = await fetch(`${API_BASE}/api/intro-requests/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      target_person_id: payload.target_person_id,
      target_person_name: payload.target_person_name,
      target_person_title: payload.target_person_title,
      target_person_company: payload.target_person_company,
      target_person_linkedin: payload.target_person_linkedin || null,
      match_reason: payload.match_reason || "",
      user_message: payload.user_message,
      workspace_id: payload.workspace_id,
      urgency: payload.urgency || "medium", // Default to medium if not provided
      requester_linkedin_url: payload.requester_linkedin_url || "",
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required. Please sign in.");
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.detail || "Failed to submit request"
    );
  }

  const data = await response.json();
  return data;
}
