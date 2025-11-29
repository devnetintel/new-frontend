/**
 * Connection and Workspace Types
 */

/**
 * Connection interface (transformed from BackendPerson)
 */
export interface Connection {
  id: string;
  name: string;
  title: string; // AI-generated headline
  company: string;
  image: string; // Generated avatar
  expertise: string[]; // For badges
  degree: 1 | 2; // Connection degree
  consented: boolean;
  // Extended profile fields
  location?: string;
  linkedin?: string;
  reason?: string; // Overall assessment/reasoning for why this match
  workspace_id?: string; // Identifies which workspace this connection came from
  picture_url?: string; // URL for the profile picture
  s1_message?: string; // Pre-generated message for introduction request
}

/**
 * Workspace Information
 */
export interface WorkspaceInfo {
  id: string;
  name: string;
  profile_count: number;
  source: "link" | "admin";
}

