"use client";
import Link from "next/link";
import { Mail, Globe } from "lucide-react";
import { motion } from "framer-motion";

const Github = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full pt-28 pb-12 px-6"
      style={{
        background: "var(--color-surface)"
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-10">
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span
                className="text-[24px] font-bold tracking-tighter"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
              >
                FetchP2P
              </span>
            </div>
            <p className="text-[15px] leading-relaxed opacity-50 max-w-sm">
              A fast way to send and receive files. Direct peer-to-peer transfer with no server storage and end-to-end encryption.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/1ceit" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-(--color-ink-6) hover:bg-(--color-ink-5) transition-all opacity-70 hover:opacity-100 flex items-center justify-center">
                <Github size={18} />
              </a>
              <a href="https://1ceit.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-(--color-ink-6) hover:bg-(--color-ink-5) transition-all opacity-70 hover:opacity-100 flex items-center justify-center">
                <Globe size={18} />
              </a>
              <a href="mailto:cj@1ceit.com" target="_blank" className="p-2 rounded-lg bg-(--color-ink-6) hover:bg-(--color-ink-5) transition-all opacity-70 hover:opacity-100 flex items-center justify-center">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Links Columns */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-30">Quick Links</span>
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-[14px] hover:text-(--color-accent) transition-colors opacity-60 hover:opacity-100">Home</Link>
              <Link href="/send" className="text-[14px] hover:text-(--color-accent) transition-colors opacity-60 hover:opacity-100">Send Files</Link>
              <Link href="/receive" className="text-[14px] hover:text-(--color-accent) transition-colors opacity-60 hover:opacity-100">Receive</Link>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-30">Legal</span>
            <div className="flex flex-col gap-3">
              <Link href="/privacy" className="text-[14px] hover:text-(--color-accent) transition-colors opacity-60 hover:opacity-100">Privacy Policy</Link>
              <Link href="/terms" className="text-[14px] hover:text-(--color-accent) transition-colors opacity-60 hover:opacity-100">Terms of Service</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-5 border-t border-(--color-border) flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-[12px] opacity-30 tracking-tight">
            © {currentYear} CJ Artz. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/1ceit/fetchp2p" target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium opacity-40 hover:opacity-100 hover:text-(--color-accent) transition-all">
              View on GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
