"use client";

import * as React from "react";
import { ArrowRight, Mic, AudioLines } from "lucide-react";
import { ShinyText } from "@/components/shiny-text";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { transcribeAudio } from "@/apis/transcribe";
import { gsap } from "gsap";

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
  const hasAnimatedUpRef = React.useRef(false);
  const isAnimatingRef = React.useRef(false);
  const animatedElementsRef = React.useRef<{
    childrenToFade: HTMLElement[];
    heading: HTMLElement | null;
    networkSelector: HTMLElement | null;
    inputWrapper: HTMLElement | null;
    inputContainer: HTMLElement | null;
    chatContainer?: HTMLElement | null;
    chatContentArea?: HTMLElement | null;
    desktopContainer?: HTMLElement | null;
  } | null>(null);

  // GSAP animation for main page - move heading, network block, and search input up when keyboard opens
  const animateMainPageInputUp = React.useCallback(() => {
    if (hasAnimatedUpRef.current || typeof window === "undefined") return;

    // Only animate on mobile (less than 768px)
    if (window.innerWidth >= 768) return;

    // Skip animations in chat section
    const inputWrapper = containerRef.current?.parentElement;
    let current = inputWrapper;
    while (current) {
      if (
        current.classList.contains("z-[100]") ||
        (current.classList.contains("rounded-t-3xl") &&
          current.classList.contains("absolute"))
      ) {
        return; // Skip animation in chat section
      }
      current = current.parentElement;
    }

    try {
      if (!inputWrapper || !(inputWrapper instanceof HTMLElement)) return;

      // Find the parent flex container by traversing up the DOM
      let parent = containerRef.current?.parentElement;
      while (parent) {
        if (
          parent.classList.contains("flex") &&
          parent.classList.contains("flex-col") &&
          parent.classList.contains("items-center")
        ) {
          break;
        }
        parent = parent.parentElement;
      }

      if (!parent) return;

      // Get all direct children except the input container wrapper
      const mainPageInputWrapper = containerRef.current?.parentElement || null;
      const inputContainer = containerRef.current;
      const allChildren = Array.from(parent.children).filter((child) => {
        if (!(child instanceof HTMLElement)) return false;
        // Exclude the input wrapper div and the input container itself
        return (
          child !== mainPageInputWrapper &&
          inputContainer &&
          !child.contains(inputContainer)
        );
      }) as HTMLElement[];

      if (allChildren.length === 0) return;

      // Find heading (h1) and network selector separately
      const heading = allChildren.find((child) => child.tagName === "H1");
      const networkSelector = allChildren.find((child) => {
        // Find the div that contains the network selector (has max-w-2xl class)
        if (child.classList.contains("max-w-2xl")) return true;
        // Check if it contains a child with max-w-2xl
        const hasMaxW2xl = child.querySelector(".max-w-2xl");
        return !!hasMaxW2xl;
      });

      const viewport = window.visualViewport;
      if (!viewport) return;

      // Wait for layout to stabilize
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!inputWrapper) return;

          const currentViewportHeight = viewport.height;
          const windowHeight = window.innerHeight;
          const keyboardHeight = windowHeight - currentViewportHeight;

          // Only animate if keyboard is actually visible
          if (keyboardHeight < 150) return;

          // Calculate all positions first
          let headingShiftAmount = 0;
          let networkShiftAmount = 0;
          let inputShiftAmount = 0;

          // Safe top area to account for status bar and browser UI
          const safeTop = 20; // 20px from top to move blocks higher up

          if (heading) {
            const headingRect = heading.getBoundingClientRect();
            const currentTop = headingRect.top;
            const headingHeight = headingRect.height;
            const targetTop = safeTop;

            // Ensure heading doesn't go off screen
            const minTop = safeTop;
            const maxTop = currentViewportHeight - headingHeight - 20; // Keep some space at bottom
            const finalTargetTop = Math.max(
              minTop,
              Math.min(targetTop, maxTop)
            );
            headingShiftAmount = currentTop - finalTargetTop;
          }

          if (networkSelector && heading) {
            const networkRect = networkSelector.getBoundingClientRect();
            const headingRect = heading.getBoundingClientRect();
            const headingHeight = headingRect.height;
            const headingFinalTop = safeTop; // Use same safe top
            const targetTop = headingFinalTop + headingHeight + 5; // Safe top + heading height + 5px gap (reduced for tighter spacing)
            const currentTop = networkRect.top;
            networkShiftAmount = currentTop - targetTop;
          }

          const inputRect = inputWrapper.getBoundingClientRect();
          if (!inputRect) return;

          // Calculate shift amount to keep input visible above keyboard
          const targetInputBottom = currentViewportHeight - 20; // 20px padding
          const currentInputBottom = inputRect.bottom;
          inputShiftAmount = currentInputBottom - targetInputBottom;

          if (
            inputShiftAmount > 0 ||
            headingShiftAmount > 0 ||
            networkShiftAmount > 0
          ) {
            // Kill any existing animations
            gsap.killTweensOf(inputWrapper);
            if (heading) {
              gsap.killTweensOf(heading);
            }
            if (networkSelector) {
              gsap.killTweensOf(networkSelector);
            }

            // Clear any existing transforms
            gsap.set(inputWrapper, { clearProps: "transform" });
            if (heading) {
              gsap.set(heading, { clearProps: "transform" });
            }
            if (networkSelector) {
              gsap.set(networkSelector, { clearProps: "transform,scale" });
            }

            const tl = gsap.timeline({
              defaults: { duration: 0, ease: "none" },
            });

            // Animate heading to top
            if (heading && headingShiftAmount > 0) {
              tl.to(heading, { y: -headingShiftAmount }, 0);
            }

            // Animate network selector below heading
            if (networkSelector && networkShiftAmount > 0) {
              tl.to(networkSelector, { y: -networkShiftAmount, scale: 0.7 }, 0);
            }

            // Animate search input wrapper up instantly
            if (inputShiftAmount > 0) {
              tl.to(inputWrapper, { y: -inputShiftAmount }, 0);
            }

            // Store references for rollback
            animatedElementsRef.current = {
              childrenToFade: [],
              heading: heading || null,
              networkSelector: networkSelector || null,
              inputWrapper: inputWrapper || null,
              inputContainer: containerRef.current || null,
              chatContainer: null,
              chatContentArea: null,
              desktopContainer: null,
            };

            hasAnimatedUpRef.current = true;
          }
        });
      });
    } catch (error) {
      console.debug("Main page input animation failed:", error);
    }
  }, []);

  // GSAP animation to move elements up when input is clicked (mobile only)
  // DISABLED: Main page animations removed per user request
  const animateElementsUp = React.useCallback(() => {
    // Always return early - main page animations are disabled
    return;

    if (hasAnimatedUpRef.current || typeof window === "undefined") return;

    // Only animate on mobile (less than 768px)
    if (window.innerWidth >= 768) return;

    // Skip animations in chat section
    const inputWrapper = containerRef.current?.parentElement;
    let current = inputWrapper;
    while (current) {
      if (
        current?.classList.contains("z-[100]") ||
        (current?.classList.contains("rounded-t-3xl") &&
          current?.classList.contains("absolute"))
      ) {
        return; // Skip animation in chat section
      }
      current = current?.parentElement;
    }

    try {
      // MAIN PAGE: Original logic
      // Find the parent flex container by traversing up the DOM
      let parent = containerRef.current?.parentElement;
      while (parent) {
        if (
          parent?.classList.contains("flex") &&
          parent?.classList.contains("flex-col") &&
          parent?.classList.contains("items-center")
        ) {
          break;
        }
        parent = parent?.parentElement;
      }

      if (!parent) return;

      // Get all direct children except the input container wrapper
      const mainPageInputWrapper = containerRef.current?.parentElement || null;
      const inputContainer = containerRef.current;
      const allChildren = Array.from(parent!.children).filter((child) => {
        if (!(child instanceof HTMLElement)) return false;
        // Exclude the input wrapper div and the input container itself
        return (
          child !== mainPageInputWrapper &&
          inputContainer &&
          !child.contains(inputContainer)
        );
      }) as HTMLElement[];

      if (allChildren.length === 0) return;

      // Find heading (h1) and network selector separately
      const heading = allChildren.find((child) => child?.tagName === "H1");
      const networkSelector = allChildren.find((child) => {
        // Find the div that contains the network selector (has max-w-2xl class)
        if (child.classList.contains("max-w-2xl")) return true;
        // Check if it contains a child with max-w-2xl
        const hasMaxW2xl = child?.querySelector(".max-w-2xl");
        return !!hasMaxW2xl;
      });

      // Calculate all positions first
      let headingShiftAmount = 0;
      let networkShiftAmount = 0;
      let inputShiftAmount = 0;

      // Safe top area to account for status bar and browser UI
      const safeTop = 60; // 60px from top to ensure visibility

      if (heading) {
        const headingRect = heading!.getBoundingClientRect();
        const currentTop = headingRect.top;
        const headingHeight = headingRect.height;
        const targetTop = safeTop;

        // Ensure heading doesn't go off screen
        const minTop = safeTop;
        const maxTop = window.innerHeight - headingHeight - 20; // Keep some space at bottom
        const finalTargetTop = Math.max(minTop, Math.min(targetTop, maxTop));
        headingShiftAmount = currentTop - finalTargetTop;
      }

      if (networkSelector && heading) {
        const networkRect = networkSelector!.getBoundingClientRect();
        const headingRect = heading!.getBoundingClientRect();
        const headingHeight = headingRect.height;
        const headingFinalTop = safeTop; // Use same safe top
        const targetTop = headingFinalTop + headingHeight + 10; // Safe top + heading height + 10px gap
        const currentTop = networkRect.top;
        networkShiftAmount = currentTop - targetTop;
      }

      if (mainPageInputWrapper && networkSelector && heading) {
        const inputRect = mainPageInputWrapper!.getBoundingClientRect();
        const networkRect = networkSelector!.getBoundingClientRect();
        const headingRect = heading!.getBoundingClientRect();
        const headingHeight = headingRect.height;
        const networkHeight = networkRect.height * 0.7; // Account for scale 0.7
        const headingFinalTop = safeTop; // Use same safe top
        const gapBetweenNetworkAndInput = 20; // Increased gap between network blocks and input
        const targetTop =
          headingFinalTop +
          headingHeight +
          10 +
          networkHeight +
          gapBetweenNetworkAndInput; // Calculate final position with more gap
        const currentTop = inputRect.top;
        inputShiftAmount = currentTop - targetTop;
      }

      // Animate all elements together using timeline - all start at the same time
      const tl = gsap.timeline({
        defaults: { duration: 0.6, ease: "power2.out" },
      });

      // Set search-input initial opacity to 0
      if (mainPageInputWrapper) {
        gsap.set(mainPageInputWrapper, { opacity: 0 });
      }

      // Add all animations to start at position 0 (simultaneously) - forward animation
      if (heading) {
        tl.to(heading!, { y: -headingShiftAmount }, 0);
      }

      if (networkSelector) {
        tl.to(networkSelector!, { y: -networkShiftAmount, scale: 0.7 }, 0);
      }

      if (mainPageInputWrapper) {
        // Move search-input up with opacity 0 (starts at same time as others)
        tl.to(mainPageInputWrapper, { y: -inputShiftAmount, opacity: 0 }, 0);

        // After other animations complete (0.6s), fade in search-input
        tl.to(
          mainPageInputWrapper,
          {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
          },
          0.6
        );
      }

      // Store references for rollback
      animatedElementsRef.current = {
        childrenToFade: allChildren,
        heading: heading || null,
        networkSelector: networkSelector || null,
        inputWrapper: mainPageInputWrapper || null,
        inputContainer: containerRef.current || null,
      };

      hasAnimatedUpRef.current = true;
    } catch (error) {
      console.debug("Animation failed:", error);
    }
  }, []);

  // GSAP animation for chat section - move only search input up when keyboard opens
  const animateChatSectionUp = React.useCallback(() => {
    if (hasAnimatedUpRef.current || typeof window === "undefined") return;

    try {
      const inputWrapper = containerRef.current?.parentElement;
      if (!inputWrapper || !(inputWrapper instanceof HTMLElement)) return;

      const viewport = window.visualViewport;
      if (!viewport) return;

      // Wait for layout to stabilize
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!inputWrapper) return;

          const currentViewportHeight = viewport.height;
          const windowHeight = window.innerHeight;
          const keyboardHeight = windowHeight - currentViewportHeight;

          // Only animate if keyboard is actually visible
          if (keyboardHeight < 150) return;

          const inputRect = inputWrapper.getBoundingClientRect();
          if (!inputRect) return;

          // Calculate shift amount to keep input visible above keyboard
          const targetInputBottom = currentViewportHeight - 20; // 20px padding
          const currentInputBottom = inputRect.bottom;
          const shiftAmount = currentInputBottom - targetInputBottom;

          if (shiftAmount > 0) {
            // Find the chat content area
            let chatContentArea: HTMLElement | null = null;
            let desktopContainer: HTMLElement | null = null;
            let current: HTMLElement | null = inputWrapper;

            // Check if inputWrapper is inside desktop container
            // inputWrapper is the parent of SearchInput container, which could be:
            // - In desktop: the max-w-4xl div, so desktop container is inputWrapper.parentElement
            // - In mobile chat: the sticky bottom div
            // So we need to check inputWrapper and its parent
            if (
              inputWrapper.parentElement?.id ===
              "desktop-search-input-container"
            ) {
              desktopContainer = inputWrapper.parentElement;
            } else {
              // Traverse up to find desktop container or chat content area
              while (current) {
                if (current.id === "desktop-search-input-container") {
                  desktopContainer = current;
                  break;
                }
                const contentArea = current.querySelector("#chat-content-area");
                if (contentArea instanceof HTMLElement) {
                  chatContentArea = contentArea;
                }
                current = current.parentElement;
              }

              // If still not found, try direct query
              if (!desktopContainer) {
                desktopContainer = document.querySelector(
                  "#desktop-search-input-container"
                ) as HTMLElement | null;
              }
            }

            // Kill any existing animations
            gsap.killTweensOf(inputWrapper);
            if (chatContentArea) {
              gsap.killTweensOf(chatContentArea);
            }
            if (desktopContainer) {
              gsap.killTweensOf(desktopContainer);
            }

            // Clear any existing transforms
            gsap.set(inputWrapper, { clearProps: "transform" });
            if (chatContentArea) {
              gsap.set(chatContentArea, { clearProps: "paddingBottom" });
            }
            if (desktopContainer) {
              gsap.set(desktopContainer, { clearProps: "transform" });
            }

            const tl = gsap.timeline({
              defaults: { duration: 0, ease: "none" },
            });

            // Animate only the search input wrapper up instantly
            tl.to(inputWrapper, { y: -shiftAmount }, 0);

            // Also animate desktop container if it exists
            if (desktopContainer) {
              tl.to(desktopContainer, { y: -shiftAmount }, 0);
            }

            // Adjust content area padding-bottom to account for keyboard
            // This reduces the scrollable area from bottom so messages don't go behind keyboard
            if (chatContentArea) {
              const keyboardHeight = windowHeight - currentViewportHeight;
              // Add padding equal to keyboard height so content can scroll above keyboard
              tl.to(chatContentArea, { paddingBottom: keyboardHeight }, 0);
            }

            // Store references for rollback
            animatedElementsRef.current = {
              childrenToFade: [],
              heading: null,
              networkSelector: null,
              inputWrapper: inputWrapper || null,
              inputContainer: containerRef.current || null,
              chatContainer: null, // No longer animating chat container
              chatContentArea: chatContentArea || null,
              desktopContainer: desktopContainer || null,
            };

            hasAnimatedUpRef.current = true;
          }
        });
      });
    } catch (error) {
      console.debug("Chat section animation failed:", error);
    }
  }, []);

  // Rollback animation when clicking outside
  const rollbackAnimation = React.useCallback(() => {
    if (!hasAnimatedUpRef.current || !animatedElementsRef.current) return;
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 768) return;

    try {
      const {
        heading,
        networkSelector,
        inputWrapper,
        chatContainer,
        chatContentArea,
        desktopContainer,
      } = animatedElementsRef.current;

      // MAIN PAGE: Rollback heading, network selector, and search input
      if (inputWrapper && !chatContainer && (heading || networkSelector)) {
        // This is main page animation with heading/networkSelector
        gsap.killTweensOf(inputWrapper);
        if (heading) {
          gsap.killTweensOf(heading);
        }
        if (networkSelector) {
          gsap.killTweensOf(networkSelector);
        }

        const tl = gsap.timeline({
          defaults: { duration: 0, ease: "none" },
          onComplete: () => {
            if (inputWrapper) {
              gsap.set(inputWrapper, { clearProps: "transform" });
            }
            if (heading) {
              gsap.set(heading, { clearProps: "transform" });
            }
            if (networkSelector) {
              gsap.set(networkSelector, { clearProps: "transform,scale" });
            }
          },
        });

        // Rollback all elements to original position instantly
        if (heading) {
          tl.to(heading, { y: 0 }, 0);
        }
        if (networkSelector) {
          tl.to(networkSelector, { y: 0, scale: 1 }, 0);
        }
        if (inputWrapper) {
          tl.to(inputWrapper, { y: 0 }, 0);
        }

        hasAnimatedUpRef.current = false;
        animatedElementsRef.current = null;
        return;
      }

      // MAIN PAGE: Rollback only the search input (input-only animation, no heading/networkSelector/chatContainer)
      if (
        inputWrapper &&
        !chatContainer &&
        !heading &&
        !networkSelector &&
        !chatContentArea &&
        !desktopContainer
      ) {
        // This is main page input-only animation
        gsap.killTweensOf(inputWrapper);

        const tl = gsap.timeline({
          defaults: { duration: 0, ease: "none" },
          onComplete: () => {
            if (inputWrapper) {
              gsap.set(inputWrapper, { clearProps: "transform" });
            }
          },
        });

        // Rollback input wrapper to original position instantly
        tl.to(inputWrapper, { y: 0 }, 0);

        hasAnimatedUpRef.current = false;
        animatedElementsRef.current = null;
        return;
      }

      // CHAT SECTION: Rollback only the search input and content area (not the entire chat container)
      if (inputWrapper && !chatContainer) {
        const { chatContentArea, desktopContainer } =
          animatedElementsRef.current;

        // Kill any existing animations
        gsap.killTweensOf(inputWrapper);
        if (chatContentArea) {
          gsap.killTweensOf(chatContentArea);
        }
        if (desktopContainer) {
          gsap.killTweensOf(desktopContainer);
        }

        const tl = gsap.timeline({
          defaults: { duration: 0, ease: "none" },
          onComplete: () => {
            if (inputWrapper) {
              gsap.set(inputWrapper, { clearProps: "transform" });
            }
            if (chatContentArea) {
              gsap.set(chatContentArea, { clearProps: "paddingBottom" });
            }
            if (desktopContainer) {
              gsap.set(desktopContainer, { clearProps: "transform" });
            }
          },
        });

        // Rollback input wrapper to original position instantly
        tl.to(inputWrapper, { y: 0 }, 0);

        // Rollback desktop container if it exists
        if (desktopContainer) {
          tl.to(desktopContainer, { y: 0 }, 0);
        }

        // Rollback content area padding-bottom
        if (chatContentArea) {
          tl.to(chatContentArea, { paddingBottom: 0 }, 0);
        }

        hasAnimatedUpRef.current = false;
        animatedElementsRef.current = null;
        return;
      }

      // Create timeline for rollback animation
      const tl = gsap.timeline({
        defaults: { duration: 0.6, ease: "power2.out" },
        onComplete: () => {
          // Ensure all transforms are cleared after animation completes
          if (heading) {
            gsap.set(heading, { clearProps: "transform" });
          }
          if (networkSelector) {
            gsap.set(networkSelector, { clearProps: "transform,scale" });
          }
          if (inputWrapper) {
            gsap.set(inputWrapper, { clearProps: "transform" });
          }
        },
      });

      // First fade out search-input
      if (inputWrapper) {
        tl.to(inputWrapper, { opacity: 0, duration: 0.4 }, 0);
      }

      // Network blocks rollback first (after fade out starts)
      if (networkSelector) {
        tl.to(
          networkSelector,
          {
            y: 0,
            scale: 1,
            clearProps: "transform", // Clear GSAP transforms after animation
          },
          0.4
        ); // Start after fade out begins
      }

      // Heading rolls back after network blocks complete (0.4 + 0.6 = 1.0)
      if (heading && networkSelector) {
        tl.to(
          heading,
          {
            y: 0,
            clearProps: "transform", // Clear GSAP transforms after animation
          },
          1.0
        ); // Start after network blocks complete
      } else if (heading) {
        // If no network selector, heading rolls back immediately
        tl.to(
          heading,
          {
            y: 0,
            clearProps: "transform",
          },
          0.4
        );
      }

      if (inputWrapper) {
        // Move search-input back down with opacity 0
        tl.to(
          inputWrapper,
          {
            y: 0,
            opacity: 0,
            clearProps: "transform", // Clear GSAP transforms after animation
          },
          0.4
        );

        // Then fade it back in (after heading completes: 1.0 + 0.6 = 1.6, or 0.4 + 0.6 = 1.0 if no network)
        const fadeInStartTime = heading && networkSelector ? 1.6 : 1.0; // 1.0 (network complete) + 0.6 (heading) = 1.6
        tl.to(
          inputWrapper,
          {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
          },
          fadeInStartTime
        );
      }

      hasAnimatedUpRef.current = false;
      animatedElementsRef.current = null;
    } catch (error) {
      console.debug("Rollback animation failed:", error);
    }
  }, []);

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

  // Handle keyboard in/out and clicks outside to rollback animation
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if we're in chat section
    const checkIfInChatSection = () => {
      if (!containerRef.current) return false;
      let current = containerRef.current.parentElement;
      while (current) {
        if (
          current.classList.contains("z-[100]") ||
          (current.classList.contains("rounded-t-3xl") &&
            current.classList.contains("absolute"))
        ) {
          return true; // In chat section
        }
        current = current.parentElement;
      }
      return false;
    };

    // Check if desktop container exists
    const checkIfDesktopContainer = () => {
      const desktopContainer = document.querySelector(
        "#desktop-search-input-container"
      );
      return desktopContainer instanceof HTMLElement;
    };

    const isInChatSection = checkIfInChatSection();
    const hasDesktopContainer = checkIfDesktopContainer();

    // Separate handlers for chat section and desktop/main page
    if (isInChatSection || hasDesktopContainer) {
      // CHAT SECTION / DESKTOP: Handle keyboard show/hide with GSAP animation
      const viewport = window.visualViewport;
      if (!viewport) return;

      const originalHeightRef = { value: viewport.height };

      const updateOriginalHeight = () => {
        const currentHeight = viewport.height;
        const windowHeight = window.innerHeight;
        if (Math.abs(windowHeight - currentHeight) < 50) {
          originalHeightRef.value = currentHeight;
        }
      };

      let resizeTimeout: NodeJS.Timeout | null = null;

      const handleChatViewportResize = () => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }

        resizeTimeout = setTimeout(() => {
          if (isAnimatingRef.current) return;

          // Re-check for desktop container dynamically (in case it was rendered after mount)
          const desktopContainerExists =
            document.querySelector("#desktop-search-input-container") instanceof
            HTMLElement;
          const shouldAnimate = isInChatSection || desktopContainerExists;

          if (!shouldAnimate) return;

          const currentHeight = viewport.height;
          const originalHeight = originalHeightRef.value;
          const heightDifference = originalHeight - currentHeight;
          const threshold = 150;

          if (heightDifference > threshold) {
            // Keyboard is OPEN - animate chat section/desktop container up
            if (!hasAnimatedUpRef.current) {
              isAnimatingRef.current = true;
              animateChatSectionUp();
              setTimeout(() => {
                isAnimatingRef.current = false;
              }, 100);
            }
          } else {
            // Keyboard is CLOSED - rollback animation
            if (hasAnimatedUpRef.current) {
              isAnimatingRef.current = true;
              rollbackAnimation();
              setTimeout(() => {
                updateOriginalHeight();
                isAnimatingRef.current = false;
              }, 200);
            } else {
              updateOriginalHeight();
            }
          }
        }, 100);
      };

      updateOriginalHeight();
      viewport.addEventListener("resize", handleChatViewportResize);
      window.addEventListener("resize", updateOriginalHeight);

      return () => {
        viewport.removeEventListener("resize", handleChatViewportResize);
        window.removeEventListener("resize", updateOriginalHeight);
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
      };
    }

    // MAIN PAGE: Handle keyboard show/hide with GSAP animation (only search input)
    const viewport = window.visualViewport;
    if (!viewport) return;

    // Store the original height of the viewport
    const originalHeightRef = { value: viewport.height };

    // Update original height when viewport stabilizes (keyboard fully closed)
    const updateOriginalHeight = () => {
      const currentHeight = viewport.height;
      const windowHeight = window.innerHeight;
      // If viewport is within 50px of window height, consider keyboard closed
      if (Math.abs(windowHeight - currentHeight) < 50) {
        originalHeightRef.value = currentHeight;
      }
    };

    // Throttle viewport resize handler to prevent jittery animations
    let resizeTimeout: NodeJS.Timeout | null = null;

    const handleMainPageViewportResize = () => {
      // Clear any pending resize handler
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      // Throttle the resize handler to prevent jitter
      resizeTimeout = setTimeout(() => {
        if (isAnimatingRef.current) return; // Prevent overlapping animations

        const currentHeight = viewport.height;
        const originalHeight = originalHeightRef.value;
        const heightDifference = originalHeight - currentHeight;
        const threshold = 150; // Threshold to account for browser bars hiding/showing

        // If current height is significantly smaller than original, keyboard is OPEN
        if (heightDifference > threshold) {
          // Keyboard is OPEN - trigger animation
          if (!hasAnimatedUpRef.current) {
            isAnimatingRef.current = true;
            animateMainPageInputUp();
            // Reset flag after animation starts
            setTimeout(() => {
              isAnimatingRef.current = false;
            }, 100);
          }
        } else {
          // Keyboard is CLOSED - trigger rollback
          if (hasAnimatedUpRef.current) {
            isAnimatingRef.current = true;
            rollbackAnimation();
            // Update original height after a delay to ensure keyboard is fully dismissed
            setTimeout(() => {
              updateOriginalHeight();
              isAnimatingRef.current = false;
            }, 200);
          } else {
            // Update original height even when not animated (for future comparisons)
            updateOriginalHeight();
          }
        }
      }, 100); // 100ms throttle to prevent jitter
    };

    // MAIN PAGE: Initial update of original height
    updateOriginalHeight();

    // Listen for visual viewport changes (keyboard show/hide)
    viewport.addEventListener("resize", handleMainPageViewportResize);

    // Also listen for window resize to update original height
    window.addEventListener("resize", updateOriginalHeight);

    return () => {
      viewport.removeEventListener("resize", handleMainPageViewportResize);
      window.removeEventListener("resize", updateOriginalHeight);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [
    rollbackAnimation,
    animateElementsUp,
    animateChatSectionUp,
    animateMainPageInputUp,
  ]);

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
        className="relative flex flex-col w-full p-3 bg-background border border-border/50 rounded-xl shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-0 focus-within:border-primary/50"
        style={{
          willChange: isAnimating ? "transform" : "border-color, box-shadow",
          transform: isAnimating ? undefined : "translateZ(0)",
          backfaceVisibility: "hidden",
          scrollMargin: isInChatSection ? "0px" : "20px",
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
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              // Focus handler - animation is now handled by Visual Viewport API
              props.onFocus?.(e);
            }}
            onClick={(e) => {
              props.onClick?.(e);
            }}
            className="w-full min-h-[60px] max-h-[200px] bg-transparent border-none resize-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none text-lg relative z-10"
            style={{ scrollMargin: isInChatSection ? "0px" : "20px" }}
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
