"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ArrowLeft, ArrowRight, DownloadCloud } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DogMascot,
  ThemeToggle,
  TransferWarning,
  Button,
  WaveDivider,
  Loader,
  type MascotState
} from "@/components/ui";
import { formatBytes } from "@/lib/utils";

type Step = "idle" | "ready" | "connecting" | "prompting" | "transferring" | "done" | "error";


function mascotState(step: Step): MascotState {
  if (step === "transferring") return "transferring";
  if (step === "prompting") return "waiting";
  if (step === "connecting") return "waiting";
  if (step === "done") return "done";
  if (step === "error") return "error";
  return "idle";
}

function mascotCaption(step: Step, errorMsg?: string): string {
  if (step === "idle") return "Enter the code and I'll fetch your files!";
  if (step === "ready") return "Looks good - go ahead and connect!";
  if (step === "connecting") return "Sniffing out the connection...";
  if (step === "transferring") return "Fetching your files!";
  if (step === "done") return "Got it! Files received! 🎉";
  if (step === "error" && errorMsg?.includes("disconnected")) return "Uh oh... the sender left!";
  if (step === "error" && errorMsg?.includes("found")) return "Couldn't find that one. Check the code?";
  if (step === "error") return "Uh oh... something went wrong.";
  return "";
}

function ReceiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code")?.toUpperCase() ?? "";

  const [receiveCode, setReceiveCode] = useState(initialCode);
  const [step, setStep] = useState<Step>(initialCode ? "ready" : "idle");
  const [progress, setProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [fileMeta, setFileMeta] = useState<{ name: string, size: number } | null>(null);
  const [showLargeFileWarning, setShowLargeFileWarning] = useState(false);
  const [connectionType, setConnectionType] = useState<string>("Connecting...");
  const wsRef = useRef<WebSocket | null>(null);

  const stepRef = useRef(step);
  useEffect(() => { stepRef.current = step; }, [step]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLockRef = useRef<any>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const lastProgressUpdateRef = useRef<number>(0);
  const lastSpeedTimestampRef = useRef<number>(0);
  const lastSpeedBytesRef = useRef<number>(0);

  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  if (initialCode && initialCode !== prevInitialCode) {
    setPrevInitialCode(initialCode);
    setReceiveCode(initialCode);
    setStep("ready");
  }

  // Page exit protection during transfer
  useEffect(() => {
    // Only warn if we are in the middle of active transferring
    if (step !== "transferring" || progress >= 100) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Transfer in progress. Are you sure you want to leave?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step, progress]);

  const reset = () => {
    setStep("idle");
    setReceiveCode("");
    setProgress(0);
    setTransferSpeed(0);
    setErrorMsg("");
    setFileMeta(null);
    setShowLargeFileWarning(false);
    setConnectionType("Connecting...");
    wsRef.current?.close();
    pcRef.current?.close();
    if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => { wakeLockRef.current = null; }).catch(() => { });
    }
  };

  const startReceive = () => {
    if (!receiveCode.trim()) return;
    wsRef.current?.close();
    pcRef.current?.close();
    setStep("connecting");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host; // includes port

    let wsUrl = "";
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      wsUrl = `ws://${window.location.hostname}:9000/peerjs/`;
    } else {
      wsUrl = `${protocol}//${host}/peerjs/`;
    }
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    const sendMessage = (msg: unknown) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
    };

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && !wakeLockRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
          console.log("Wake Lock active");
        }
      } catch (err) {
        console.error("Wake Lock error:", err);
      }
    };

    ws.onopen = () => {
      console.log("WebSocket connected. Joining room:", receiveCode);
      sendMessage({ type: "join", code: receiveCode.toUpperCase(), role: "receiver" });

      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) sendMessage({ type: "ping" });
      }, 20000);
      ws.addEventListener("close", () => clearInterval(pingInterval));
    };

    let receiveBuffer: Uint8Array[] = [];
    let currentMeta: { size: number; fileType: string; name: string } | null = null;
    let expectedSize = 0;
    let receivedSize = 0;

    const handleDataMessage = (data: unknown) => {
      if (data instanceof ArrayBuffer || data instanceof Blob) {
        const processChunk = async (chunk: ArrayBuffer | Blob) => {
          const buffer = chunk instanceof Blob ? await chunk.arrayBuffer() : chunk;

          const byteLength = buffer.byteLength;
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "CHUNK",
              shareCode: receiveCode.toUpperCase(),
              chunk: buffer
            }, [buffer]);
          } else {
            receiveBuffer.push(new Uint8Array(buffer));
          }

          receivedSize += byteLength;
          if (expectedSize > 0) {
            const currentPct = (receivedSize / expectedSize) * 100;
            setProgress(Math.min(currentPct, 99));

            if (receivedSize - lastProgressUpdateRef.current > 1024 * 1024 || currentPct % 5 < 0.1) {
              lastProgressUpdateRef.current = receivedSize;
              const feedback = JSON.stringify({ type: "PROGRESS", receivedSize });
              if (dcRef.current?.readyState === "open") dcRef.current.send(feedback);
              else if (ws.readyState === WebSocket.OPEN) ws.send(feedback);
            }

            const now = Date.now();
            if (now - lastSpeedTimestampRef.current > 500) {
              const bytesDiff = receivedSize - lastSpeedBytesRef.current;
              const timeDiff = now - lastSpeedTimestampRef.current;
              const speedBps = (bytesDiff / timeDiff) * 1000;
              setTransferSpeed(speedBps);
              lastSpeedTimestampRef.current = now;
              lastSpeedBytesRef.current = receivedSize;
            }
          }
        };
        processChunk(data);
        return;
      }

      try {
        const msg = typeof data === "string" ? JSON.parse(data) : data;
        if (msg.type === "HELLO") {
          console.log("Received HELLO from sender. Waiting for user to accept.");
          if (msg.fileMeta) {
            setFileMeta({ name: msg.fileMeta.name, size: msg.fileMeta.size });
            if (msg.fileMeta.size > 100 * 1024 * 1024 && !(navigator.serviceWorker && navigator.serviceWorker.controller)) {
              setShowLargeFileWarning(true);
            }
          }
          setStep("prompting");
        } else if (msg.type === "FILE_META") {
          console.log("Incoming file meta:", msg);
          requestWakeLock();
          currentMeta = msg;
          expectedSize = msg.size;
          receiveBuffer = [];
          receivedSize = 0;
          lastSpeedTimestampRef.current = Date.now();
          lastSpeedBytesRef.current = 0;
          setTransferSpeed(0);

          // Notify Service Worker of new stream
          const isStreaming = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
          if (isStreaming) {
            navigator.serviceWorker.controller?.postMessage({
              type: "METADATA",
              shareCode: receiveCode.toUpperCase(),
              fileName: msg.name,
              fileSize: msg.size,
              fileType: msg.fileType
            });
          }

          currentMeta = msg;
          expectedSize = msg.size;
          receiveBuffer = [];
        } else if (msg.type === "EOF") {
          console.log("Received EOF. Finalizing...");

          setProgress(100);

          if (wakeLockRef.current) {
            wakeLockRef.current.release().then(() => { wakeLockRef.current = null; }).catch(() => { });
          }

          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "EOF",
              shareCode: receiveCode.toUpperCase()
            });
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = `/download-stream?shareCode=${receiveCode.toUpperCase()}`;
            document.body.appendChild(iframe);
            setTimeout(() => document.body.removeChild(iframe), 2000);
          } else {
            const blob = new Blob(receiveBuffer as unknown as BlobPart[], { type: currentMeta?.fileType || "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = currentMeta?.name || "download";
            a.click();
            URL.revokeObjectURL(url);
          }

          const ack = JSON.stringify({ type: "ACK" });
          if (dcRef.current?.readyState === "open") dcRef.current.send(ack);
          else ws.send(ack);

          setTimeout(() => setStep("done"), 600);
        }
      } catch (err) {
        console.error("Message parsing error:", err);
      }
    };

    ws.onmessage = async (event) => {
      if (typeof event.data !== "string") {
        handleDataMessage(event.data);
        return;
      }

      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }

      if (msg.type === "offer") {
        console.log("Received WebRTC Offer.");
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
            { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" }
          ]
        });
        pcRef.current = pc;

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            sendMessage({ type: "ice-candidate", candidate: e.candidate });
          }
        };

        pc.onconnectionstatechange = () => console.log("WebRTC State:", pc.connectionState);

        pc.ondatachannel = (e) => {
          const dc = e.channel;
          dcRef.current = dc;
          dc.binaryType = "arraybuffer";

          dc.onopen = () => console.log("WebRTC DataChannel OPEN.");
          dc.onmessage = (ev) => handleDataMessage(ev.data);
        };

        await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));

        for (const c of pendingCandidates.current) {
          pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
        }
        pendingCandidates.current = [];

        const answer = await pc.createAnswer();

        await pc.setLocalDescription(answer);
        sendMessage({ type: "answer", answer });

      } else if (msg.type === "ice-candidate") {
        if (pcRef.current?.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(console.error);
        } else {
          pendingCandidates.current.push(msg.candidate);
        }
      } else if (msg.type === "peer_disconnected") {
        if (stepRef.current === "done") return;
        setErrorMsg("The sender disconnected from the transfer.");
        setStep("error");
      } else if (msg.type === "error") {
        if (stepRef.current === "done") return;
        console.error("Signaling error:", msg.message);
        setErrorMsg(msg.message || "An error occurred during signaling.");
        setStep("error");
      } else if (["HELLO", "FILE_META", "EOF"].includes(msg.type)) {
        handleDataMessage(msg);
      }
    };

    ws.onerror = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => { });
        wakeLockRef.current = null;
      }
      if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) return;
      if (stepRef.current === "done" || stepRef.current === "error") return;
      setErrorMsg("Failed to connect to the signaling server.");
      setStep("error");
    };
  };

  const handleAccept = () => {
    console.log("User accepted. Signaling READY.");
    const reply = JSON.stringify({ type: "READY" });
    if (dcRef.current?.readyState === "open") {
      setConnectionType("WebRTC (Direct P2P)");
      dcRef.current.send(reply);
    } else {
      setConnectionType("WebSocket (Relay)");
      wsRef.current?.send(reply);
    }
    setStep("transferring");
  };

  const handleDecline = () => {
    console.log("User declined. Disconnecting.");
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "peer_disconnected" }));
    }
    reset();
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
          onClick={() => router.push("/")}
          iconLeft={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back
        </Button>
      </div>

      <motion.div
        className="flex flex-col items-center gap-2 mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <DogMascot state={mascotState(step)} size={280} receiver={true} />
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-[13px] font-medium text-center"
            style={{ color: "var(--color-ink-3)" }}
          >
            {mascotCaption(step, errorMsg)}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
            boxShadow: "var(--shadow-lg)"
          }}
        >
          <div className="px-6 py-4" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
            <h1 className="text-[16px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
              Receive files
            </h1>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <AnimatePresence mode="wait">
              {(step === "idle" || step === "ready") && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
                  <div className="flex flex-col items-center gap-1.5 text-center py-4">
                    <p className="text-[15px] font-semibold" style={{ color: "var(--color-ink)" }}>Enter the drop code</p>
                    <p className="text-[13px]" style={{ color: "var(--color-ink-3)" }}>Ask the sender for their 5-character code</p>
                  </div>
                  <input
                    value={receiveCode}
                    onChange={(e) => {
                      setReceiveCode(e.target.value.toUpperCase());
                      setStep(e.target.value.length > 0 ? "ready" : "idle");
                    }}
                    placeholder="XXXXX"
                    maxLength={5}
                    className="w-full text-center py-3.5 rounded-md text-[20px] font-bold tracking-[0.18em] focus:outline-none focus:border-(--color-accent)"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "var(--color-paper)",
                      color: "var(--color-ink)",
                      border: "1.5px solid var(--color-border)",
                    }}
                  />
                  <Button
                    onClick={startReceive}
                    disabled={receiveCode.length < 5}
                    iconRight={<ArrowRight className="w-4 h-4" />}
                    className="w-full py-3"
                  >
                    Connect
                  </Button>
                </motion.div>
              )}

              {step === "connecting" && (
                <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-1.5 mb-2">
                    <p className="text-[16px] font-semibold mb-4" style={{ color: "var(--color-ink)" }}>Connecting to peer</p>
                    <Loader variant="dots" size="md" />
                  </div>
                  <p className="text-[13px] max-w-sm px-4" style={{ color: "var(--color-ink-3)" }}>Establishing encrypted channel. This could take a few seconds depending on your connection.</p>
                </motion.div>
              )}

              {/* Transferring */}
              {step === "prompting" && fileMeta && (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                  <h2 className="text-[20px] font-bold mb-2 tracking-tight text-center" style={{ color: "var(--color-ink)" }}>
                    Incoming File
                  </h2>
                  <div className="flex flex-col items-center mb-8 max-w-[280px]">
                    <span className="text-[14px] font-medium truncate w-full text-center" style={{ color: "var(--color-ink-2)" }} title={fileMeta.name}>
                      {fileMeta.name}
                    </span>
                    <span className="text-[13px] mt-1" style={{ color: "var(--color-ink-3)" }}>
                      {formatBytes(fileMeta.size)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 w-full max-w-[280px]">
                    <Button variant="primary" size="lg" onClick={handleAccept}>
                      <DownloadCloud className="w-5 h-5 mr-2" /> Accept & Download
                    </Button>
                    <Button variant="ghost" size="lg" onClick={handleDecline}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {step === "transferring" && (
                <motion.div key="transferring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 py-4">

                  {showLargeFileWarning && (
                    <div
                      className="w-full flex items-start gap-3 p-4 rounded-xl mb-4"
                      style={{ background: "rgba(239, 68, 68, 0.08)", border: "1.5px solid rgba(239, 68, 68, 0.2)" }}
                    >
                      <div className="shrink-0 text-red-500 mt-0.5"></div>
                      <div className="flex flex-col">
                        <p className="text-[13px] font-bold" style={{ color: "var(--color-error)" }}>Insecure Connection Warning</p>
                        <p className="text-[12px] leading-normal mt-0.5" style={{ color: "var(--color-ink-2)" }}>
                          Local connections without HTTPS prevent us from streaming data directly to your disk. This forces your browser to buffer the entire {formatBytes(fileMeta?.size || 0)} in memory, which will likely crash this tab. For large files, we strongly recommend using an encrypted (HTTPS) connection.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row items-center gap-10">
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center px-4">
                          <span className="text-[32px] font-bold leading-tight" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                            {Math.round(progress)}%
                          </span>
                          {fileMeta ? (
                            <div className="flex flex-col mt-1 items-center w-[120px] overflow-hidden">
                              <span className="text-[12px] font-medium truncate w-full" style={{ color: "var(--color-ink)" }} title={fileMeta.name}>
                                {fileMeta.name}
                              </span>
                              <span className="text-[10px]" style={{ color: "var(--color-ink-3)" }}>
                                {formatBytes(fileMeta.size)} • {formatBytes(transferSpeed)}/s
                              </span>
                            </div>
                          ) : (
                            <span className="text-[12px] font-medium" style={{ color: "var(--color-ink-3)" }}>
                              Receiving...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                      <TransferWarning connectionType={connectionType} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 py-4 text-center">
                  <div>
                    <p className="text-[20px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>Files received!</p>
                    <p className="text-[14px] mt-1" style={{ color: "var(--color-ink-3)" }}>Files saved to your device successfully.</p>
                  </div>
                  <Button onClick={reset} variant="primary">
                    Receive another
                  </Button>
                </motion.div>
              )}

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

      {(step === "connecting" || step === "transferring") && (
        <Button variant="ghost" size="sm" onClick={reset} iconLeft={<RefreshCw className="w-3.5 h-3.5" />} className="mt-4">
          Cancel
        </Button>
      )}
    </div>
  );
}

export default function ReceivePage() {
  return (
    <div className="w-full">
      <Suspense>
        <ReceiveContent />
      </Suspense>
      <WaveDivider />
    </div>
  );
}
