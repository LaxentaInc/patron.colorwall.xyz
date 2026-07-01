import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GradientHeadingProps {
  text: string;
  as?: React.ElementType;
  className?: string;
  theme?: "gold" | "blue" | "dark";
}

export const GradientHeading: React.FC<GradientHeadingProps> = ({
  text,
  as: Tag = "span",
  className,
  theme = "gold",
}) => {
  const baseClasses = "text-transparent bg-clip-text font-bold";
  
  const themeClasses = {
    gold: "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]",
    blue: "bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-500 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]",
    dark: "bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600",
  };

  return (
    <Tag className={cn(baseClasses, themeClasses[theme], className)}>
      {text}
    </Tag>
  );
};
