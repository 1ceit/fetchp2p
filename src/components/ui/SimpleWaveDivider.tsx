"use client";

import React from "react";

type SimpleWaveDividerProps = {
  from?: string; // Color of the section we ARE in
  to?: string;   // Color of the section we are GOING to
  bottom?: boolean; // If true, it means it's a bottom-of-section divider
  flip?: boolean; // If true, mirrors the wave
};

export default function SimpleWaveDivider({
  from = "var(--color-paper)",
  to = "var(--color-surface)",
  bottom = false,
  flip = false
}: SimpleWaveDividerProps) {
  return (
    <div
      style={{
        background: from,
        lineHeight: 0,
        display: "block",
      }}
    >
      <svg
        className="w-full h-24"
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{
          fill: to,
          transform: `${bottom ? "scaleY(-1)" : ""} ${flip ? "scaleX(-1)" : ""}`.trim() || "none",
          marginBottom: "-1px",
        }}
      >
        <path d="M0 64L48 58.7C96 53 192 43 288 37.3C384 32 480 32 576 42.7C672 53 768 75 864 80C960 85 1056 75 1152 58.7C1248 43 1344 21 1392 10.7L1440 0V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V64Z"></path>
      </svg>
    </div>
  );
}

