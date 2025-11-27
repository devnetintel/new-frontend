"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  X,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Search,
  Edit2,
  ArrowRight,
  Keyboard,
  ArrowUp,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { sendChatMessage } from "@/apis/chat";
import { transcribeAudio } from "@/apis/transcribe";

interface Message {
  role: "user" | "system";
  content: string;
}

interface VoiceDiscoveryInlineProps {
  isActive: boolean;
  onClose: () => void;
  onSearch: (finalQuery: string, sessionId?: string) => void;
  initialQuery?: string;
  selectedNetworks?: string[];
  workspaces?: Array<{ id: string; name: string }>;
}

export function VoiceDiscoveryInline({
  isActive,
  onClose,
  onSearch,
  initialQuery,
  selectedNetworks = [],
  workspaces = [],
}: VoiceDiscoveryInlineProps) {
  const { getToken } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputMode, setInputMode] = useState<"voice" | "text">("text");
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [refinedQuery, setRefinedQuery] = useState("");
  const [editedQuery, setEditedQuery] = useState("");
  const [conversationStep, setConversationStep] = useState(0);
  const [isEditingQuery, setIsEditingQuery] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const hasStartedRef = useRef(false);
  const queryEditRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sendChatMessageToAPI = useCallback(
    async (userInput: string) => {
      setIsProcessing(true);

      // Add user message
      setMessages((prev) => [...prev, { role: "user", content: userInput }]);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required. Please sign in.");
        }

        // Send message to chat API
        const response = await sendChatMessage(userInput, token, sessionId);

        // Update session ID if this is the first message
        if (!sessionId && response.session_id) {
          setSessionId(response.session_id);
        }

        // Update refined query if available
        if (response.refined_query) {
          setRefinedQuery(response.refined_query);
        }

        // Add system response
        if (response.question) {
          const questionText = response.question;
          setMessages((prev) => [
            ...prev,
            {
              role: "system",
              content: questionText,
            },
          ]);
        }

        // If conversation is complete, show final query
        if (response.is_complete && response.refined_query) {
          setRefinedQuery(response.refined_query);
          setConversationStep(3); // Show final query summary
        } else {
          // Increment conversation step
          setConversationStep((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Chat API error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content:
              error instanceof Error
                ? error.message
                : "Failed to send message. Please try again.",
          },
        ]);
      } finally {
        setIsProcessing(false);
        setTextInput("");
      }
    },
    [getToken, sessionId]
  );

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      sendChatMessageToAPI(textInput);
    }
  };

  const handleFinalSearch = () => {
    const queryToSearch = editedQuery || refinedQuery;
    onSearch(queryToSearch, sessionId);
    onClose();
  };

  const handleInlineBlur = () => {
    if (queryEditRef.current) {
      setEditedQuery(queryEditRef.current.textContent || "");
    }
  };

  // Start audio recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Use webm format (browser default, recommended)
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Transcribe audio
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType || "audio/webm",
          });
          await handleTranscription(audioBlob);
        }

        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsListening(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            error instanceof Error && error.name === "NotAllowedError"
              ? "Microphone permission denied. Please allow microphone access."
              : "Failed to start recording. Please try again.",
        },
      ]);
    }
  }, []);

  // Stop audio recording
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Handle transcription
  const handleTranscription = useCallback(
    async (audioBlob: Blob) => {
      setIsTranscribing(true);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required. Please sign in.");
        }

        const result = await transcribeAudio(audioBlob, token, sessionId);

        // Put transcribed text in input for user to edit
        setTextInput(result.text);

        // Optionally auto-send if user prefers (or let them edit first)
        // For now, we'll just put it in the input box
      } catch (error) {
        console.error("Transcription error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content:
              error instanceof Error
                ? error.message
                : "Could not transcribe. Please try again.",
          },
        ]);
      } finally {
        setIsTranscribing(false);
      }
    },
    [getToken, sessionId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Initialize conversation only once when component becomes active
  useEffect(() => {
    if (!isActive) {
      // Reset when component becomes inactive
      hasStartedRef.current = false;
      setMessages([]);
      setRefinedQuery("");
      setConversationStep(0);
      setIsEditingQuery(false);
      setEditedQuery("");
      setSessionId(undefined);
      return;
    }

    // Start conversation with initial query only once
    if (initialQuery && initialQuery.trim() && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setTimeout(() => {
        sendChatMessageToAPI(initialQuery);
      }, 300);
    }
  }, [isActive, initialQuery, sendChatMessageToAPI]);

  if (!isActive) return null;

    // Color classes matching the network selector
  const colorClasses = [
    {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
    },
    {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-400",
    },
    {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-400",
    },
    {
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      text: "text-orange-400",
    },
    {
      bg: "bg-pink-500/10",
      border: "border-pink-500/30",
      text: "text-pink-400",
    },
  ];

  // Get selected workspaces with their names and colors
  const selectedWorkspaces = selectedNetworks
    .map((networkId) => {
      const workspace = workspaces.find((w) => w.id === networkId);
      if (!workspace) return null;
      
      // Find the index of this workspace in the full workspaces array to get consistent color
      const workspaceIndex = workspaces.findIndex((w) => w.id === networkId);
      const color = colorClasses[workspaceIndex % colorClasses.length];
      
      return {
        id: networkId,
        name: workspace.name,
        color,
      };
    })
    .filter((w): w is NonNullable<typeof w> => w !== null);

  return (
    <div className="w-full animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Header with Cancel and Network Pills */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          {/* Selected Networks Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">
              Searching:
            </span>
            {selectedWorkspaces.length > 0 ? (
              selectedWorkspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    workspace.color.bg,
                    workspace.color.border,
                    workspace.color.text
                  )}
                >
                  {workspace.name}&apos;s Network
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                No networks selected
              </span>
            )}
          </div>

          {/* Cancel Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Persistent Query Evolution Display */}
      {refinedQuery && conversationStep < 3 && (
        <div className="w-full max-w-4xl mx-auto mb-6">
          <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">
                  Refining your search...
                </p>
                <p className="text-sm font-medium text-foreground">
                  {refinedQuery}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="w-full max-w-4xl mx-auto space-y-6 py-4">
        {!refinedQuery || conversationStep < 3 ? (
          <>
            {/* Initial state */}
            {messages.length === 0 && !isListening && (
              <div className="flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    How can we help you?
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    I'll ask a few questions to understand exactly what you're
                    looking for.
                  </p>
                </div>
              </div>
            )}

            {/* Messages - Always show when they exist */}
            {messages.length > 0 && (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-5 py-4 leading-relaxed",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-5 py-4">
                      <div className="flex gap-1">
                        <div
                          className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Processing...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input Area - Show after first message and when not processing */}
            {messages.length > 0 && !isProcessing && (
              <div className="pt-4">
                {/* Mode Toggle Buttons */}
                <div className="flex gap-2 mb-3">
                  <Button
                    variant={inputMode === "voice" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputMode("voice")}
                    className="gap-2"
                    disabled={true}
                    title="Voice conversation feature coming soon"
                  >
                    <Sparkles className="h-3 w-3" />
                    Voice
                  </Button>
                  <Button
                    variant={inputMode === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputMode("text")}
                    className="gap-2"
                  >
                    <Keyboard className="h-3 w-3" />
                    Text
                  </Button>
                </div>

                {/* WhatsApp-style Voice Input */}
                {isListening ? (
                  <div className="flex items-center gap-4 w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </div>
                      <span className="text-sm font-medium tabular-nums text-foreground/80">
                        {formatDuration(recordingDuration)}
                      </span>
                      <div className="h-8 flex-1 flex items-center gap-0.5 px-2 opacity-50">
                        {/* Fake waveform visualization */}
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-primary/60 rounded-full animate-pulse"
                            style={{
                              height: `${Math.max(20, Math.random() * 100)}%`,
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: "0.8s",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          stopRecording();
                          setRecordingDuration(0);
                        }}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => {
                          stopRecording();
                        }}
                        className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ) : inputMode === "voice" ? (
                  <Button
                    className="w-full h-14 text-base gap-3"
                    onClick={startRecording}
                    disabled={isTranscribing}
                  >
                    <Sparkles className="h-5 w-5" />
                    {isTranscribing ? "Transcribing..." : "Tap to Speak"}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      {isTranscribing ? (
                        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-3 text-sm">
                          <div className="flex gap-1">
                            <div
                              className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <div
                              className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <div
                              className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Transcribing audio...
                          </span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleTextSubmit()
                          }
                          placeholder="Type your response..."
                          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm"
                        />
                      )}
                    </div>
                    {isTranscribing ? (
                      <Button
                        size="icon"
                        className="h-10 w-10 rounded-full bg-primary text-primary-foreground"
                        disabled
                      >
                        <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                      </Button>
                    ) : textInput.trim() ? (
                      <Button
                        size="icon"
                        className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleTextSubmit}
                        disabled={isProcessing}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={startRecording}
                        disabled={isProcessing || isTranscribing}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}

        {/* Final Query Summary - Hero Style */}
        {refinedQuery && conversationStep >= 3 && (
          <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 text-primary">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Conversation Complete</span>
            </div>

            <div className="w-full max-w-2xl">
              <h3 className="text-center text-lg font-semibold mb-6 text-muted-foreground">
                Your Refined Search
              </h3>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-sm" />
                <div className="relative bg-card border-2 border-primary/30 rounded-xl p-8">
                  <Sparkles className="h-6 w-6 text-primary mb-4" />

                  {/* Always Editable Query */}
                  <div
                    ref={queryEditRef}
                    contentEditable
                    suppressContentEditableWarning
                    onFocus={() => setIsEditingQuery(true)}
                    onBlur={() => {
                      handleInlineBlur();
                      setIsEditingQuery(false);
                    }}
                    className={cn(
                      "text-xl leading-relaxed font-medium mb-8 outline-none cursor-text",
                      "hover:border-b-2 hover:border-primary/30 pb-2",
                      isEditingQuery && "border-b-2 border-primary/50"
                    )}
                  >
                    "{editedQuery || refinedQuery}"
                  </div>

                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      onClick={handleFinalSearch}
                      className="flex-1 gap-2 text-base"
                    >
                      <Search className="h-5 w-5" />
                      Search Network
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
