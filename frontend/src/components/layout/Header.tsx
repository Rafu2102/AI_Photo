"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { Camera, Globe, Mail, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { name: "作品集", href: "#portfolio" },
    { name: "關於我", href: "#about" },
  ];

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-colors duration-300",
        isScrolled ? "glass" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Camera className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
          <span className="font-semibold text-lg tracking-widest uppercase text-white">
            Horizon
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Socials & Login (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">
            <Globe className="w-5 h-5" />
          </a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">
            <Mail className="w-5 h-5" />
          </a>
          <div className="w-[1px] h-4 bg-neutral-700 mx-2" />
          <Link
            href="/admin"
            className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
          >
            管理後台
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-20 left-0 w-full glass-card border-t border-white/10 p-6 flex flex-col gap-6 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg uppercase tracking-wider text-white"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <a href="#" className="text-white">
              <Globe className="w-6 h-6" />
            </a>
            <a href="#" className="text-white">
              <Mail className="w-6 h-6" />
            </a>
            <Link href="/admin" className="text-sm uppercase tracking-widest text-white ml-auto">
              管理後台
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
