interface LoaderProps {
  variant?: "spinner" | "dots" | "bar";
  size?: "sm" | "md" | "lg";
  label?: string;
}

const spinnerSizes = { sm: "w-5 h-5", md: "w-7 h-7", lg: "w-10 h-10" };
const dotSizes = { sm: "w-1.5 h-1.5", md: "w-2 h-2", lg: "w-3 h-3" };

export function Loader({ variant = "spinner", size = "md", label }: LoaderProps) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      {variant === "spinner" && (
        <div
          className={[
            spinnerSizes[size],
            "rounded-full border-2 border-(--color-border)",
            "border-t-(--color-accent) animate-spin",
          ].join(" ")}
        />
      )}

      {variant === "dots" && (
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={[
                dotSizes[size],
                "rounded-full bg-(--color-accent)",
                "animate-bounce",
              ].join(" ")}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}

      {variant === "bar" && (
        <div className="w-40 h-2 bg-(--color-surface-2) border border-(--color-border) rounded-full overflow-hidden">
          <div
            className="h-full bg-(--color-accent) rounded-full animate-[bar-slide_1.4s_ease-in-out_infinite]"
            style={{ width: "40%" }}
          />
        </div>
      )}

      {label && (
        <p className="text-[13px] font-medium text-(--color-ink-3)">{label}</p>
      )}
    </div>
  );
}
