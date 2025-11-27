"use client"

import * as React from "react"
import { ArrowRight, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"
import { transcribeAudio } from "@/apis/transcribe"

interface SearchInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    onSearch: (value: string) => void
    isThinking?: boolean
    sessionId?: string
}

export function SearchInput({ className, onSearch, isThinking, sessionId, ...props }: SearchInputProps) {
    const { getToken } = useAuth()
    const [value, setValue] = React.useState("")
    const [isRecording, setIsRecording] = React.useState(false)
    const [isTranscribing, setIsTranscribing] = React.useState(false)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
    const audioChunksRef = React.useRef<Blob[]>([])
    const streamRef = React.useRef<MediaStream | null>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Manual smooth scroll function - always scrolls when input is focused/clicked
    const scrollIntoViewSmooth = React.useCallback((element: HTMLElement | null) => {
        if (!element || typeof window === 'undefined') return;
        
        const performScroll = () => {
            try {
                // Check if element still exists and is in DOM
                if (!element || !document.body || !document.body.contains(element)) {
                    return;
                }
                
                // Use native scrollIntoView for reliability
                if (element.scrollIntoView) {
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            } catch (error) {
                // Silently fail if scroll fails
                console.debug('Scroll failed:', error);
            }
        };
        
        // Use double RAF and setTimeout to ensure it runs after browser's default behavior
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(performScroll, 50);
            });
        });
    }, [])

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value)
        // Auto-resize
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (value.trim()) {
                // Trigger voice discovery overlay instead of direct search
                onSearch(value)
                setValue("") // Clear input after opening overlay
            }
        }
    }

    const startRecording = React.useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream

            const mimeType = MediaRecorder.isTypeSupported("audio/webm")
                ? "audio/webm"
                : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : ""

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType || undefined,
            })
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop())
                    streamRef.current = null
                }

                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, {
                        type: mimeType || "audio/webm",
                    })
                    await handleTranscription(audioBlob)
                }

                audioChunksRef.current = []
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (error) {
            console.error("Error starting recording:", error)
            setIsRecording(false)
            alert(
                error instanceof Error && error.name === "NotAllowedError"
                    ? "Microphone permission denied. Please allow microphone access."
                    : "Failed to start recording. Please try again."
            )
        }
    }, [])

    const stopRecording = React.useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop()
        }
        setIsRecording(false)
    }, [])

    const handleTranscription = React.useCallback(
        async (audioBlob: Blob) => {
            setIsTranscribing(true)
            try {
                const token = await getToken()
                if (!token) {
                    throw new Error("Authentication required. Please sign in.")
                }

                const result = await transcribeAudio(audioBlob, token, sessionId)
                setValue(result.text)
                
                // Focus the textarea after transcription
                if (textareaRef.current) {
                    textareaRef.current.focus()
                    // Move cursor to end
                    const length = result.text.length
                    textareaRef.current.setSelectionRange(length, length)
                }
            } catch (error) {
                console.error("Transcription error:", error)
                alert(
                    error instanceof Error
                        ? error.message
                        : "Could not transcribe. Please try again."
                )
            } finally {
                setIsTranscribing(false)
            }
        },
        [getToken, sessionId]
    )

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop()
            }
        }
    }, [])

    return (
        <div className={cn("relative w-full max-w-3xl mx-auto group", className)}>
            <div 
                ref={containerRef}
                id="search-input-container"
                className="relative flex flex-col w-full p-4 bg-card border border-border/50 rounded-xl shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-0 focus-within:border-primary/50"
                style={{ 
                    willChange: 'border-color, box-shadow',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    scrollMargin: '20px'
                }}
                onClick={(e) => {
                    // Focus textarea when clicking on container
                    if (textareaRef.current && e.target !== textareaRef.current) {
                        textareaRef.current.focus();
                    }
                }}
            >
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
                    placeholder="Ask anything..."
                    className="w-full min-h-[60px] max-h-[200px] bg-transparent border-none resize-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none text-lg placeholder:text-muted-foreground/70"
                    style={{ scrollMargin: '20px' }}
                    rows={1}
                    {...props}
                />

                <div className="flex justify-end items-center mt-2">
                    <div className="flex gap-2 items-center">
                        {isThinking && (
                            <span className="text-xs text-muted-foreground animate-pulse mr-2">
                                Thinking...
                            </span>
                        )}
                        {isTranscribing && (
                            <span className="text-xs text-muted-foreground animate-pulse mr-2">
                                Transcribing...
                            </span>
                        )}
                        {isRecording ? (
                            <Button
                                size="icon"
                                className="h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200"
                                onClick={stopRecording}
                            >
                                <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                            </Button>
                        ) : value.trim() ? (
                            <Button
                                size="icon"
                                className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                                onClick={() => {
                                    onSearch(value)
                                    setValue("") // Clear input after opening overlay
                                }}
                                disabled={isThinking || isTranscribing}
                            >
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                size="icon"
                                className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                                onClick={startRecording}
                                disabled={isThinking || isTranscribing}
                            >
                                <Mic className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
