"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader } from "@/components/ui/Loader";

export default function RedirectPage() {
  const router = useRouter();
  const params = useParams();
  const code = params?.code as string;

  useEffect(() => {
    if (code) {
      router.replace(`/receive?code=${code.toUpperCase()}`);
    } else {
      router.replace("/");
    }
  }, [code, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--color-paper)" }}>
      <Loader size="lg" />
      <p className="text-[14px] font-medium" style={{ color: "var(--color-ink-3)" }}>
        Finding your friend...
      </p>
    </div>
  );
}
