import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, iconLeft, iconRight, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[--color-ink-2] tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {iconLeft && (
            <span className="absolute left-3 text-[--color-ink-3] pointer-events-none flex items-center">
              {iconLeft}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full font-[--font-sans] text-[14px] text-[--color-ink]",
              "bg-[--color-surface] border-[1.5px] border-[--color-border]",
              "rounded-[--radius-md] px-3.5 py-2.5",
              "placeholder:text-[--color-ink-4]",
              "shadow-[inset_1px_1px_0_rgba(0,0,0,0.06)]",
              "transition-[border-color,box-shadow] duration-100",
              "focus:outline-none focus:border-[--color-accent] focus:shadow-[inset_1px_1px_0_rgba(0,0,0,0.06),0_0_0_2px_var(--color-accent-soft)]",
              error ? "border-[--color-error] focus:border-[--color-error]" : "",
              iconLeft ? "pl-9" : "",
              iconRight ? "pr-9" : "",
              className,
            ]
              .join(" ")
              .trim()}
            {...props}
          />

          {iconRight && (
            <span className="absolute right-3 text-[--color-ink-3] flex items-center">
              {iconRight}
            </span>
          )}
        </div>

        {error && (
          <p className="text-[12px] text-[--color-error] font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-[12px] text-[--color-ink-3]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
