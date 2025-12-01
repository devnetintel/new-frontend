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
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { sendChatMessage } from "@/apis/chat";
import { transcribeAudio } from "@/apis/transcribe";
import { SearchInput } from "@/components/search-input";
import { ShinyText } from "@/components/shiny-text";
import { useChat } from "@/contexts/chat-context";

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
  const { setIsChatOpen } = useChat();
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

  // Prevent body scroll when chat is active on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isActive && window.innerWidth < 768) {
      // Prevent body scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      // Cleanup: restore body scroll on unmount
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isActive]);

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
      setIsChatOpen(false);
      return;
    }

    // Set chat open state when active
    setIsChatOpen(true);

    // Start conversation with initial query only once
    if (initialQuery && initialQuery.trim() && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setTimeout(() => {
        sendChatMessageToAPI(initialQuery);
      }, 300);
    }
  }, [isActive, initialQuery, sendChatMessageToAPI]);

  const handleClose = () => {
    setIsChatOpen(false);
    onClose();
  };

  // Always render on mobile when active, even if desktop view returns null
  if (!isActive) {
    // On mobile, we still want to show the bottom sheet structure
    return null;
  }

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
    <>
      {/* Mobile: Bottom Sheet Overlay */}
      <div className="md:hidden fixed inset-0 z-[100] pointer-events-none">
        {/* Backdrop to show main page */}
        <div
          className="absolute inset-0 pointer-events-auto"
          onClick={handleClose}
        />

        {/* Bottom Sheet - solid background */}
        <div
          className="absolute top-2 left-0 right-0 bottom-0 rounded-t-3xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden bg-background border-t border-border/50"
          style={{
            animation: "slideUp 0.3s ease-out",
            transform: "translateY(0)",
            willChange: "auto",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            touchAction: "none",
          }}
        >
          {/* Top handle bar for visual boundary */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-border/60 rounded-full z-20 mt-2" />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent rounded-t-3xl pointer-events-none z-0" />
          <div className="relative flex flex-col h-full z-10">
            {/* Header with cross button */}
            <div className="flex flex-col p-4 border-b-2 border-border shrink-0 bg-transparent">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Chat</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="rounded-full h-8 w-8 p-0 hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              {/* Network tags in header - mobile only */}
              {selectedWorkspaces && selectedWorkspaces.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-muted-foreground font-medium leading-none">
                    Searching:
                  </span>
                  {selectedWorkspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium border leading-none",
                        workspace.color.bg,
                        workspace.color.border,
                        workspace.color.text
                      )}
                    >
                      {workspace.name}&apos;s Network
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content - Scrollable independently */}
            <div
              id="chat-content-area"
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
              }}
            >
              <div className="w-full space-y-6 py-4 px-4 pb-4">
                {/* Persistent Query Evolution Display */}
                {refinedQuery && conversationStep < 3 && (
                  <div className="w-full mb-6">
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
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
                            I'll ask a few questions to understand exactly what
                            you're looking for.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {messages.length > 0 && (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          return (
                            <div
                              key={index}
                              className={cn(
                                "flex",
                                message.role === "user"
                                  ? "justify-end"
                                  : "justify-start"
                              )}
                            >
                              <div className="flex flex-col gap-1 max-w-[80%]">
                                <div
                                  className={cn(
                                    "rounded-2xl px-5 py-4 leading-relaxed",
                                    message.role === "user"
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  )}
                                >
                                  <p className="text-base">{message.content}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}

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
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : null}

                {/* Final Query Summary */}
                {refinedQuery && conversationStep >= 3 && (
                  <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 text-primary">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Conversation Complete
                      </span>
                    </div>

                    <div className="w-full max-w-2xl">
                      <h3 className="text-center text-lg font-semibold mb-6 text-muted-foreground">
                        Your Refined Search
                      </h3>

                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-sm" />
                        <div className="relative bg-card border-2 border-primary/30 rounded-xl p-8">
                          <Sparkles className="h-6 w-6 text-primary mb-4" />

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

            {/* SearchInput - Fixed at bottom, outside scrollable area */}
            {!(refinedQuery && conversationStep >= 3) && (
              <div className="shrink-0 bg-background border-t border-border/50 p-4 pb-safe">
                <SearchInput
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onSearch={(value) => {
                    if (value.trim()) {
                      sendChatMessageToAPI(value);
                    }
                  }}
                  isThinking={isProcessing}
                  sessionId={sessionId}
                  placeholder="Type your response..."
                  selectedNetworks={selectedWorkspaces}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: Full Page View */}
      <div className="hidden md:block w-full animate-in fade-in slide-in-from-top-4 duration-500">
        {/* Back Button - Fixed positioned on left */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="fixed top-4 left-4 md:left-20 z-40 rounded-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 text-muted-foreground hover:text-foreground gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
          <span className="sr-only">Back</span>
        </Button>

        {/* Persistent Query Evolution Display */}
        {refinedQuery && conversationStep < 3 && (
          <div className="w-full max-w-4xl mx-auto mb-6">
            <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
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
        <div className="w-full max-w-4xl mx-auto space-y-6 py-4 pb-4">
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
                  {messages.map((message, index) => {
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        <div className="flex flex-col gap-1 max-w-[80%]">
                          <div
                            className={cn(
                              "rounded-2xl px-5 py-4 leading-relaxed",
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="text-base">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

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
                      </div>
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
                <span className="text-sm font-medium">
                  Conversation Complete
                </span>
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

        {/* SearchInput - Fixed at bottom, hidden when final query is shown */}
        {!(refinedQuery && conversationStep >= 3) && (
          <div
            id="desktop-search-input-container"
            className="fixed bottom-0 left-0 md:left-16 right-0 z-30 bg-background border-t border-border/50 p-4 pb-safe"
          >
            <div className="w-full max-w-4xl mx-auto">
              <SearchInput
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onSearch={(value) => {
                  if (value.trim()) {
                    sendChatMessageToAPI(value);
                  }
                }}
                isThinking={isProcessing}
                sessionId={sessionId}
                placeholder="Type your response..."
                selectedNetworks={selectedWorkspaces}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
