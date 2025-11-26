/**
 * Chat API Service
 * Handles chat conversations to refine search queries
 */

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

import type { ChatResponse } from "@/types";

/**
 * Send a message to the chat endpoint to refine a search query
 * 
 * @param message - User's message/response
 * @param token - JWT authentication token from Clerk
 * @param sessionId - Optional session ID to continue an existing conversation
 * @returns Chat response with session_id, is_complete status, and next question or refined query
 * 
 * @example
 * ```tsx
 * // Start new conversation
 * const response = await sendChatMessage("I need a developer", token);
 * 
 * // Continue conversation
 * const nextResponse = await sendChatMessage(
 *   "Python and React, based in Bangalore",
 *   token,
 *   response.session_id
 * );
 * ```
 */
export async function sendChatMessage(
  message: string,
  token: string | null,
  sessionId?: string
): Promise<ChatResponse> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const requestBody: { message: string; session_id?: string } = {
    message,
  };

  if (sessionId) {
    requestBody.session_id = sessionId;
  }

  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed. Please sign in again.");
    }

    // Try to get detailed error message
    let errorDetail = "Failed to send chat message";
    try {
      const error = await response.json();
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          errorDetail = error.detail
            .map((e: { loc?: string[]; msg?: string }) => `${e.loc?.join(".")}: ${e.msg}`)
            .join(", ");
        } else if (typeof error.detail === "string") {
          errorDetail = error.detail;
        } else if (error.detail.message) {
          errorDetail = error.detail.message;
        }
      }
    } catch (parseError) {
      console.error("Could not parse error response:", parseError);
    }

    throw new Error(errorDetail);
  }

  const data = await response.json();
  return data;
}

