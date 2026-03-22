/**
 * Button — flat 2D kraft design
 * Variants: primary | secondary | ghost | danger
 * Sizes:    sm | md | lg
 */
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-[13px] gap-1.5",
  md: "px-4 py-2.5 text-[14px] gap-2",
  lg: "px-6 py-3 text-[15px] gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      iconLeft,
      iconRight,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    let variantClass = "";
    if (variant === "primary") {
      variantClass = [
        "bg-(--color-accent) text-white",
        "border-[1.5px] border-(--color-accent-hover)",
        "shadow-(--shadow-accent)",
        "hover:bg-(--color-accent-hover) hover:translate-y-px hover:shadow-[2px_2px_0_var(--color-accent-hover)]",
        "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
      ].join(" ");
    } else if (variant === "secondary") {
      variantClass = [
        "bg-(--color-surface) text-(--color-ink)",
        "border-[1.5px] border-(--color-border)",
        "shadow-(--shadow-sm)",
        "hover:bg-(--color-surface-2) hover:translate-y-px hover:shadow-[2px_2px_0_var(--color-border)]",
        "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
      ].join(" ");
    } else if (variant === "ghost") {
      variantClass = [
        "bg-transparent text-(--color-ink-2)",
        "border-[1.5px] border-transparent",
        "hover:bg-(--color-surface) hover:border-(--color-border)",
      ].join(" ");
    } else if (variant === "danger") {
      variantClass = [
        "bg-(--color-error) text-white",
        "border-[1.5px] border-red-800",
        "shadow-[2px_2px_0_#7a1a18]",
        "hover:opacity-90 hover:translate-y-px",
        "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
      ].join(" ");
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center font-semibold rounded-md",
          "transition-[transform,box-shadow] duration-100 cursor-pointer select-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent)",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0",
          sizeStyles[size],
          variantClass,
          className,
        ]
          .join(" ")
          .trim()}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          iconLeft && <span className="shrink-0">{iconLeft}</span>
        )}
        {children}
        {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
