import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "error" | "warning" | "outline";
  size?: "sm" | "md";
}

const variants = {
  default: "bg-[--color-surface-2] text-[--color-ink-2] border-[--color-border]",
  accent: "bg-[--color-accent] text-white border-[--color-accent-hover]",
  success: "bg-[--color-success]/15 text-[--color-success] border-[--color-success]/40",
  error: "bg-[--color-error]/15 text-[--color-error] border-[--color-error]/40",
  warning: "bg-[--color-warning]/15 text-[--color-warning] border-[--color-warning]/40",
  outline: "bg-transparent text-[--color-ink-2] border-[--color-border]",
};

const sizes = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-[12px]",
};

export function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center font-medium border rounded-full tracking-wide",
        variants[variant],
        sizes[size],
        className,
      ]
        .join(" ")
        .trim()}
      {...props}
    >
      {children}
    </span>
  );
}
