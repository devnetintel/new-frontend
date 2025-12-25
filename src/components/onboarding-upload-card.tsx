"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { submitOnboarding } from "@/apis";
import { useAuth } from "@clerk/nextjs";

interface OnboardingUploadCardProps {
  onSuccess?: (workspaceId: string) => void;
  batchId?: string; // Optional: for testing multiple submissions (default: 'default')
}

export function OnboardingUploadCard({ onSuccess, batchId = 'default' }: OnboardingUploadCardProps) {
  const { getToken } = useAuth();
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
  const [googleFile, setGoogleFile] = useState<File | null>(null);
  const [workspaceId, setWorkspaceId] = useState("");
  const [batchIdInput, setBatchIdInput] = useState(batchId);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const linkedinInputRef = useRef<HTMLInputElement>(null);
  const googleInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const handleLinkedinFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setLinkedinFile(file);
    } else {
      e.target.value = '';
    }
  };

  const handleGoogleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setGoogleFile(file);
    } else {
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!linkedinFile || !googleFile || !workspaceId.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    // Validate workspace ID format
    const workspaceIdRegex = /^[a-z0-9_]+$/;
    if (!workspaceIdRegex.test(workspaceId.trim())) {
      toast.error('Workspace ID must contain only lowercase letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      
      setUploadProgress('Uploading LinkedIn connections...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setUploadProgress('Uploading Google contacts...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setUploadProgress('Creating workspace...');
      const result = await submitOnboarding(
        linkedinFile,
        googleFile,
        workspaceId.trim(),
        token,
        batchIdInput || 'default'
      );

      setUploadProgress('Success! Processing your network...');
      toast.success('Onboarding submitted successfully! We will process your network.');

      // Reset form
      setLinkedinFile(null);
      setGoogleFile(null);
      setWorkspaceId("");
      if (linkedinInputRef.current) linkedinInputRef.current.value = '';
      if (googleInputRef.current) googleInputRef.current.value = '';
      setUploadProgress('');

      // Call success callback
      if (onSuccess) {
        onSuccess(result.workspace_id);
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      
      // Handle specific error types
      if (error.message.includes('already exists')) {
        toast.error('This workspace name is taken. Please choose another.');
      } else if (error.message.includes('authentication')) {
        toast.error('Please log in again.');
      } else {
        toast.error(error.message || 'Something went wrong. Please try again.');
      }
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  const removeLinkedinFile = () => {
    setLinkedinFile(null);
    if (linkedinInputRef.current) linkedinInputRef.current.value = '';
  };

  const removeGoogleFile = () => {
    setGoogleFile(null);
    if (googleInputRef.current) googleInputRef.current.value = '';
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Build Your Network</h3>
        <p className="text-sm text-muted-foreground">
          Upload your LinkedIn connections and Google contacts to create your professional network.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workspace ID */}
        <div className="space-y-2">
          <Label htmlFor="workspace-id">
            Workspace ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="workspace-id"
            type="text"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value.toLowerCase())}
            placeholder="e.g., john_smith"
            disabled={loading}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Choose a unique ID (lowercase letters, numbers, and underscores only)
          </p>
        </div>

        {/* Batch ID - Optional for testing */}
        <div className="space-y-2">
          <Label htmlFor="batch-id">
            Batch ID <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="batch-id"
            type="text"
            value={batchIdInput}
            onChange={(e) => setBatchIdInput(e.target.value)}
            placeholder="e.g., batch_1, batch_2 (default: default)"
            disabled={loading}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Used for testing multiple submissions. Leave blank for default.
          </p>
        </div>

        {/* LinkedIn File Upload */}
        <div className="space-y-2">
          <Label htmlFor="linkedin-file">
            LinkedIn Connections CSV <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                ref={linkedinInputRef}
                id="linkedin-file"
                type="file"
                accept=".csv"
                onChange={handleLinkedinFileChange}
                disabled={loading}
                className="hidden"
              />
              {!linkedinFile ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => linkedinInputRef.current?.click()}
                  disabled={loading}
                  className="w-full justify-start gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose LinkedIn CSV file
                </Button>
              ) : (
                <div className="flex items-center gap-2 p-3 border border-border rounded-md bg-muted/30">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm flex-1 truncate">{linkedinFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeLinkedinFile}
                    disabled={loading}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Export from LinkedIn → Settings & Privacy → Data Privacy → Connections
          </p>
        </div>

        {/* Google File Upload */}
        <div className="space-y-2">
          <Label htmlFor="google-file">
            Google Contacts CSV <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                ref={googleInputRef}
                id="google-file"
                type="file"
                accept=".csv"
                onChange={handleGoogleFileChange}
                disabled={loading}
                className="hidden"
              />
              {!googleFile ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => googleInputRef.current?.click()}
                  disabled={loading}
                  className="w-full justify-start gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose Google Contacts CSV file
                </Button>
              ) : (
                <div className="flex items-center gap-2 p-3 border border-border rounded-md bg-muted/30">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm flex-1 truncate">{googleFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeGoogleFile}
                    disabled={loading}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Export from Google Contacts → Export → Google CSV format
          </p>
        </div>

        {/* Progress Message */}
        {uploadProgress && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-md">
            {loading ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            )}
            <span className="text-sm text-primary">{uploadProgress}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !linkedinFile || !googleFile || !workspaceId.trim()}
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Submit Onboarding
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
