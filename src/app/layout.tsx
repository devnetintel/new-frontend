import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { HubProvider } from "@/lib/hub-context";

import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "PNI - Personal Network Intelligence",
    description: "Search your network with natural language.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn(outfit.variable, "font-sans antialiased bg-background text-foreground min-h-screen flex")}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <HubProvider>
                        <Sidebar />
                        <main className="flex-1 md:pl-16 min-h-screen relative">
                            <ModeToggle />
                            {children}
                        </main>
                    </HubProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
