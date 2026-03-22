"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowRight, Copy, Check, X, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DogMascot,
  ThemeToggle,
  TransferWarning,
  Button,
  WaveDivider,
  type MascotState
} from "@/components/ui";
import { useFiles } from "@/context/FileContext";
import { genCode, formatBytes } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

type Step = "idle" | "ready" | "waiting" | "transferring" | "done" | "error";

function FileRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-md"
      style={{ background: "var(--color-paper)", border: "1.5px solid var(--color-border)" }}
    >
      <div
        className="w-9 h-10 rounded-sm flex flex-col items-center justify-end pb-1 shrink-0"
        style={{ background: "var(--color-surface-2)", border: "1.5px solid var(--color-border)" }}
      >
        <span className="text-[8px] font-bold" style={{ color: "var(--color-accent)" }}>
          {ext.slice(0, 4)}
        </span>
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[13px] font-medium truncate" style={{ color: "var(--color-ink)" }}>
          {file.name}
        </span>
        <span className="text-[12px]" style={{ color: "var(--color-ink-3)" }}>
          {formatBytes(file.size)}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="w-8 h-8 p-0"
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}



function mascotState(step: Step): MascotState {
  if (step === "transferring") return "transferring";
  if (step === "waiting") return "waiting";
  if (step === "done") return "done";
  if (step === "error") return "error";
  return "idle";
}

function mascotCaption(step: Step, errorMsg?: string): string {
  if (step === "idle") return "Hey! Drop a file and I'll take it there.";
  if (step === "ready") return "Nice! Hit send when you're ready.";
  if (step === "waiting") return "I'm ready to go! Waiting for your friend…";
  if (step === "transferring") return "Delivering your files…";
  if (step === "done") return "Done! All files delivered! 🎉";
  if (step === "error" && errorMsg?.includes("disconnected")) return "Uh oh... the receiver left!";
  if (step === "error") return "Uh oh… something went wrong.";
  return "";
}

