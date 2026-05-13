"use client";

import { motion } from "framer-motion";
import { usePhotos } from "@/context/PhotoContext";

export default function About() {
  const { settings } = usePhotos();

  return (
    <section id="about" className="py-24 px-6 max-w-7xl mx-auto min-h-screen flex items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Image Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden"
        >
          <img
            src={settings.aboutImage}
            alt="攝影師介紹照"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        {/* Text Side */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col justify-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-wider text-white leading-tight mb-8 whitespace-pre-line">
            {settings.aboutTitle}
          </h2>
          
          <div className="w-16 h-[1px] bg-white/30 mb-10" />
          
          <div className="space-y-8 text-neutral-300 leading-[2.2] tracking-widest font-light text-lg md:text-xl">
            {settings.aboutDescription.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
