/**
 * Token Service
 * Utility for getting JWT token from Clerk
 * Works with Next.js (@clerk/nextjs)
 * 
 * Usage:
 * ```tsx
 * import { useAuth } from "@clerk/nextjs";
 * 
 * function MyComponent() {
 *   const { getToken } = useAuth();
 *   
 *   const callApi = async () => {
 *     const token = await getToken();
 *     if (!token) {
 *       console.error("Not authenticated");
 *       return;
 *     }
 *     // Use token in API call
 *   };
 * }
 * ```
 */

/**
 * Helper function to get token from Clerk
 * This is a wrapper that can be used in components
 * 
 * @param getToken - The getToken function from useAuth() hook
 * @param options - Optional options for getToken (skipCache, etc.)
 * @returns Promise<string | null>
 * 
 * @example
 * ```tsx
 * import { useAuth } from "@clerk/nextjs";
 * 
 * function MyComponent() {
 *   const { getToken } = useAuth();
 *   
 *   const callApi = async () => {
 *     const token = await getClerkToken(getToken);
 *     if (!token) return;
 *     // Use token
 *   };
 * }
 * ```
 */
export async function getClerkToken(
  getToken: ReturnType<typeof import("@clerk/nextjs").useAuth>["getToken"],
  options?: { skipCache?: boolean }
): Promise<string | null> {
  try {
    const token = await getToken(options);
    return token;
  } catch (error) {
    console.error("Failed to get token from Clerk:", error);
    return null;
  }
}

