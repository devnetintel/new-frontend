import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        // Mock workspaces for Ajay Suwalka
        // In production, this would query the database based on the authenticated user

        const mockWorkspaces = [
            {
                workspace_id: "suwalka",
                name: "Ajay Suwalka's Network",
                owner_name: "Ajay Suwalka",
                profile_count: 250,
                source: "admin",
                isOwner: true, // Ajay owns this network
            },
            {
                workspace_id: "shubham",
                name: "Shubham Rai's Network",
                owner_name: "Shubham Rai",
                profile_count: 180,
                source: "link",
                isOwner: false, // Ajay has guest access
            },
        ];

        return NextResponse.json({
            success: true,
            workspaces: mockWorkspaces,
        });
    } catch (error) {
        console.error("[Mock API] Error fetching workspaces:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
