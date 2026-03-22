/**
 * Card — flat kraft surface card
 * variant: "surface" (slightly darker than paper) | "paper" (same as bg) | "accent" (accent tinted)
 */
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "paper" | "accent";
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: boolean;
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-7",
};

const variants = {
  surface: "bg-[--color-surface] border-[1.5px] border-[--color-border]",
  paper:   "bg-[--color-paper] border-[1.5px] border-[--color-border]",
  accent:  "bg-[--color-accent-soft] border-[1.5px] border-[--color-accent]",
};

export function Card({
  variant = "surface",
  padding = "md",
  shadow = true,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-[--radius-lg]",
        variants[variant],
        paddings[padding],
        shadow ? "shadow-(--shadow-md)" : "",
        className,
      ]
        .join(" ")
        .trim()}
      {...props}
    >
      {children}
    </div>
  );
}
