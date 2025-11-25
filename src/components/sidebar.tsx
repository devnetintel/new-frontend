
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Library, Settings, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar() {
    const pathname = usePathname()

    const navItems = [
        { icon: Home, label: "Home", href: "/search" },
        { icon: Library, label: "Library", href: "/dashboard" },
    ]

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-16 flex-col items-center border-r border-border/10 bg-background py-4 hidden md:flex">
            <div className="mb-8">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary text-xs">PNI</span>
                </div>
            </div>

            <nav className="flex flex-1 flex-col items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full mb-4 opacity-50 hover:opacity-100">
                    <PlusCircle className="h-6 w-6" />
                </Button>

                {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "rounded-lg transition-all duration-200",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary opacity-100 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                                    : "opacity-60 hover:opacity-100 hover:bg-muted"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="sr-only">{item.label}</span>
                        </Button>
                    </Link>
                ))}
            </nav>

            <div className="mt-auto flex flex-col items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-lg opacity-60 hover:opacity-100">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Button>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    P
                </div>
            </div>
        </aside>
    )
}
