"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, DollarSign, Code2 } from "lucide-react"

interface InspirationDeckProps {
    onSelect: (query: string) => void
    className?: string
}

export function InspirationDeck({ onSelect, className }: InspirationDeckProps) {
    const cards = [
        {
            icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
            title: "Growth Mentor",
            subtitle: "Someone who has scaled D2C past $10M",
            query: "Find a growth mentor who has scaled a D2C brand past $10M revenue",
            color: "hover:border-blue-500/50 hover:bg-blue-500/5",
        },
        {
            icon: <DollarSign className="h-5 w-5 text-green-500" />,
            title: "Seed Investor",
            subtitle: "Active angel investors in Fintech",
            query: "Find active seed investors or angels who invest in Fintech startups",
            color: "hover:border-green-500/50 hover:bg-green-500/5",
        },
        {
            icon: <Code2 className="h-5 w-5 text-purple-500" />,
            title: "Tech Lead",
            subtitle: "CTO experience in B2B SaaS",
            query: "Find a Tech Lead or CTO with experience in B2B SaaS",
            color: "hover:border-purple-500/50 hover:bg-purple-500/5",
        },
    ]

    return (
        <div className={cn("w-full", className)}>
            <p className="text-sm text-muted-foreground mb-3 font-medium px-1">Or try asking...</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cards.map((card, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(card.query)}
                        className={cn(
                            "flex flex-col items-start p-4 rounded-xl border border-border/50 bg-card/50 text-left transition-all duration-200 group",
                            card.color
                        )}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-background border border-border/50 group-hover:border-transparent transition-colors">
                                {card.icon}
                            </div>
                            <span className="font-semibold text-foreground">{card.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {card.subtitle}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}
