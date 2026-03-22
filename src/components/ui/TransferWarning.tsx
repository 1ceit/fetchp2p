"use client";

import { AlertCircle, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface TransferWarningProps {
  connectionType?: string;
}

export default function TransferWarning({ connectionType }: TransferWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-3 p-5 rounded-xl max-w-sm"
      style={{
        background: "var(--color-surface-2)",
        border: "1.5px solid var(--color-border)",
      }}
    >
      <div className="flex items-center gap-2.5" style={{ color: "var(--color-warning, #f59e0b)" }}>
        <AlertCircle className="w-5 h-5" />
        <span className="text-[14px] font-bold uppercase tracking-wider">Keep this tab open</span>
      </div>
      
      <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-ink-2)" }}>
        Closing this page will cancel the transfer. Because this is <strong>peer-to-peer</strong>, files stream directly between browsers without touching a server.
      </p>
      
      <div className="flex items-center gap-1.5 mt-1 pt-3 opacity-80" style={{ borderTop: "1.5px dashed var(--color-border)", color: "var(--color-ink-3)" }}>
        <Lock className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium tracking-wide">
          End-to-end encrypted {connectionType ? `• ${connectionType}` : ""}
        </span>
      </div>
    </motion.div>
  );
}
