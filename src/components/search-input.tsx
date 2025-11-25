"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SearchInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    onSearch: (value: string) => void
    isThinking?: boolean
}

export function SearchInput({ className, onSearch, isThinking, ...props }: SearchInputProps) {
    const [value, setValue] = React.useState("")
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

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
                onSearch(value)
            }
        }
    }

    return (
        <div className={cn("relative w-full max-w-3xl mx-auto group", className)}>
            <div className="relative flex flex-col w-full p-4 bg-card border border-border/50 rounded-xl shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    className="w-full min-h-[60px] max-h-[200px] bg-transparent border-none resize-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none text-lg placeholder:text-muted-foreground/70"
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
                        <Button
                            size="icon"
                            className={cn(
                                "h-8 w-8 rounded-full transition-all duration-200",
                                value.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}
                            onClick={() => value.trim() && onSearch(value)}
                            disabled={!value.trim() || isThinking}
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
