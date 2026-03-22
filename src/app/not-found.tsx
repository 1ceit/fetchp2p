"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import DogMascot from "@/components/ui/DogMascot";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 gap-8"
      style={{ background: "var(--color-paper)" }}
    >
      <ThemeToggle />

      <div className="flex flex-col items-center text-center">
        <DogMascot state="error" size={280} />

        <div className="flex flex-col gap-6">
          <h1
            className="text-[6rem] font-bold leading-none"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            404
          </h1>
          <h2
            className="text-[20px] font-semibold"
            style={{ color: "var(--color-ink-2)" }}
          >
            Oops! I think we&apos;re lost.
          </h2>
          <p
            className="text-[14px] max-w-xs"
            style={{ color: "var(--color-ink-3)" }}
          >
            I sniffed everywhere but couldn&apos;t find that page. Maybe it was moved?
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mb-56">
        <Button
          onClick={() => router.back()}
          variant="secondary"
          size="lg"
          className="flex-1"
          iconLeft={<ArrowLeft className="w-4 h-4" />}
        >
          Go back
        </Button>
        <Button
          onClick={() => router.push("/")}
          variant="primary"
          size="lg"
          className="flex-1"
          iconLeft={<Home className="w-4 h-4" />}
        >
          Home
        </Button>
      </div>
    </div>
  );
}
