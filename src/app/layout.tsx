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
import { ChatProvider } from "@/contexts/chat-context";

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
    <html lang="en" suppressHydrationWarning className="dark">
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
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <HubProvider>
              <ChatProvider>
                <SidebarWrapper />
                <LayoutContent>{children}</LayoutContent>
              </ChatProvider>
            </HubProvider>
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
                classNames: {
                  toast: "group toast",
                  title: "group-[.toast]:text-sm group-[.toast]:font-medium",
                  description: "group-[.toast]:text-xs",
                  actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                  cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                },
              }}
            />
          </ThemeProvider>
        </ClerkProvider>
        </div>
      </body>
    </html>
  );
}
