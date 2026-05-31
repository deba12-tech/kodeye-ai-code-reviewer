import React from "react";
import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({ children, className }) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-line-color, rgba(71,85,105,0.06)) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-line-color, rgba(71,85,105,0.06)) 1px, transparent 1px),
            radial-gradient(circle at 50% 60%, var(--grid-glow-1, rgba(236,72,153,0.1)) 0%, var(--grid-glow-2, rgba(168,85,247,0.03)) 40%, transparent 70%)
          `,
          backgroundSize: "40px 40px, 40px 40px, 100% 100%",
        }}
      />
      <div className="relative z-10 w-full h-full flex overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default GridBackground;
