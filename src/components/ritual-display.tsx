"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface RitualDisplayProps {
    connectorNames: string[]
    className?: string
}

export function RitualDisplay({ connectorNames, className }: RitualDisplayProps) {
    const [phase, setPhase] = useState(0)
    const [connectorIndex, setConnectorIndex] = useState(0)

    // Phase 0: Understanding (0 - 1.5s)
    // Phase 1: Consulting (1.5s - 3s)
    // Phase 2: Identifying (3s - 4.5s)

    useEffect(() => {
        // Phase 0 -> Phase 1
        const timer1 = setTimeout(() => {
            setPhase(1)
        }, 1500)

        // Phase 1 -> Phase 2
        const timer2 = setTimeout(() => {
            setPhase(2)
        }, 3000)

        // Cycle through connector names during Phase 1
        let nameInterval: NodeJS.Timeout
        if (phase === 1 && connectorNames.length > 1) {
            nameInterval = setInterval(() => {
                setConnectorIndex(prev => (prev + 1) % connectorNames.length)
            }, 800) // Switch name every 800ms
        }

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
            if (nameInterval) clearInterval(nameInterval)
        }
    }, [phase, connectorNames.length])

    const getMessage = () => {
        switch (phase) {
            case 0:
                return "Understanding your request..."
            case 1:
                return "Scanning your collective network..."
            case 2:
                return "Identifying the best experts..."
            default:
                return "Finalizing..."
        }
    }

    return (
        <div className={cn("flex flex-col items-center justify-center py-12 w-full", className)}>
            {/* Visual Network Animation */}
            <div className="relative w-64 h-32 mb-8 flex items-center justify-center">
                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line
                        x1="50%" y1="50%" x2="20%" y2="50%"
                        className={cn("stroke-border stroke-2 transition-colors duration-500", phase >= 1 && "stroke-primary")}
                    />
                    <line
                        x1="50%" y1="50%" x2="80%" y2="50%"
                        className={cn("stroke-border stroke-2 transition-colors duration-500", phase >= 2 && "stroke-primary")}
                    />
                </svg>

                {/* Center Node (User/System) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className={cn(
                        "w-16 h-16 rounded-full bg-background border-4 flex items-center justify-center transition-all duration-500",
                        phase === 0 ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-110" : "border-primary/50"
                    )}>
                        <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
                    </div>
                </div>

                {/* Left Node (Connector 1) */}
                <div className="absolute left-[10%] top-1/2 -translate-y-1/2 z-10">
                    <div className={cn(
                        "w-12 h-12 rounded-full bg-background border-2 flex items-center justify-center transition-all duration-500",
                        phase === 1 ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-110" : "border-border"
                    )}>
                        <div className={cn("w-6 h-6 rounded-full transition-colors", phase === 1 ? "bg-blue-500/20" : "bg-muted")} />
                    </div>
                </div>

                {/* Right Node (Connector 2) */}
                <div className="absolute right-[10%] top-1/2 -translate-y-1/2 z-10">
                    <div className={cn(
                        "w-12 h-12 rounded-full bg-background border-2 flex items-center justify-center transition-all duration-500",
                        phase === 2 ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-110" : "border-border"
                    )}>
                        <div className={cn("w-6 h-6 rounded-full transition-colors", phase === 2 ? "bg-purple-500/20" : "bg-muted")} />
                    </div>
                </div>

                {/* Scanning Beam Effect */}
                <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent w-1/3 blur-sm transition-all duration-1000",
                    phase === 0 ? "left-1/3 opacity-0" :
                        phase === 1 ? "left-[15%] opacity-100" :
                            phase === 2 ? "left-[55%] opacity-100" :
                                "left-1/3 w-full opacity-50 animate-pulse"
                )} />
            </div>

            {/* Text Message */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={phase + (phase === 1 ? connectorIndex : 0)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-2"
                >
                    <h2 className="text-2xl md:text-3xl font-light tracking-wide text-foreground/90">
                        {getMessage()}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Scanning across {connectorNames.length} network{connectorNames.length !== 1 ? 's' : ''}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
