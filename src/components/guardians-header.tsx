"use client"

import { cn } from "@/lib/utils"
import { WorkspaceInfo } from "@/types"

interface GuardiansHeaderProps {
    workspaces: WorkspaceInfo[]
    className?: string
}

export function GuardiansHeader({ workspaces, className }: GuardiansHeaderProps) {
    // Get unique owner names from owner_name or fallback to name
    const ownerNames = Array.from(new Set(workspaces.map(w => (w.owner_name || w.name).split("'")[0].trim()))).filter(Boolean)
    
    // Helper function to get initials for fallback avatar
    const getInitials = (name: string) => {
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

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
                {workspaces.slice(0, 3).map((workspace, index) => {
                    const ownerName = workspace.owner_name || workspace.name;
                    const pictureUrl = workspace.owner_picture_url;
                    
                    return (
                        <div
                            key={workspace.id}
                            className={cn(
                                "relative w-16 h-16 rounded-full border-4 border-background overflow-hidden shadow-xl transition-transform hover:scale-105 hover:z-10",
                            )}
                            style={{ zIndex: workspaces.length - index }}
                        >
                            {pictureUrl ? (
                                <img
                                    src={pictureUrl}
                                    alt={ownerName}
                                    className="w-full h-full object-cover bg-muted"
                                    onError={(e) => {
                                        // Fallback to initials if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent && !parent.querySelector('.fallback-initials')) {
                                            const fallback = document.createElement('div');
                                            fallback.className = 'fallback-initials w-full h-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-lg';
                                            fallback.textContent = getInitials(ownerName);
                                            parent.appendChild(fallback);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-lg">
                                    {getInitials(ownerName)}
                                </div>
                            )}
                        </div>
                    );
                })}
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

