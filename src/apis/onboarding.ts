const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface OnboardingSubmitResponse {
  success: boolean;
  message: string;
  workspace_id: string;
  linkedin_connections_url: string;
  google_contacts_url: string;
}

/**
 * Submit onboarding data with LinkedIn and Google contacts CSV files
 */
export async function submitOnboarding(
  linkedinFile: File,
  googleFile: File,
  workspaceId: string,
  token: string | null,
  batchId: string = 'default'
): Promise<OnboardingSubmitResponse> {
  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  // Validate inputs
  if (!linkedinFile || !googleFile || !workspaceId.trim()) {
    throw new Error("All fields are required");
  }

  // Validate file types
  if (!linkedinFile.name.endsWith('.csv')) {
    throw new Error("LinkedIn file must be a CSV file");
  }
  if (!googleFile.name.endsWith('.csv')) {
    throw new Error("Google contacts file must be a CSV file");
  }

  // Validate file sizes (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (linkedinFile.size > maxSize) {
    throw new Error("LinkedIn file size must be less than 10MB");
  }
  if (googleFile.size > maxSize) {
    throw new Error("Google contacts file size must be less than 10MB");
  }

  const formData = new FormData();
  formData.append('linkedin_connections', linkedinFile);
  formData.append('google_contacts', googleFile);
  formData.append('workspace_id', workspaceId.trim());
  formData.append('batch_id', batchId);

  const response = await fetch(`${API_BASE_URL}/api/onboarding/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Onboarding failed' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
