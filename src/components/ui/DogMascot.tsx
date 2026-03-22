"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import confetti from "canvas-confetti";
import walkingDogData from "../../../public/Dog/walkingDog.json";
import StandingDogData from "../../../public/Dog/StandingDog.json";

export type MascotState = "idle" | "waiting" | "transferring" | "done" | "error";

interface DogMascotProps {
  state: MascotState;
  size?: number;
  receiver?: boolean;
}

export default function DogMascot({ state, size = 180, receiver = false }: DogMascotProps) {
  const didConfetti = useRef(false);

  useEffect(() => {
    if (state === "done" && !didConfetti.current) {
      didConfetti.current = true;

      const timer = setTimeout(() => {
        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            origin: { y: 0.65 },
            ...opts,
            particleCount: Math.floor(200 * particleRatio),
          });
        };
        fire(0.25, { spread: 26, startVelocity: 55, colors: ["#d4672c", "#e07838", "#f5c08a"] });
        fire(0.2, { spread: 60, colors: ["#d4672c", "#ffd700", "#ff69b4"] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#d4672c", "#c0392b", "#f39c12"] });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ["#d4672c", "#ffd700"] });
        fire(0.1, { spread: 120, startVelocity: 45, colors: ["#d4672c", "#ff69b4", "#ffd700"] });
      }, 50);

      return () => clearTimeout(timer);
    }
    if (state !== "done") {
      didConfetti.current = false;
    }
  }, [state]);

  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center select-none"
    >
      {state === "transferring" ? (
        <Lottie
          animationData={walkingDogData}
          loop
          style={{ width: size, height: size, transform: receiver ? "scaleX(1)" : "scaleX(-1)" }}
        />
      ) : state === "waiting" ? (
        <Lottie
          animationData={StandingDogData}
          loop
          style={{ width: size, height: size, transform: receiver ? "scaleX(1)" : "scaleX(-1)" }}
        />
      ) : state === "done" ? (
        <Image
          src="/Dog/DogSittingCeli.png"
          alt="Celebrating dog"
          width={size - 80}
          height={size - 80}
          style={{ objectFit: "contain", pointerEvents: "none" }}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          priority
        />
      ) : state === "error" ? (
        <Image
          src="/Dog/DogSadSitting.png"
          alt="Sad dog"
          width={size - 100}
          height={size - 100}
          style={{ objectFit: "contain", pointerEvents: "none" }}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          priority
        />
      ) : (
        /* idle — waving */
        <Image
          src="/Dog/DogSittingWaving.png"
          alt="Dog mascot waving"
          width={size - 120}
          height={size - 120}
          style={{ objectFit: "contain", pointerEvents: "none" }}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          priority
        />
      )}
    </div>
  );
}
