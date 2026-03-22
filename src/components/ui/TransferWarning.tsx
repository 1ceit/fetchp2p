"use client";

import { AlertCircle, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface TransferWarningProps {
  connectionType?: string;
}

export default function TransferWarning({ connectionType }: TransferWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-4 p-5 rounded-xl max-w-sm"
      style={{
        background: "var(--color-surface-2)",
        border: "1.5px solid var(--color-border)",
      }}
    >
      <div className="flex items-center gap-2.5" style={{ color: "var(--color-warning, #f59e0b)" }}>
        <AlertCircle className="w-5 h-5" />
        <span className="text-[14px] font-bold uppercase tracking-wider">Keep this tab open</span>
      </div>
      
      <div className="flex flex-col gap-3">
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-ink-2)" }}>
          Closing this page will cancel the transfer. Because this is <strong>peer-to-peer</strong>, files stream directly between browsers without touching a server.
        </p>
        
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between py-2 px-3 rounded-md" style={{ background: "var(--color-paper)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[12px] font-bold" style={{ color: "var(--color-ink-2)" }}>
                E2E Secure
              </span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {connectionType && (
            <div className="flex items-center justify-between py-2 px-3 rounded-md" style={{ background: "var(--color-paper)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                <span className="text-[12px] font-medium" style={{ color: "var(--color-ink-3)" }}>
                  {connectionType}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-30">Active</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
