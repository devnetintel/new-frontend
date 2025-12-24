import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitOnboarding } from "@/apis";

interface OnboardingUploadCardProps {
  onSuccess?: (workspaceId: string) => void;
  onCancel?: () => void;
}

export function OnboardingUploadCard({ onSuccess, onCancel }: OnboardingUploadCardProps) {
  const { getToken } = useAuth();
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
  const [googleFile, setGoogleFile] = useState<File | null>(null);
  const [workspaceId, setWorkspaceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const validateFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error("Only CSV files are allowed");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error("File size must be less than 10MB");
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setFile(file);
      } else {
        e.target.value = ""; // Reset input
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!linkedinFile || !googleFile || !workspaceId.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    setProgress("Initiating upload...");

    try {
      const token = await getToken();
      
      setProgress("Uploading files...");
      const result = await submitOnboarding(linkedinFile, googleFile, workspaceId.trim(), token);
      
      setProgress("Success!");
      toast.success("Network successfully uploaded!", {
        description: "Your network is now being processed."
      });
      
      if (onSuccess) {
        onSuccess(result.workspace_id);
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload files"
      );
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <Card className="w-full border-primary/20 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          Upload Your Network
        </CardTitle>
        <CardDescription>
          Upload your LinkedIn connections and Google contacts to activate your hub.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workspace-id">Workspace ID</Label>
            <Input
              id="workspace-id"
              placeholder="e.g., john_doe, acme_corp"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              disabled={loading}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              This will be your unique network identifier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LinkedIn File Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                LinkedIn Connections
              </Label>
              <div className={`
                border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${linkedinFile ? 'border-green-500/50 bg-green-500/5' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}
              `}>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, setLinkedinFile)}
                  disabled={loading}
                  className="hidden"
                  id="linkedin-file"
                />
                <label htmlFor="linkedin-file" className="cursor-pointer w-full h-full block">
                  {linkedinFile ? (
                    <div className="flex flex-col items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                      <span className="text-sm font-medium truncate max-w-[200px]">{linkedinFile.name}</span>
                      <span className="text-xs opacity-70">{(linkedinFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Upload className="h-6 w-6 opacity-50" />
                      <span className="text-sm">Click to upload CSV</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Google File Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500" />
                Google Contacts
              </Label>
              <div className={`
                border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${googleFile ? 'border-green-500/50 bg-green-500/5' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}
              `}>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, setGoogleFile)}
                  disabled={loading}
                  className="hidden"
                  id="google-file"
                />
                <label htmlFor="google-file" className="cursor-pointer w-full h-full block">
                  {googleFile ? (
                    <div className="flex flex-col items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                      <span className="text-sm font-medium truncate max-w-[200px]">{googleFile.name}</span>
                      <span className="text-xs opacity-70">{(googleFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Upload className="h-6 w-6 opacity-50" />
                      <span className="text-sm">Click to upload CSV</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-primary animate-pulse py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{progress}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between gap-4 border-t bg-muted/20 p-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !linkedinFile || !googleFile || !workspaceId} 
            className="flex-1 md:flex-none md:min-w-[150px]"
          >
            {loading ? "Uploading..." : "Submit Network"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
