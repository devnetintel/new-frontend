"use client";

// This catch-all route handles workspace referral URLs like /suwalka
// It renders the same content as the home
import { HomePageContent } from "@/app/page";

export default function WorkspaceReferralPage() {
  return <HomePageContent />;
}
