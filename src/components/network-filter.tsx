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
            <div className="flex items-center gap-2">
                {/* "All Networks" Pill */}
                <button
                    onClick={onSelectAll}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border",
                        isAllSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                    )}
                >
                    {isAllSelected && <Check className="h-3.5 w-3.5" />}
                    All Networks
                </button>

                <div className="h-6 w-px bg-border mx-1" />

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
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border",
                                isSelected
                                    ? activeStyles
                                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                            )}
                        >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                            {workspace.name}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
