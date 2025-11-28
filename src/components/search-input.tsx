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
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [initialPosition, setInitialPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
    centerX: number;
  } | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const animationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Manual smooth scroll function - always scrolls when input is focused/clicked
  const scrollIntoViewSmooth = React.useCallback(
    (element: HTMLElement | null) => {
      if (!element || typeof window === "undefined") return;

      const performScroll = () => {
        try {
          // Check if element still exists and is in DOM
          if (!element || !document.body || !document.body.contains(element)) {
            return;
          }

          // Use native scrollIntoView for reliability
          if (element.scrollIntoView) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        } catch (error) {
          // Silently fail if scroll fails
          console.debug("Scroll failed:", error);
        }
      };

      // Use double RAF and setTimeout to ensure it runs after browser's default behavior
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(performScroll, 50);
        });
      });
    },
    []
  );

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
  }, []);

  const stopRecording = React.useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
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
    [getToken, sessionId]
  );

  // Handle animation to bottom
  React.useEffect(() => {
    if (
      animateToBottom &&
      containerRef.current &&
      !isAnimating &&
      !initialPosition
    ) {
      // Use requestAnimationFrame to ensure layout is stable
      requestAnimationFrame(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const scrollY = window.scrollY || window.pageYOffset || 0;
          // Store the actual position and center
          const centerX = rect.left + rect.width / 2;
          setInitialPosition({
            top: rect.top + scrollY,
            left: rect.left, // Store actual left position
            width: rect.width,
            centerX: centerX, // Store center for reference
          });
          // Small delay to ensure position is set before animation
          requestAnimationFrame(() => {
            setIsAnimating(true);
          });
        }
      });
    }
  }, [animateToBottom, isAnimating, initialPosition]);

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
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Calculate transform for animation
  const getTransformStyle = () => {
    if (!isAnimating || !initialPosition || !containerRef.current) {
      return {};
    }

    const rect = containerRef.current.getBoundingClientRect();

    // Sidebar width (64px = w-16)
    const sidebarWidth = 64;
    const hasSidebar = window.innerWidth >= 768; // md breakpoint

    // Calculate the content area (viewport minus sidebar on desktop)
    const contentAreaWidth = hasSidebar
      ? window.innerWidth - sidebarWidth
      : window.innerWidth;
    const contentAreaLeft = hasSidebar ? sidebarWidth : 0;

    // Center within the content area (not full viewport)
    const contentCenterX = contentAreaLeft + contentAreaWidth / 2;
    const targetLeft = contentCenterX - initialPosition.width / 2;

    // Target position: bottom of screen with padding (matching overlay padding: p-4 = 16px)
    const padding = 16; // 16px padding from bottom (matches overlay p-4)
    const targetTop = window.innerHeight - rect.height - padding;

    // Calculate delta - align to content area center horizontally, move down vertically
    const deltaY = targetTop - initialPosition.top;
    const deltaX = targetLeft - initialPosition.left;

    return {
      transform: `translate(${deltaX}px, ${deltaY}px)`,
      transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "fixed" as const,
      top: `${initialPosition.top}px`,
      left: `${initialPosition.left}px`, // Start from original position
      width: `${initialPosition.width}px`,
      maxWidth: `${initialPosition.width}px`,
      zIndex: 50,
      willChange: "transform",
    };
  };

  // Handle animation completion
  React.useEffect(() => {
    if (isAnimating && animateToBottom) {
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        setInitialPosition(null); // Reset for next animation
        onAnimationComplete?.();
      }, 600); // Match transition duration (0.6s)

      return () => {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
      };
    }
  }, [isAnimating, animateToBottom, onAnimationComplete]);

  // Reset animation state when animateToBottom becomes false
  React.useEffect(() => {
    if (!animateToBottom && isAnimating) {
      setIsAnimating(false);
      setInitialPosition(null);
    }
  }, [animateToBottom, isAnimating]);

  return (
    <div
      className={cn(
        "relative w-full max-w-4xl mx-auto group",
        className,
        isAnimating && "pointer-events-none"
      )}
    >
      <div
        ref={containerRef}
        id="search-input-container"
        className="relative flex flex-col w-full p-4 bg-card border border-border/50 rounded-xl shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-0 focus-within:border-primary/50"
        style={{
          willChange: isAnimating ? "transform" : "border-color, box-shadow",
          transform: isAnimating ? undefined : "translateZ(0)",
          backfaceVisibility: "hidden",
          scrollMargin: "20px",
          ...getTransformStyle(),
        }}
        onClick={(e) => {
          // Focus textarea when clicking on container
          if (
            textareaRef.current &&
            e.target !== textareaRef.current &&
            !isAnimating
          ) {
            textareaRef.current.focus();
          }
        }}
      >
        {/* Network tags - only show in chat section (bottom-left, aligned with icons) */}
        {selectedNetworks && selectedNetworks.length > 0 && (
          <div className="absolute bottom-4 left-4 flex items-end gap-2 flex-wrap z-10">
            <span className="text-xm text-muted-foreground font-medium">
              Searching:
            </span>
            {selectedNetworks.map((workspace) => (
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
            ))}
          </div>
        )}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              // Always scroll when input is focused
              if (textareaRef.current) {
                scrollIntoViewSmooth(textareaRef.current);
              }
              props.onFocus?.(e);
            }}
            onClick={(e) => {
              // Always scroll when clicking on textarea
              if (textareaRef.current) {
                scrollIntoViewSmooth(textareaRef.current);
              }
              props.onClick?.(e);
            }}
            onMouseDown={(e) => {
              // Trigger scroll on mousedown as well
              if (textareaRef.current) {
                scrollIntoViewSmooth(textareaRef.current);
              }
            }}
            className="w-full min-h-[60px] max-h-[200px] bg-transparent border-none resize-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none text-lg relative z-10"
            style={{ scrollMargin: "20px" }}
            rows={1}
            placeholder=""
            {...props}
          />
          {!String(value || "").trim() && (
            <div className="absolute top-0 left-0 pointer-events-none z-0 flex items-center h-[60px] px-4">
              <ShinyText
                text={placeholder || "Ask anything..."}
                speed={3}
                className="text-lg"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end items-center mt-2">
          <div className="flex gap-2 items-center">
            {isThinking && (
              <ShinyText
                text="Thinking..."
                speed={3}
                className="text-xs mr-2"
              />
            )}
            {isTranscribing && (
              <ShinyText
                text="Transcribing..."
                speed={3}
                className="text-xs mr-2"
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
