"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RequestData } from "./request-card";
import { toast } from "sonner";
import { Send, RotateCcw } from "lucide-react";

interface ReviewSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RequestData | null;
  onSend: (id: string, note: string, context: string) => void;
}

export function ReviewSendModal({
  isOpen,
  onClose,
  request,
  onSend,
}: ReviewSendModalProps) {
  const [personalNote, setPersonalNote] = useState("");
  const [context, setContext] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Reset state when modal opens with a new request
  useEffect(() => {
    if (isOpen && request) {
      // "Ghostwriter" logic
      const defaultNote = `Hi ${
        request.target.name.split(" ")[0]
      }, hope you're doing great. ${
        request.requester.name
      } reached out specifically asking for your expertise on the topic below. I think it's a good match.`;
      setPersonalNote(defaultNote);

      setContext(request.context);
      setIsSending(false);
    }
  }, [isOpen, request]);

  const handleReset = () => {
    if (!request) return;
    const defaultNote = `Hi ${
      request.target.name.split(" ")[0]
    }, hope you're doing great. ${
      request.requester.name
    } reached out specifically asking for your expertise on the topic below. I think it's a good match.`;
    setPersonalNote(defaultNote);
    setContext(request.context);
    toast.info("Restored original draft");
  };

  const handleSend = () => {
    if (!request) return;

    // Basic validation
    if (!personalNote.trim()) {
      toast.error("Please fill in the message field");
      return;
    }

    setIsSending(true);

    // Simulate API delay
    setTimeout(() => {
      onSend(request.id, personalNote, context);
      setIsSending(false);
      onClose();
    }, 800);
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSending && onClose()}>
      <DialogContent className="max-w-[90vw] sm:max-w-[600px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/30">
          <DialogTitle className="flex items-center justify-start  w-full">
            <span className="">Review email to {request.target.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className=" text-xs text-muted-foreground  px-2 hover:text-primary hover:bg-transparent flex items-center justify-center gap-1.5 shrink-0"
              title="Reset to original draft"
            >
              <RotateCcw className="h-3 w-3 shrink-0" />
              <span>Reset</span>
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Personal Note */}
          <div className="space-y-2">
            <Label
              htmlFor="note"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Your message to {request.target.name.split(" ")[0]}
            </Label>
            <Textarea
              id="note"
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label
              htmlFor="context"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              {request.requester.name.split(" ")[0]}&apos;s Request Context
            </Label>
            <div className="relative">
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-[80px] bg-muted/20 text-muted-foreground text-sm italic resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 flex gap-3 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
          >
            {isSending ? (
              "Sending..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Approve & Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
