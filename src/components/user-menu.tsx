"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, Moon, Sun, Monitor, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

interface UserMenuProps {
  afterSignOutUrl?: string;
}

export function UserMenu({ afterSignOutUrl = "/sign-in" }: UserMenuProps) {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user.emailAddresses[0]?.emailAddress[0].toUpperCase() || "U";

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.emailAddresses[0]?.emailAddress || "User";

  const handleSignOut = async () => {
    await signOut();
    router.push(afterSignOutUrl);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-muted/50 transition-all duration-200"
        >
          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
            <AvatarImage src={user.imageUrl} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-lg border border-border/50 bg-card shadow-md"
      >
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
              <AvatarImage src={user.imageUrl} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          onClick={() => openUserProfile()}
          className="cursor-pointer focus:bg-muted/50 transition-colors duration-200"
        >
          <User className="mr-2 h-4 w-4" />
          <span className="text-sm">Manage account</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer focus:bg-muted/50 transition-colors duration-200"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span className="text-sm flex-1">Light</span>
          {theme === "light" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer focus:bg-muted/50 transition-colors duration-200"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span className="text-sm flex-1">Dark</span>
          {theme === "dark" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer focus:bg-muted/50 transition-colors duration-200"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span className="text-sm flex-1">System</span>
          {theme === "system" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-500 dark:text-red-400 focus:text-red-600 dark:focus:text-red-300 focus:bg-red-500/10 dark:focus:bg-red-400/10 transition-colors duration-200"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="text-sm">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

