"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 p-4 md:p-5 rounded-full bg-white/40 hover:bg-white/60 border border-white/50 text-white shadow-2xl backdrop-blur-md transition-all group flex items-center justify-center"
          aria-label="回到頂部"
        >
          <ArrowUp className="w-6 h-6 md:w-8 md:h-8 group-hover:-translate-y-2 transition-transform duration-300 drop-shadow-md" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
