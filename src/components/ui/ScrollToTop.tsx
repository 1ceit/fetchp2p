"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "./Button";

export default function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.div
          className="hidden md:block fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={scrollToTop}
            variant="secondary"
            size="lg"
            className="shadow-2xl p-3! rounded-full border border-(--color-surface) hover:scale-110 active:scale-95 group transition-all"
            aria-label="Scroll to top"
            iconLeft={
              <ArrowUp
                size={20}
                style={{ color: "var(--color-ink)" }}
              />
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
