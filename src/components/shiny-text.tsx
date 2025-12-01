"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 3,
  className = "",
}) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={cn(
        "text-muted-foreground/60 inline-block relative",
        className
      )}
    >
      <span className="relative z-10">{text}</span>
      {!disabled && (
        <span
          className="absolute inset-0 shiny-text-overlay animate-shine"
          style={{
            animationDuration: animationDuration,
          }}
          aria-hidden="true"
        >
          {text}
        </span>
      )}
    </span>
  );
};

