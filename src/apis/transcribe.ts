/**
 * Transcription API Service
 * Handles audio transcription using OpenAI Whisper
 */

// API Base URL - Next.js uses NEXT_PUBLIC_ prefix
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/**
 * Transcription Response Interface
 */
export interface TranscriptionResponse {
  text: string;
  duration_seconds: number | null;
  language: string;
}

/**
 * Transcribe audio recording to text
 * 
 * @param audioBlob - Audio file blob (webm, wav, mp3, m4a, ogg, flac)
 * @param token - JWT authentication token from Clerk
 * @param sessionId - Optional session ID for tracking
 * @returns Transcription response with transcribed text
 * 
 * @example
 * ```tsx
 * const audioBlob = new Blob(chunks, { type: 'audio/webm' });
 * const result = await transcribeAudio(audioBlob, token, sessionId);
 * console.log(result.text); // "I'm looking for a senior backend engineer"
 * ```
 */
export async function transcribeAudio(
  audioBlob: Blob,
  token: string | null,
  sessionId?: string
): Promise<TranscriptionResponse> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  if (sessionId) {
    formData.append("session_id", sessionId);
  }

  const response = await fetch(`${API_BASE}/transcribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type header - browser will set it with boundary for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed. Please sign in again.");
    }

    // Try to get detailed error message
    let errorDetail = "Transcription failed";
    try {
      const error = await response.json();
      if (error.detail) {
        if (typeof error.detail === "string") {
          errorDetail = error.detail;
        } else if (error.detail.message) {
          errorDetail = error.detail.message;
        } else if (error.detail.error) {
          errorDetail = error.detail.error;
        }
      }
    } catch (parseError) {
      console.error("Could not parse error response:", parseError);
    }

    // Provide user-friendly error messages
    if (response.status === 400) {
      if (errorDetail.toLowerCase().includes("too large") || errorDetail.toLowerCase().includes("size")) {
        throw new Error("Recording too long. Please keep it under 2 minutes.");
      } else if (errorDetail.toLowerCase().includes("format")) {
        throw new Error("Unsupported audio format.");
      } else {
        throw new Error(errorDetail);
      }
    }

    if (response.status === 500) {
      throw new Error("Could not transcribe. Please try again.");
    }

    throw new Error(errorDetail);
  }

  const data = await response.json();
  return data;
}

