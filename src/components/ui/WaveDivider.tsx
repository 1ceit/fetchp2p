"use client";

type WaveDividerProps = {
  inverted?: boolean;
  flip?: boolean;
};

export default function WaveDivider({ inverted = false, flip = false }: WaveDividerProps) {
  return (
    <div
      style={{
        background: inverted ? "var(--color-surface)" : "var(--color-paper)",
        lineHeight: 0,
        display: "block",
      }}
    >
      <svg
        className="w-full h-44"
        viewBox="0 0 1440 100"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{
          fill: inverted ? "var(--color-paper)" : "var(--color-surface)",
          transform: `${inverted ? "scaleY(-1)" : ""} ${flip ? "scaleX(-1)" : ""}`.trim() || "none",
          display: "block",
        }}
      >
        <path
          d="M0 0L48 8.33333C96 16.6667 192 33.3333 288 41.6667C384 50 480 50 576 45.8333C672 41.6667 768 33.3333 864 29.1667C960 25 1056 25 1152 29.1667C1248 33.3333 1344 41.6667 1392 45.8333L1440 50V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V0Z"
          style={{ opacity: 0.4 }}
        />
        <path
          d="M0 50L48 45.8333C96 41.6667 192 33.3333 288 29.1667C384 25 480 25 576 29.1667C672 33.3333 768 41.6667 864 45.8333C960 50 1056 50 1152 45.8333C1248 41.6667 1344 33.3333 1392 29.1667L1440 25V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
          style={{ opacity: 0.7 }}
        />
        <path d="M0 75L48 70.8333C96 66.6667 192 58.3333 288 54.1667C384 50 480 50 576 54.1667C672 58.3333 768 66.6667 864 70.8333C960 75 1056 75 1152 70.8333C1248 66.6667 1344 58.3333 1392 54.1667L1440 50V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V75Z" />
      </svg>
    </div>
  );
}
