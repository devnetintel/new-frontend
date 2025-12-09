"use client"

import { cn } from "@/lib/utils"
import { WorkspaceInfo } from "@/services"

interface GuardiansHeaderProps {
    workspaces: WorkspaceInfo[]
    userName: string
    className?: string
}

export function GuardiansHeader({ workspaces, userName, className }: GuardiansHeaderProps) {
    // Separate owned networks from guest networks
    const ownedNetworks = workspaces.filter(w => w.isOwner);
    const guestNetworks = workspaces.filter(w => !w.isOwner);

    // Get unique owner names from GUEST networks only (exclude owned networks from the "backing you" message)
    const guestOwnerNames = Array.from(new Set(guestNetworks.map(w => w.name.split("'")[0].trim()))).filter(Boolean);

    // Fallback if no guest networks
    if (guestOwnerNames.length === 0 && ownedNetworks.length > 0) {
        // User only has their own network, show encouraging message
        guestOwnerNames.push("Your Network");
    } else if (guestOwnerNames.length === 0) {
        guestOwnerNames.push("The Council");
    }

    // Construct the "Collective" copy according to PRD
    // Only show guest network owners (people backing you), not your own network
    let collectiveText = "";
    if (guestOwnerNames.length === 1 && guestOwnerNames[0] === "Your Network") {
        collectiveText = "Your network is ready to connect you.";
    } else if (guestOwnerNames.length === 1) {
        collectiveText = `${guestOwnerNames[0]} is ready to connect you.`;
    } else if (guestOwnerNames.length === 2) {
        collectiveText = `${guestOwnerNames[0]} and ${guestOwnerNames[1]} are ready to connect you.`;
    } else if (guestOwnerNames.length === 3) {
        collectiveText = `${guestOwnerNames[0]}, ${guestOwnerNames[1]}, and ${guestOwnerNames[2]} are ready to connect you.`;
    } else {
        // 4+ networks: show first name + count of others
        const othersCount = guestOwnerNames.length - 1;
        collectiveText = `${guestOwnerNames[0]} and ${othersCount} other${othersCount !== 1 ? 's' : ''} are ready to connect you.`;
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
