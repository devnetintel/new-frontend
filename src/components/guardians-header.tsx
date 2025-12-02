"use client"

import { cn } from "@/lib/utils"
import { WorkspaceInfo } from "@/services"

interface GuardiansHeaderProps {
    workspaces: WorkspaceInfo[]
    className?: string
}

export function GuardiansHeader({ workspaces, className }: GuardiansHeaderProps) {
    // Get unique owner names (mock logic since WorkspaceInfo currently has 'name' which is usually the owner's name)
    // In a real app, we might have specific owner fields.
    const ownerNames = Array.from(new Set(workspaces.map(w => w.name.split("'")[0].trim()))).filter(Boolean)

    // Construct the "Collective" copy
    let collectiveText = ""
    if (ownerNames.length === 1) {
        collectiveText = `${ownerNames[0]} is here to connect you.`
    } else if (ownerNames.length === 2) {
        collectiveText = `${ownerNames[0]} and ${ownerNames[1]} are here to connect you.`
    } else {
        collectiveText = `${ownerNames[0]}, ${ownerNames[1]} and others are here to connect you.`
    }

    return (
        <div className={cn("flex flex-col items-center space-y-6", className)}>
            {/* Avatars Cluster */}
            <div className="flex items-center justify-center -space-x-4">
                {workspaces.slice(0, 3).map((workspace, index) => (
                    <div
                        key={workspace.id}
                        className={cn(
                            "relative w-16 h-16 rounded-full border-4 border-background overflow-hidden shadow-xl transition-transform hover:scale-105 hover:z-10",
                            // Add slight staggered animation or positioning if needed
                        )}
                        style={{ zIndex: workspaces.length - index }}
                    >
                        {/* 
                           Using DiceBear for consistent, high-quality avatars as placeholders.
                           In production, this would be workspace.owner_avatar_url 
                        */}
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${workspace.id}`}
                            alt={workspace.name}
                            className="w-full h-full object-cover bg-muted"
                        />
                    </div>
                ))}
                {workspaces.length > 3 && (
                    <div className="relative w-16 h-16 rounded-full border-4 border-background bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shadow-xl z-0">
                        +{workspaces.length - 3}
                    </div>
                )}
            </div>

            {/* The Collective Copy */}
            <h1 className="text-2xl md:text-3xl font-medium text-center tracking-tight text-foreground/90 max-w-2xl leading-relaxed">
                {collectiveText}
            </h1>
        </div>
    )
}

