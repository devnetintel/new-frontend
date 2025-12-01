"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ThinkingAnimationProps {
    step: number
    connectorNames?: string[]
}

export function ThinkingAnimation({ step, connectorNames = ["Shubham", "Anjali", "David"] }: ThinkingAnimationProps) {
    // Determine which node is active based on the step
    // Step 0: Parsing (Center pulse)
    // Step 1: Scanning Node 1
    // Step 2: Scanning Node 2
    // Step 3: Analyzing (All connected)

    const messages = [
        "Parsing your request...",
        `Scanning ${connectorNames[0]}'s network...`,
        `Scanning ${connectorNames[1] || "extended"}'s network...`,
        "Analyzing relevance matches..."
    ]

    return (
        <div className="flex flex-col items-center justify-center py-12 w-full">
            <div className="relative w-64 h-32 mb-8 flex items-center justify-center">
                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line
                        x1="50%" y1="50%" x2="20%" y2="50%"
                        className={cn("stroke-border stroke-2 transition-colors duration-500", step >= 1 && "stroke-primary")}
                    />
                    <line
                        x1="50%" y1="50%" x2="80%" y2="50%"
                        className={cn("stroke-border stroke-2 transition-colors duration-500", step >= 2 && "stroke-primary")}
                    />
                </svg>

                {/* Center Node (User/System) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className={cn(
                        "w-16 h-16 rounded-full bg-background border-4 flex items-center justify-center transition-all duration-500",
                        step === 0 ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-110" : "border-primary/50"
                    )}>
                        <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
                    </div>
                </div>

                {/* Left Node (Connector 1) */}
                <div className="absolute left-[10%] top-1/2 -translate-y-1/2 z-10">
                    <div className={cn(
                        "w-12 h-12 rounded-full bg-background border-2 flex items-center justify-center transition-all duration-500",
                        step === 1 ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-110" : "border-border"
                    )}>
                        <div className={cn("w-6 h-6 rounded-full transition-colors", step === 1 ? "bg-blue-500/20" : "bg-muted")} />
                    </div>
                </div>

                {/* Right Node (Connector 2) */}
                <div className="absolute right-[10%] top-1/2 -translate-y-1/2 z-10">
                    <div className={cn(
                        "w-12 h-12 rounded-full bg-background border-2 flex items-center justify-center transition-all duration-500",
                        step === 2 ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-110" : "border-border"
                    )}>
                        <div className={cn("w-6 h-6 rounded-full transition-colors", step === 2 ? "bg-purple-500/20" : "bg-muted")} />
                    </div>
                </div>

                {/* Scanning Beam Effect */}
                <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent w-1/3 blur-sm transition-all duration-1000",
                    step === 0 ? "left-1/3 opacity-0" :
                        step === 1 ? "left-[15%] opacity-100" :
                            step === 2 ? "left-[55%] opacity-100" :
                                "left-1/3 w-full opacity-50 animate-pulse"
                )} />
            </div>

            <div className="text-center space-y-2">
                <p className="text-xl font-medium text-foreground animate-pulse">
                    {messages[Math.min(step, messages.length - 1)]}
                </p>
                <p className="text-sm text-muted-foreground">
                    Federated search across {connectorNames.length} networks
                </p>
            </div>
        </div>
    )
}
