"use client";

import { usePhotos } from "@/context/PhotoContext";
import { Eye } from "lucide-react";

export default function Footer() {
  const { siteViews } = usePhotos();

  return (
    <footer className="py-16 border-t border-white/5 bg-black/40 backdrop-blur-md relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="text-white text-lg font-bold tracking-[0.3em] uppercase">Horizon Aerial</span>
          <p className="text-neutral-500 text-xs tracking-widest uppercase font-light">
            © {new Date().getFullYear()} Horizon Aerial. All Rights Reserved.
          </p>
        </div>
        
        {/* Glassmorphic Live Counter Widget */}
        <div className="glass-card px-6 py-3 rounded-full flex items-center gap-4 border border-white/10 shadow-2xl bg-neutral-900/40 backdrop-blur-xl transition-all duration-500 hover:border-white/20">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-neutral-400 tracking-[0.2em] uppercase font-semibold">Live System Status</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-neutral-400 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-widest tabular-nums">
              {siteViews.toLocaleString()}
            </span>
            <span className="text-[10px] text-neutral-400 tracking-[0.15em] uppercase font-light">Views</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
