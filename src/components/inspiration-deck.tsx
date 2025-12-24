"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, Briefcase } from "lucide-react"

interface InspirationDeckProps {
    onSelect: (query: string) => void
    className?: string
}

export function InspirationDeck({ onSelect, className }: InspirationDeckProps) {
    // Static 3 cards - no rotation
    const allCards = [
        {
            icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
            title: "Growth Mentor",
            subtitle: "Someone who has scaled D2C past $10M",
            query: "Find mentors who have scaled D2C past $10M",
            color: "hover:border-blue-500/50 hover:bg-blue-500/5",
        },
        {
            icon: <TrendingUp className="h-6 w-6 text-green-500" />,
            title: "Seed Investor",
            subtitle: "Active angel investors in Fintech",
            query: "Find active angel investors in Fintech",
            color: "hover:border-green-500/50 hover:bg-green-500/5",
        },
        {
            icon: <Briefcase className="h-6 w-6 text-purple-500" />,
            title: "Tech Lead",
            subtitle: "CTO experience in B2B SaaS",
            query: "Find CTOs with experience in B2B SaaS",
            color: "hover:border-purple-500/50 hover:bg-purple-500/5",
        },
    ]

    return (
        <div className={cn("w-full", className)}>
            <p className="text-sm text-muted-foreground mb-3 font-medium px-1">Or try asking...</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {allCards.map((card, index) => (
                    <button
                        key={`${card.title}-${index}`}
                        onClick={() => onSelect(card.query)}
                        className={cn(
                            "flex flex-col items-start p-5 rounded-xl border border-border/50 bg-card/50 text-left group",
                            "transition-all duration-300 ease-in-out",
                            card.color
                        )}
                    >
                        {/* Icon at top */}
                        <div className="mb-4">
                            {card.icon}
                        </div>
                        
                        {/* Title */}
                        <h3 className="font-semibold text-foreground text-base mb-2 leading-tight">
                            {card.title}
                        </h3>
                        
                        {/* Subtitle/Description */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {card.subtitle}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}