function SendContent() {
  const router = useRouter();
  const { files: contextFiles, clearFiles } = useFiles();
  const [files, setFiles] = useState<File[]>(contextFiles);
  const [step, setStep] = useState<Step>(contextFiles.length > 0 ? "ready" : "idle");
  const [shareCode, setShareCode] = useState<string>(() => genCode());
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [connectionType, setConnectionType] = useState<string>("Connecting...");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stepRef = useRef(step);
  useEffect(() => { stepRef.current = step; }, [step]);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLockRef = useRef<any>(null);
  const useFallbackRef = useRef(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/r/${shareCode}` : "";

  const filesRef = useRef(files);
  useEffect(() => { filesRef.current = files; }, [files]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host; // includes port
    
    let wsUrl = "";
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      wsUrl = `ws://${window.location.hostname}:9000/peerjs`;
    } else {
      wsUrl = `${protocol}//${host}/peerjs`;
    }
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    let fallbackTimeout: NodeJS.Timeout;

    const sendMessage = (msg: unknown) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
    };

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && !wakeLockRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
          console.log("Sender Wake Lock active");
        }
      } catch (err) {
        console.error("Sender Wake Lock error:", err);
      }
    };

    const releaseWakeLock = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => { wakeLockRef.current = null; }).catch(() => { });
      }
    };

    const sendData = (msg: unknown) => {
      const dataStr = JSON.stringify(msg);
      if (useFallbackRef.current) {
        sendMessage(msg);
      } else if (dcRef.current?.readyState === "open") {
        dcRef.current.send(dataStr);
      }
    };

    ws.onopen = () => {
      console.log("WebSocket connected. Joining room:", shareCode);
      sendMessage({ type: "join", code: shareCode, role: "sender" });

      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) sendMessage({ type: "ping" });
      }, 20000);
      ws.addEventListener("close", () => clearInterval(pingInterval));
    };

    const handleDataMessage = (dataStr: string) => {
      try {
        const msg = JSON.parse(dataStr);
        if (msg.type === "READY") {
          console.log("Receiver signals READY. Starting transfer.");
          setStep("transferring");
          requestWakeLock();
          const file = filesRef.current[0];
          if (!file) return;

          sendData({
            type: "FILE_META",
            name: file.name,
            size: file.size,
            fileType: file.type
          });

          const CHUNK_SIZE = 64 * 1024;
          let offset = 0;
          const reader = new FileReader();

          const readNext = () => {
            const slice = file.slice(offset, offset + CHUNK_SIZE);
            reader.readAsArrayBuffer(slice);
          };

          reader.onload = (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            if (!buffer) return;

            const pushChunk = () => {
              if (!useFallbackRef.current) {
                const dc = dcRef.current;
                if (!dc || dc.readyState !== "open") return;
                if (dc.bufferedAmount > 1024 * 1024) {
                  setTimeout(pushChunk, 50);
                  return;
                }
                dc.send(buffer);
              } else {
                if (ws.readyState !== WebSocket.OPEN) return;
                if (ws.bufferedAmount > 1024 * 1024) {
                  setTimeout(pushChunk, 50);
                  return;
                }
                ws.send(buffer);
              }

              offset += buffer.byteLength;

              if (offset < file.size) {
                readNext();
              } else {
                sendData({ type: "EOF" });
              }
            };
            pushChunk();
          };
          readNext();

        } else if (msg.type === "ACK") {
          console.log("Received ACK. Transfer complete.");
          const file = filesRef.current[0];
          if (file && !useFallbackRef.current) {
            sendMessage({ type: "stats_update", bytes: file.size });
          }
          releaseWakeLock();
          setProgress(100);
          setTimeout(() => setStep("done"), 600);
        } else if (msg.type === "PROGRESS") {
          const file = filesRef.current[0];
          if (file && msg.receivedSize) {
            setProgress(Math.min((msg.receivedSize / file.size) * 100, 99));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    ws.onmessage = async (event) => {
      if (typeof event.data !== "string") return;

      const msg = JSON.parse(event.data);

      if (msg.type === "peer_connected") {
        console.log("Receiver connected to room. Initializing WebRTC.");
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
            { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" }
          ]
        });
        pcRef.current = pc;

        pc.onicecandidate = (e) => {
          if (e.candidate) sendMessage({ type: "ice-candidate", candidate: e.candidate });
        };

        pc.onconnectionstatechange = () => console.log("WebRTC State:", pc.connectionState);

        const dc = pc.createDataChannel("fileTransfer", { negotiated: true, id: 0 });
        dcRef.current = dc;

        dc.onopen = () => {
          console.log("WebRTC DataChannel OPEN.");
          clearTimeout(fallbackTimeout);
          useFallbackRef.current = false;
          setConnectionType("WebRTC (Direct P2P)");
          dc.send(JSON.stringify({ type: "HELLO" }));
        };

        dc.onmessage = (e) => handleDataMessage(e.data);

        fallbackTimeout = setTimeout(() => {
          if (dc.readyState !== "open") {
            console.log("WebRTC Timeout (3s). Activating WebSocket Fallback.");
            useFallbackRef.current = true;
            setConnectionType("WebSocket (Relay)");
            sendMessage({ type: "HELLO" });
          }
        }, 3000);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendMessage({ type: "offer", offer });

      } else if (msg.type === "answer") {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(msg.answer));
      } else if (msg.type === "ice-candidate") {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(console.error);
      } else if (msg.type === "peer_disconnected") {
        if (stepRef.current === "done") return;
        setErrorMsg("The receiver cancelled or disconnected from the transfer.");
        setStep("error");
      } else if (msg.type === "error") {
        if (stepRef.current === "done") return;
        console.error("Signaling error:", msg.message);
        setErrorMsg(msg.message || "An error occurred during signaling.");
        setStep("error");
      } else if (["HELLO", "READY", "ACK", "PROGRESS"].includes(msg.type)) {
        handleDataMessage(event.data);
      }
    };

    let isCleanedUp = false;
    ws.onerror = () => {
      if (isCleanedUp) return;
      if (stepRef.current === "done" || stepRef.current === "error") return;
      setErrorMsg("Failed to connect to the signaling server.");
      setStep("error");
    };

    return () => {
      isCleanedUp = true;
      releaseWakeLock();
      ws.close();
      pcRef.current?.close();
    };
  }, [shareCode]);

  // Page exit protection during transfer
  useEffect(() => {
    if (step !== "transferring") return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Transfer in progress. Are you sure you want to leave?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step]);

  const totalBytes = files.reduce((a, f) => a + f.size, 0);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) { setFiles([dropped[0]]); setStep("ready"); }
  }, []);
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(e.target.files ?? []);
    if (chosen.length) { setFiles([chosen[0]]); setStep("ready"); }
  };

  const performCopy = async (text: string, setter: (val: boolean) => void) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        try { document.execCommand("copy"); } catch (err) { console.error(err); }
        textArea.remove();
      }
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const copyCode = () => performCopy(shareCode, setCopied);

  const reset = () => {
    setStep("idle");
    setFiles([]);
    setProgress(0);
    setConnectionType("Connecting...");
    setErrorMsg("");
    clearFiles();
    setShareCode(genCode());
  };

  const startSend = () => {
    setStep("waiting");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 pt-10 pb-20"
      style={{ background: "var(--color-paper)" }}
    >
      <ThemeToggle />

      <div className="w-full max-w-xl mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearFiles();
            router.push("/");
          }}
          iconLeft={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back
        </Button>
      </div>

      {/* Mascot */}
      <motion.div
        className="flex flex-col items-center gap-2 mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <DogMascot state={mascotState(step)} size={280} />
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-[15px] font-medium text-center"
            style={{ color: "var(--color-ink-3)" }}
          >
            {mascotCaption(step, errorMsg)}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Card */}
      <motion.div
        className="w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", boxShadow: "var(--shadow-lg)" }}
        >
          {/* Header */}
          <div className="px-6 py-4" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
            <h1 className="text-[16px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
              Send files
            </h1>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-5">
            <AnimatePresence mode="wait">

              {/* Idle / Ready */}
              {(step === "idle" || step === "ready") && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">

                  {/* Only show dropzone if no files are selected */}
                  {files.length === 0 && (
                    <div
                      onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className="relative flex flex-col items-center justify-center gap-3 py-10 rounded-lg cursor-pointer"
                      style={{
                        background: isDragging ? "var(--color-accent-soft)" : "var(--color-paper)",
                        border: `2px dashed ${isDragging ? "var(--color-accent)" : "var(--color-border)"}`,
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--color-accent-soft)", border: "1.5px solid var(--color-accent)" }}
                      >
                        <Upload className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                      </div>
                      <div className="text-center">
                        <p className="text-[15px] font-semibold" style={{ color: "var(--color-ink)" }}>
                          {isDragging ? "Release to drop" : "Drop a file here"}
                        </p>
                        <p className="text-[13px] mt-0.5" style={{ color: "var(--color-ink-3)" }}>or click to browse</p>
                      </div>
                      <input ref={fileInputRef} type="file" className="hidden" onChange={onFileInput} />
                    </div>
                  )}

                  {files.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {files.map((f, i) => (
                        <FileRow key={i} file={f} onRemove={() => {
                          const next = files.filter((_, j) => j !== i);
                          setFiles(next);
                          if (next.length === 0) setStep("idle");
                        }} />
                      ))}
                      <p className="text-[12px] text-right pr-1" style={{ color: "var(--color-ink-3)" }}>
                        {files.length} file{files.length > 1 ? "s" : ""} · {formatBytes(totalBytes)}
                      </p>
                    </div>
                  )}

                  {files.length > 0 && (
                    <Button
                      onClick={startSend}
                      iconRight={<ArrowRight className="w-4 h-4" />}
                      className="w-full py-3"
                    >
                      Generate link
                    </Button>
                  )}
                </motion.div>
              )}

              {/* Waiting */}
              {step === "waiting" && (
                <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 py-4">
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <p className="text-[16px] font-semibold" style={{ color: "var(--color-ink)" }}>Waiting for your friend…</p>
                    <p className="text-[14px]" style={{ color: "var(--color-ink-3)" }}>Share this link or code:</p>
                  </div>

                  <div className="w-full flex flex-col gap-6 items-center">
                    {/* QR Code */}
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-(--color-border)">
                      <QRCodeSVG value={shareUrl} size={140} level="M" />
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-sm">
                      <div
                        className="flex items-center gap-3 px-5 py-3 rounded-lg"
                        style={{ background: "var(--color-paper)", border: "1.5px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}
                      >
                        <span className="flex-1 text-center text-[22px] font-bold tracking-[0.15em]" style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}>
                          {shareCode}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={copyCode}
                          className="w-9 h-9 p-0"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>

                      <div
                        className="flex items-center gap-3 px-5 py-3 rounded-lg"
                        style={{ background: "var(--color-paper)", border: "1.5px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}
                      >
                        <span className="flex-1 text-center text-[12px] font-bold tracking-[0.15em]" style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}>{shareUrl}</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => performCopy(shareUrl, setCopiedUrl)}
                          className="w-9 h-9 p-0"
                        >
                          {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Transferring */}
              {step === "transferring" && (
                <motion.div key="transferring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col md:flex-row items-center gap-10 py-6">
                  {/* Left: Circular Progress */}
                  <div className="relative flex flex-col items-center gap-4">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="96" cy="96" r="84"
                          stroke="var(--color-surface-2)" strokeWidth="12" fill="transparent"
                        />
                        <motion.circle
                          cx="96" cy="96" r="84"
                          stroke="var(--color-accent)" strokeWidth="12" fill="transparent"
                          strokeLinecap="round"
                          strokeDasharray={528}
                          initial={{ strokeDashoffset: 528 }}
                          animate={{ strokeDashoffset: 528 - (528 * progress) / 100 }}
                          transition={{ duration: 0.4 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                        <span className="text-[32px] font-bold" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                          {Math.round(progress)}%
                        </span>
                        <div className="flex flex-col mt-1 items-center w-[120px] overflow-hidden">
                          <span className="text-[12px] font-medium truncate w-full text-center" style={{ color: "var(--color-ink)" }}>
                            {files[0]?.name}
                          </span>
                          <span className="text-[10px]" style={{ color: "var(--color-ink-3)" }}>
                            {formatBytes(files[0]?.size || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4">
                    <TransferWarning connectionType={connectionType} />
                  </div>
                </motion.div>
              )}

              {/* Done */}
              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 py-4 text-center">
                  <div>
                    <p className="text-[20px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>All files sent!</p>
                    <p className="text-[14px] mt-1" style={{ color: "var(--color-ink-3)" }}>Transfer complete. No trace left on any server.</p>
                  </div>
                  <Button
                    onClick={reset}
                    variant="primary"
                    size="md"
                  >
                    Send another
                  </Button>
                </motion.div>
              )}

              {/* Error */}
              {step === "error" && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 py-4 text-center">
                  <div>
                    <p className="text-[16px] font-semibold" style={{ color: "var(--color-error)" }}>Something went wrong</p>
                    <p className="text-[13px] mt-1" style={{ color: "var(--color-ink-3)" }}>
                      {errorMsg || "Could not connect. Check the code and try again."}
                    </p>
                  </div>
                  <Button onClick={reset} variant="secondary">
                    Try again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {(step === "waiting" || step === "transferring") && (
        <Button variant="ghost" size="sm" onClick={reset} iconLeft={<RefreshCw className="w-3.5 h-3.5" />} className="mt-4">
          Cancel
        </Button>
      )}
    </div>

  );
}

export default function SendPage() {
  return (
    <div className="w-full">
      <Suspense>
        <SendContent />
      </Suspense>
      <WaveDivider />
    </div>
  );
}
