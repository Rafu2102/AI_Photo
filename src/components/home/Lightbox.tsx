"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  title: string;
  location: string;
  exif: string;
  tags: string[];
}

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  isMobile?: boolean;
}

export default function Lightbox({ photos, currentIndex, onClose, onNavigate, isMobile }: LightboxProps) {
  const photo = photos[currentIndex];

  const handlePrevious = useCallback(() => {
    onNavigate(currentIndex === 0 ? photos.length - 1 : currentIndex - 1);
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate(currentIndex === photos.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, photos.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handlePrevious, handleNext]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2 text-neutral-400 hover:text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation Controls */}
      <button
        onClick={handlePrevious}
        className="absolute left-6 z-50 p-3 text-neutral-400 hover:text-white transition-colors hidden md:block"
      >
        <ChevronLeft className="w-10 h-10" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-6 z-50 p-3 text-neutral-400 hover:text-white transition-colors hidden md:block"
      >
        <ChevronRight className="w-10 h-10" />
      </button>

      {/* Image Container */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12" onClick={onClose}>
        {isMobile ? (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full h-[70vh] flex items-center justify-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photo.url}
              alt={photo.title}
              fill
              className="object-contain"
              unoptimized={photo.url.includes("unsplash.com")}
            />
          </motion.div>
        ) : (
          <motion.img
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            src={photo.url}
            alt={photo.title}
            className="max-w-full max-h-[85vh] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        
        {/* EXIF Info overlay (bottom) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-6 md:bottom-12 left-0 right-0 flex justify-center pointer-events-none"
        >
          <div className="glass-card px-6 py-4 rounded-xl flex flex-col items-center gap-1">
            <h2 className="text-white text-lg font-medium tracking-wider">{photo.title}</h2>
            <p className="text-neutral-300 text-sm">{photo.location}</p>
            <div className="flex items-center gap-2 mt-2 text-neutral-400 text-xs tracking-widest">
              <Info className="w-3 h-3" />
              <span>{photo.exif}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Swipe Areas (Optional, but using standard buttons for now) */}
    </motion.div>
  );
}
