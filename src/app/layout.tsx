import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { LayoutContent } from "@/components/layout-content";
import { HubProvider } from "@/lib/hub-context";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

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
      <body
        className={cn(
          outfit.variable,
          "font-sans antialiased bg-background text-foreground min-h-screen flex relative overflow-x-hidden"
        )}
      >
        {/* Global Background Orbs */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="network-orb orb-1" />
          <div className="network-orb orb-2" />
        </div>

        <div className="relative z-10 flex-1 flex">
          <ClerkProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <HubProvider>
                <SidebarWrapper />
                <LayoutContent>{children}</LayoutContent>
              </HubProvider>
              <Toaster />
            </ThemeProvider>
          </ClerkProvider>
        </div>
      </body>
    </html>
  );
}
