/**
 * Data Transformation Utilities
 * Transforms backend data structures to frontend formats
 */

import type { Connection, BackendPerson } from "@/types";

/**
 * Transform a BackendPerson to a Connection
 * Maps backend API response to frontend Connection interface
 *
 * @param person - Backend person profile from API
 * @param degree - Connection degree (1 = direct, 2 = second degree)
 * @returns Transformed Connection object
 */
export function transformPersonToConnection(
  person: BackendPerson,
  degree: 1 | 2 = 2
): Connection {
  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-red-500",
      "bg-purple-700",
      "bg-teal-400",
      "bg-pink-400",
      "bg-amber-400",
      "bg-green-500",
      "bg-indigo-600",
      "bg-orange-500",
      "bg-cyan-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Generate initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate avatar URL or use initials
  const avatarColor = getAvatarColor(person.name);
  const initials = getInitials(person.name);
  // Use picture_url if available, otherwise generate avatar
  const avatarUrl = person.picture_url
    ? person.picture_url
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        person.name
      )}`;

  return {
    id: person.person_id,
    name: person.name,
    title: person.headline || person.current_company || "Professional",
    company: person.current_company || "",
    image: avatarUrl,
    expertise: person.technical_skills || [],
    degree: degree,
    consented: false, // Default to false, will be updated if needed
    location: person.location,
    linkedin: person.linkedin_profile,
    reason: person.reason,
    workspace_id: person.workspace_id,
    picture_url: person.picture_url,
    s1_message: person.s1_message,
  };
}

/**
 * Transform multiple BackendPerson profiles to Connections
 *
 * @param persons - Array of backend person profiles
 * @param degree - Connection degree (default: 2)
 * @returns Array of transformed Connection objects
 */
export function transformPersonsToConnections(
  persons: BackendPerson[],
  degree: 1 | 2 = 2
): Connection[] {
  return persons.map((person) => transformPersonToConnection(person, degree));
}
