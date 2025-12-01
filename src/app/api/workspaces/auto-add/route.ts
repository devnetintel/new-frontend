import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { workspace_id } = body;

        if (!workspace_id) {
            return NextResponse.json(
                { success: false, message: "Workspace ID is required" },
                { status: 400 }
            );
        }

        // Mock success response
        // In a real app, this would verify the token and add the user to the workspace
        console.log(`[Mock API] Auto-adding workspace: ${workspace_id}`);

        return NextResponse.json({
            success: true,
            workspace: {
                id: workspace_id,
                name: workspace_id.charAt(0).toUpperCase() + workspace_id.slice(1), // Capitalize
                profile_count: 150, // Mock count
                workspace_id: workspace_id,
            },
            already_had_access: false,
        });
    } catch (error) {
        console.error("[Mock API] Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
