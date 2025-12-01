"use client";

import * as React from "react";
import { ArrowRight, Mic, AudioLines } from "lucide-react";
import { ShinyText } from "@/components/shiny-text";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { transcribeAudio } from "@/apis/transcribe";

interface SearchInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSearch: (value: string) => void;
  isThinking?: boolean;
  sessionId?: string;
  animateToBottom?: boolean;
  onAnimationComplete?: () => void;
  selectedNetworks?: Array<{
    id: string;
    name: string;
    color: { bg: string; border: string; text: string };
  }>;
}

export function SearchInput({
  className,
  onSearch,
  isThinking,
  sessionId,
  value: controlledValue,
  onChange: controlledOnChange,
  animateToBottom,
  onAnimationComplete,
  selectedNetworks,
  placeholder,
  ...props
}: SearchInputProps) {
  const { getToken } = useAuth();
  const [internalValue, setInternalValue] = React.useState("");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const [isRecording, setIsRecording] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const originalScrollPositionRef = React.useRef<number | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (isControlled) {
      controlledOnChange?.(e);
    } else {
      setInternalValue(newValue);
    }
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const stringValue = String(value);
      if (stringValue.trim()) {
        // Trigger voice discovery overlay instead of direct search
        onSearch(stringValue);
        if (!isControlled) {
          setInternalValue(""); // Clear input after opening overlay
        }
      }
    }
    props.onKeyDown?.(e);
  };

  // Check if we're in chat section to disable scrollMargin
  const isInChatSection = React.useMemo(() => {
    if (typeof window === "undefined" || !containerRef.current) return false;
    let current = containerRef.current.parentElement;
    while (current) {
      if (
        current.classList.contains("z-[100]") ||
        (current.classList.contains("rounded-t-3xl") &&
          current.classList.contains("absolute"))
      ) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }, []);

  // Handle smooth scroll into view when input is focused
  const handleScrollIntoView = React.useCallback(() => {
    if (textareaRef.current) {
      // Store original scroll position before scrolling
      originalScrollPositionRef.current =
        window.scrollY || window.pageYOffset || 0;

      // For chat section, let browser handle auto-scroll naturally
      // Don't manually call scrollIntoView - browser will handle it on focus
      if (isInChatSection) {
        return; // Let browser's native focus behavior handle scrolling
      }

      // For other sections, use scrollIntoView with center alignment
      textareaRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [isInChatSection]);

  // Handle rollback to original scroll position when input loses focus
  const handleScrollRollback = React.useCallback(() => {
    if (originalScrollPositionRef.current !== null) {
      window.scrollTo({
        top: originalScrollPositionRef.current,
        behavior: "smooth",
      });
      originalScrollPositionRef.current = null;
    }
  }, []);

  const handleTranscription = React.useCallback(
    async (audioBlob: Blob) => {
      setIsTranscribing(true);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required. Please sign in.");
        }

        const result = await transcribeAudio(audioBlob, token, sessionId);
        if (isControlled) {
          // For controlled mode, trigger onChange
          const syntheticEvent = {
            target: { value: result.text },
          } as React.ChangeEvent<HTMLTextAreaElement>;
          controlledOnChange?.(syntheticEvent);
        } else {
          setInternalValue(result.text);
        }

        // Focus the textarea after transcription
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Move cursor to end
          const length = result.text.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      } catch (error) {
        console.error("Transcription error:", error);
        alert(
          error instanceof Error
            ? error.message
            : "Could not transcribe. Please try again."
        );
      } finally {
        setIsTranscribing(false);
      }
    },
    [getToken, sessionId, isControlled, controlledOnChange]
  );

  const startRecording = React.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

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
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType || "audio/webm",
          });
          await handleTranscription(audioBlob);
        }

        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      alert(
        error instanceof Error && error.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow microphone access."
          : "Failed to start recording. Please try again."
      );
    }
  }, [handleTranscription]);

  const stopRecording = React.useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
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

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto group", className)}>
      <div
        ref={containerRef}
        id="search-input-container"
        className="relative flex flex-col w-full p-3 bg-background border border-border/50 rounded-xl shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-0 focus-within:border-primary/50"
        style={{
          scrollMargin: isInChatSection ? "0px" : "5px",
        }}
        onClick={(e) => {
          // Focus textarea when clicking on container
          if (textareaRef.current && e.target !== textareaRef.current) {
            // For chat section, just focus - no scrolling
            // For main page, scroll then focus
            if (isInChatSection) {
              textareaRef.current.focus();
            } else {
              handleScrollIntoView();
              setTimeout(() => {
                textareaRef.current?.focus();
              }, 50);
            }
          }
        }}
      >
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              // Only scroll on main page (non-chat sections)
              if (!isInChatSection) {
                handleScrollIntoView();
              }
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              // Only rollback on main page (non-chat sections)
              if (!isInChatSection) {
                handleScrollRollback();
              }
              props.onBlur?.(e);
            }}
            onClick={(e) => {
              // Only scroll on main page (non-chat sections)
              if (!isInChatSection) {
                handleScrollIntoView();
              }
              props.onClick?.(e);
            }}
            className="w-full min-h-[60px] max-h-[200px] bg-transparent border-none resize-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none text-lg relative z-10"
            style={{ scrollMargin: isInChatSection ? "0px" : "5px" }}
            rows={1}
            placeholder=""
            {...props}
          />
          {!String(value || "").trim() && (
            <div className="absolute top-0 left-0 pointer-events-none z-0 flex items-center ">
              <ShinyText
                text={placeholder || "Ask anything..."}
                speed={3}
                className="text-lg"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end items-center mt-1.5">
          <div className="flex gap-1.5 items-center">
            {isThinking && (
              <ShinyText
                text="Thinking..."
                speed={3}
                className="text-xs mr-1.5"
              />
            )}
            {isTranscribing && (
              <ShinyText
                text="Transcribing..."
                speed={3}
                className="text-xs mr-1.5"
              />
            )}
            {/* Voice conversation icon - Coming soon */}
            <div className="relative">
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-white/50 text-black/50 hover:bg-white/50 border-2 border-border/30 dark:border-transparent transition-all duration-200 cursor-not-allowed opacity-60"
                disabled={true}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <AudioLines className="h-5 w-5" />
              </Button>
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
                  Coming soon
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                </div>
              )}
            </div>
            {isRecording ? (
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200"
                onClick={stopRecording}
              >
                <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
              </Button>
            ) : String(value).trim() ? (
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                onClick={() => {
                  onSearch(String(value));
                  if (!isControlled) {
                    setInternalValue(""); // Clear input after opening overlay
                  }
                }}
                disabled={isThinking || isTranscribing}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                onClick={startRecording}
                disabled={isThinking || isTranscribing}
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
