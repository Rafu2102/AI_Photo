"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

import { usePhotos } from "@/context/PhotoContext";

import Image from "next/image";

export default function Hero() {
  const { settings } = usePhotos();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black"
    >
      {/* Dynamic Background Image with Parallax */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay for text contrast */}
        <Image
          src={settings.coverPhoto}
          alt="首頁封面背景"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          unoptimized={settings.coverPhoto.includes("unsplash.com")}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-6 text-glow flex flex-col gap-6">
            <span>提升</span>
            <span>您的視野</span>
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="max-w-xl"
        >
          <p className="text-lg md:text-xl text-neutral-300 font-light tracking-wide leading-relaxed">
            從令人屏息的視角探索世界。 <br className="hidden md:block" />
            頂級空拍攝影，呈現地球的極致之美。
          </p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-[0.3em] text-white/70">向下捲動探索</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-white/70" />
        </motion.div>
      </motion.div>
    </div>
  );
}
