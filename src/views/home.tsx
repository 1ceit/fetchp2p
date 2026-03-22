"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Shield, Zap, Link2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  WaveDivider,
  ThemeToggle,
  DogMascot,
  Button,
  SimpleWaveDivider,
  ScrollToTop
} from "@/components/ui";
import { useFiles } from "@/context/FileContext";

type Mode = "send" | "receive";

/* ─── How it works data ── */
const steps = [
  {
    num: "01",
    icon: <Upload className="w-5 h-5" />,
    title: "Drop your files",
    desc: "Select any files from your device. Any type, any size. No upload to any server; files stay on your device until you send them.",
  },
  {
    num: "02",
    icon: <Link2 className="w-5 h-5" />,
    title: "Share the code",
    desc: "A unique 5-character code is generated. Send it to the recipient however you like, text, email, chat, etc.",
  },
  {
    num: "03",
    icon: <Zap className="w-5 h-5" />,
    title: "Files transfer instantly",
    desc: "Once they enter the code, a direct encrypted connection forms between your browsers. Files stream across P2P via E2E encrypted WebRTC, no middleman.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { setFiles } = useFiles();
  const [mode, setMode] = useState<Mode>("send");
  const [isDragging, setIsDragging] = useState(false);
  const [receiveCode, setReceiveCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Drag handling ── */
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles([droppedFiles[0]]);
      router.push("/send");
    }
  }, [router, setFiles]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      setFiles([selected[0]]);
      router.push("/send");
    }
  };

  const handleReceive = () => {
    if (receiveCode.length >= 5) {
      router.push(`/receive?code=${receiveCode}&auto=true`);
    } else {
      router.push("/receive");
    }
  };

  return (
    <>
      <ThemeToggle />

      {/* ── Hero ── */}
      <div
        className="min-h-10/12 flex flex-col items-center px-4 pt-24 pb-20 gap-8"
        style={{ background: "var(--color-paper)" }}
      >
        {/* Mascot */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-1"
        >
          <DogMascot state="idle" size={260} />

          {/* Headline */}
          <div className="flex flex-col items-center text-center gap-2">
            <h1
              className="text-[clamp(2.4rem,5.5vw,3.2rem)] leading-[1.1] tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              Drop a file.{" "}
              <span style={{ color: "var(--color-accent)" }}>Link a friend.</span>
              <br />Done.
            </h1>
            <p className="text-[15px] max-w-sm" style={{ color: "var(--color-ink-2)" }}>
              Peer-to-peer file transfer, encrypted, instant, free.
            </p>
          </div>
        </motion.div>

        {/* ── Transfer Card ── */}
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--color-surface)",
              border: "1.5px solid var(--color-border)",
              boxShadow: "var(--shadow-lg)"
            }}
          >
            {/* Mode toggle */}
            <div className="flex" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
              {(["send", "receive"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-4 text-[14px] font-semibold capitalize transition-all duration-150 hover:cursor-pointer"
                  style={{
                    background: mode === m ? "var(--color-paper)" : "transparent",
                    color: mode === m ? "var(--color-accent)" : "var(--color-ink-3)",
                    borderBottom: mode === m ? "2px solid var(--color-accent)" : "2px solid transparent",
                  }}
                >
                  {m === "send" ? "Send" : "Receive"}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {mode === "send" ? (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-col gap-4"
                  >
                    <div
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className="relative flex flex-col items-center justify-center gap-3 py-12 rounded-xl cursor-pointer"
                      style={{
                        background: isDragging ? "var(--color-accent-soft)" : "var(--color-paper)",
                        border: `2px dashed ${isDragging ? "var(--color-accent)" : "var(--color-border)"}`,
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ border: "1.5px solid var(--color-accent)" }}
                      >
                        <Upload className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                      </div>
                      <div className="text-center">
                        <p className="text-[15px] font-semibold" style={{ color: "var(--color-ink)" }}>
                          {isDragging ? "Release to drop" : "Drop files here"}
                        </p>
                        <p className="text-[13px] mt-0.5" style={{ color: "var(--color-ink-4)" }}>or click to browse</p>
                      </div>
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFileInput} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="receive"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col gap-5 py-2"
                  >
                    <div className="text-center">
                      <p className="text-[15px] font-semibold" style={{ color: "var(--color-ink)" }}>Ready to receive?</p>
                      <p className="text-[13px] mt-0.5" style={{ color: "var(--color-ink-4)" }}>Enter the 5-character code from your friend</p>
                    </div>
                    <input
                      value={receiveCode}
                      onChange={(e) => setReceiveCode(e.target.value.toUpperCase())}
                      placeholder="XXXXX"
                      maxLength={5}
                      className="w-full text-center py-4 rounded-xl text-[20px] font-bold tracking-[0.18em] focus:outline-none transition-colors"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: "var(--color-paper)",
                        color: "var(--color-ink)",
                        border: "1.5px solid var(--color-border)",
                      }}
                    />
                    <Button
                      onClick={handleReceive}
                      disabled={receiveCode.length < 5}
                      iconRight={<ArrowRight className="w-4 h-4" />}
                      className="w-full py-3.5"
                    >
                      Connect
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      <WaveDivider />

      {/* ── How it works ── */}
      <section className="w-full" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div
            className="flex flex-col gap-2 mb-14"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "var(--color-accent)" }}
            >
              How it works
            </span>
            <h2
              className="text-[2.6rem] leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              Three steps.<br />
              <span style={{ color: "var(--color-ink-2)" }}>That&rsquo;s the whole thing.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className="flex flex-col gap-5 p-6 rounded-xl"
                style={{
                  background: "var(--color-paper)",
                  border: "1.5px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-start justify-between">
                  <span
                    className="text-[3rem] font-bold leading-none"
                    style={{ color: "var(--color-border)", fontFamily: "var(--font-display)" }}
                  >
                    {s.num}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3
                    className="text-[17px] font-semibold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SimpleWaveDivider from="var(--color-surface)" to="var(--color-paper)" flip />

      {/* ── Security ── */}
      <section className="w-full py-32" style={{ background: "var(--color-paper)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-3 mb-20 text-center items-center"
          >
            <h2
              className="text-[clamp(2.4rem,5vw,3.2rem)] leading-none tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              Direct transfers.
            </h2>
            <h2 className="text-[clamp(2.4rem,5vw,3.2rem)] leading-none tracking-tight" style={{ color: "var(--color-ink-2)" }}>
              Zero footprint.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Ephemeral Links",
                desc: "Data streams over a 1:1 encrypted tunnel. There is no middleman server to intercept or store your traffic.",
                icon: <Zap className="w-6 h-6" />
              },
              {
                title: "Local State Only",
                desc: "We don't use databases. Files are indexed and chunked entirely in your browser.",
                icon: <Link2 className="w-6 h-6" />
              },
              {
                title: "Anonymous by Design",
                desc: "No accounts. No logs. No tracking pixels. We have no way of knowing who you are or what you transfer.",
                icon: <Shield className="w-6 h-6" />
              }
            ].map((box, i) => (
              <motion.div
                key={box.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-5 text-center items-center md:items-start md:text-left"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", color: "var(--color-accent)" }}
                >
                  {box.icon}
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-[19px] font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
                    {box.title}
                  </h4>
                  <p className="text-[14px] opacity-70 leading-relaxed">
                    {box.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <WaveDivider />
      <ScrollToTop />
    </>
  );
}
