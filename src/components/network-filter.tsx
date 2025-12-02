"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import type { WorkspaceInfo } from "@/services"

interface NetworkFilterProps {
    workspaces: WorkspaceInfo[]
    selectedIds: string[]
    onToggle: (id: string) => void
    onSelectAll: () => void
}

export function NetworkFilter({ workspaces, selectedIds, onToggle, onSelectAll }: NetworkFilterProps) {
    const isAllSelected = workspaces.length > 0 && selectedIds.length === workspaces.length

    return (
        <div className="w-full overflow-x-auto pb-2 no-scrollbar">
            <div className="flex items-center gap-1.5 md:gap-2">
                {/* "All Networks" Pill */}
                <button
                    onClick={onSelectAll}
                    className={cn(
                        "flex items-center gap-1 md:gap-2 px-2.5 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap border shrink-0",
                        isAllSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                    )}
                >
                    {isAllSelected && <Check className="h-3 w-3 md:h-3.5 md:w-3.5" />}
                    <span className="hidden sm:inline">All Networks</span>
                    <span className="sm:hidden">All</span>
                </button>

                <div className="h-5 md:h-6 w-px bg-border mx-0.5 md:mx-1 shrink-0" />

                {/* Individual Network Pills */}
                {workspaces.map((workspace) => {
                    const isSelected = selectedIds.includes(workspace.id)
                    // Simple deterministic color assignment based on ID char code sum
                    const colorIndex = workspace.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5

                    const activeStyles = [
                        "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        "bg-green-500/10 text-green-500 border-green-500/20",
                        "bg-purple-500/10 text-purple-500 border-purple-500/20",
                        "bg-orange-500/10 text-orange-500 border-orange-500/20",
                        "bg-pink-500/10 text-pink-500 border-pink-500/20",
                    ][colorIndex]

                    return (
                        <button
                            key={workspace.id}
                            onClick={() => onToggle(workspace.id)}
                            className={cn(
                                "flex items-center gap-1 md:gap-2 px-2.5 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap border shrink-0",
                                isSelected
                                    ? activeStyles
                                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                            )}
                        >
                            {isSelected && <Check className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />}
                            <span className="truncate max-w-[120px] md:max-w-none">{workspace.name}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

