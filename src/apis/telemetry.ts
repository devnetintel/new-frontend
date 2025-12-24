/**
 * Telemetry API Service
 * Handles client-side event tracking for observability and analytics
 */

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export type TelemetryEventType =
  | "voice_usage"
  | "profile_viewed"
  | "linkedin_click"
  | "ai_draft";

export interface TelemetryEventData {
  [key: string]: any;
}

export interface TelemetryEventRequest {
  event_type: TelemetryEventType;
  search_id?: string; // Optional UUID string
  event_data: TelemetryEventData;
}

export interface TelemetryEventResponse {
  success: boolean;
  event_id: number;
}

/**
 * Log a telemetry event
 *
 * @param eventType - Type of event (voice_usage, profile_viewed, linkedin_click, ai_draft)
 * @param eventData - Event-specific data (must match /ask endpoint response field names)
 * @param token - JWT authentication token (optional, can be null for anonymous events)
 * @param searchId - Optional search session ID from metadata.session_id
 * @returns Response with success status and event_id
 *
 * @example
 * ```tsx
 * await logTelemetryEvent(
 *   "profile_viewed",
 *   { person_id: "123", result_id: 456 },
 *   token,
 *   "session-uuid"
 * );
 * ```
 */
export async function logTelemetryEvent(
  eventType: TelemetryEventType,
  eventData: TelemetryEventData,
  token: string | null,
  searchId?: string
): Promise<TelemetryEventResponse> {
  const requestBody: TelemetryEventRequest = {
    event_type: eventType,
    event_data: eventData,
  };

  if (searchId) {
    requestBody.search_id = searchId;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add auth header if token is provided
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/telemetry/event`, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    // Silently fail - don't interrupt user experience
    console.error("Failed to log telemetry event:", response.status);
    throw new Error("Failed to log telemetry event");
  }

  const data = await response.json();
  return data;
}

