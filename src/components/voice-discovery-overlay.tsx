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
}

export function VoiceDiscoveryInline({
  isActive,
  onClose,
  onSearch,
  initialQuery,
  selectedNetworks = [],
}: VoiceDiscoveryInlineProps) {
  const { getToken } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
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

  // Handle voice input timing
  useEffect(() => {
    if (!isListening) return;

    // Show voice UI for 3.5 seconds, then trigger conversation
    const timer = setTimeout(() => {
      setIsListening(false);
      sendChatMessageToAPI(
        "At my company I handle performance marketing and I've got a big budget, so I want to talk with people who had handled big budgets for performance marketing in a B2C scenario."
      );
    }, 3500);

    return () => clearTimeout(timer);
  }, [isListening, sendChatMessageToAPI]);

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

  const networkNames: Record<string, string> = {
    shubham: "Shubham's Network",
    ajay: "Ajay's Network",
  };

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
            {selectedNetworks.length > 0 ? (
              selectedNetworks.map((network) => (
                <div
                  key={network}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    network === "shubham"
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      : "bg-green-500/10 border-green-500/30 text-green-400"
                  )}
                >
                  {networkNames[network]}
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
                          setIsListening(false);
                          setRecordingDuration(0);
                        }}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => {
                          console.log("Recording stopped");
                          // Trigger completion manually since we removed AIVoiceInput
                          setIsListening(false);
                          setRecordingDuration(0);
                          sendChatMessageToAPI(
                            "At my company I handle performance marketing and I've got a big budget, so I want to talk with people who had handled big budgets for performance marketing in a B2C scenario."
                          );
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
                    onClick={() => setIsListening(true)}
                  >
                    <Sparkles className="h-5 w-5" />
                    Tap to Speak
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                      placeholder="Type your response..."
                      className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-sm"
                    />
                    <Button
                      onClick={handleTextSubmit}
                      disabled={!textInput.trim()}
                    >
                      Send
                    </Button>
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
