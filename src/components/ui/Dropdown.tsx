"use client";
/**
 * Dropdown — flat kraft select/dropdown menu
 */
import { useState, useRef, useEffect, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  label?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function Dropdown({
  options,
  value,
  placeholder = "Select…",
  label,
  onChange,
  disabled = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={ref}>
      {label && (
        <span className="text-[13px] font-medium text-[--color-ink-2] tracking-wide">
          {label}
        </span>
      )}

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
          className={[
            "w-full flex items-center justify-between gap-2",
            "bg-[--color-surface] border-[1.5px] border-[--color-border]",
            "rounded-[--radius-md] px-3.5 py-2.5",
            "text-[14px] text-left font-[--font-sans]",
            "shadow-[inset_1px_1px_0_rgba(0,0,0,0.06)]",
            "transition-[border-color,box-shadow,color,background-color] duration-100",
            open ? "border-[--color-accent]" : "hover:border-[--color-ink-3]",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          ]
            .join(" ")
            .trim()}
        >
          <span className={selected ? "text-[--color-ink]" : "text-[--color-ink-4]"}>
            {selected ? (
              <span className="flex items-center gap-2">
                {selected.icon}
                {selected.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[--color-ink-3] shrink-0 transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Menu */}
        {open && (
          <div
            className={[
              "absolute z-50 top-full mt-1 w-full",
              "bg-[--color-surface] border-[1.5px] border-[--color-border]",
              "rounded-[--radius-md] overflow-hidden",
              "shadow-(--shadow-lg)",
            ].join(" ")}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
                className={[
                  "w-full flex items-center gap-2.5 px-4 py-2.5",
                  "text-[14px] text-[--color-ink] text-left",
                  "transition-colors duration-75",
                  opt.value === value
                    ? "bg-[--color-accent-soft] text-[--color-accent] font-medium"
                    : "hover:bg-[--color-surface-2]",
                ]
                  .join(" ")
                  .trim()}
              >
                {opt.icon && <span className="text-[--color-ink-3]">{opt.icon}</span>}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
