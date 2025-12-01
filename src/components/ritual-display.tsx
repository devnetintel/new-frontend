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

    // Phase 1: Understanding (0 - 1.5s)
    // Phase 2: Consulting (1.5s - 3s)
    // Phase 3: Identifying (3s - 4.5s)

    useEffect(() => {
        // Phase 1 -> Phase 2
        const timer1 = setTimeout(() => {
            setPhase(1)
        }, 1500)

        // Phase 2 -> Phase 3
        const timer2 = setTimeout(() => {
            setPhase(2)
        }, 3000)

        // Cycle through connector names during Phase 2
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
                const currentName = connectorNames[connectorIndex] || "the network"
                return `Consulting ${currentName}'s network...`
            case 2:
                return "Identifying the best matches..."
            default:
                return "Finalizing..."
        }
    }

    return (
        <div className={cn("flex flex-col items-center justify-center py-12 w-full min-h-[200px]", className)}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={phase + (phase === 1 ? connectorIndex : 0)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-4"
                >
                    <h2 className="text-2xl md:text-3xl font-light tracking-wide text-foreground/90">
                        {getMessage()}
                    </h2>

                    {/* Subtle pulsing orb or line to indicate activity without being a spinner */}
                    <div className="w-16 h-1 bg-primary/20 rounded-full mx-auto overflow-hidden">
                        <motion.div
                            className="h-full bg-primary/60 w-1/3 rounded-full"
                            animate={{ x: ["-100%", "300%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
