"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lightbox from "./Lightbox";
import { usePhotos } from "@/context/PhotoContext";
import { Eye } from "lucide-react";

const ALL_TAGS = ["全部", "自然", "城市", "夜景", "電影感", "底片風"];

import Image from "next/image";

interface GalleryProps {
  isMobile?: boolean;
}

export default function Gallery({ isMobile }: GalleryProps) {
  const { photos } = usePhotos();
  const [activeTag, setActiveTag] = useState("全部");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const filteredPhotos = photos.filter(
    (photo) => activeTag === "全部" || photo.tags.includes(activeTag)
  );

  return (
    <section id="portfolio" className="pt-40 pb-24 px-6 max-w-[1600px] mx-auto min-h-screen">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-6 py-2 rounded-full text-sm tracking-widest transition-all duration-300 ${
              activeTag === tag
                ? "bg-white text-black"
                : "bg-transparent text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-500"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <motion.div 
        layout={!isMobile}
        className="relative columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
      >
        <AnimatePresence>
          {filteredPhotos.map((photo) => {
            const originalIndex = photos.findIndex((p) => p.id === photo.id);
            return (
              <motion.div
                layout={!isMobile}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                key={photo.id}
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-md bg-neutral-900"
                onClick={() => setSelectedPhotoIndex(originalIndex)}
              >
                {isMobile ? (
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    width={800}
                    height={800}
                    quality={85}
                    style={{ width: "100%", height: "auto" }}
                    sizes="100vw"
                    className="transition-transform duration-700 ease-out group-hover:scale-105"
                    unoptimized={photo.url.includes("unsplash.com")}
                  />
                ) : (
                  <img
                    src={photo.url}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-medium tracking-wide mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {photo.title}
                  </h3>
                  <div className="flex justify-between items-center w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    <p className="text-neutral-300 text-sm tracking-wider">
                      {photo.location}
                    </p>
                    <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 tracking-wider bg-neutral-950/60 backdrop-blur-md py-1 px-2.5 rounded-full border border-white/5 shadow-lg">
                      <Eye className="w-3 h-3 text-neutral-400 animate-pulse" />
                      <span className="tabular-nums font-semibold">{(photo.views || 0).toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <Lightbox
            photos={photos}
            currentIndex={selectedPhotoIndex}
            onClose={() => setSelectedPhotoIndex(null)}
            onNavigate={(newIndex) => setSelectedPhotoIndex(newIndex)}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
