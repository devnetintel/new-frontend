"use client"

import React, { createContext, useContext, useState } from "react"

export type HubId = "shubham" | "ajay"

interface HubContextType {
    selectedHubs: HubId[]
    toggleHub: (hub: HubId) => void
    selectAll: () => void
    deselectAll: () => void
}

const HubContext = createContext<HubContextType | undefined>(undefined)

export function HubProvider({ children }: { children: React.ReactNode }) {
    // Default to both selected
    const [selectedHubs, setSelectedHubs] = useState<HubId[]>(["shubham", "ajay"])

    const toggleHub = (hub: HubId) => {
        setSelectedHubs((prev) => {
            if (prev.includes(hub)) {
                return prev.filter((h) => h !== hub)
            } else {
                return [...prev, hub]
            }
        })
    }

    const selectAll = () => setSelectedHubs(["shubham", "ajay"])
    const deselectAll = () => setSelectedHubs([])

    return (
        <HubContext.Provider value={{ selectedHubs, toggleHub, selectAll, deselectAll }}>
            {children}
        </HubContext.Provider>
    )
}

export function useHub() {
    const context = useContext(HubContext)
    if (context === undefined) {
        throw new Error("useHub must be used within a HubProvider")
    }
    return context
}
