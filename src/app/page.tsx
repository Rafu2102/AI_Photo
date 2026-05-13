import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Gallery from "@/components/home/Gallery";
import About from "@/components/home/About";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Gallery />
      <About />
      
      {/* Minimal Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-neutral-500 text-sm tracking-widest uppercase">
        © {new Date().getFullYear()} Horizon Aerial. All Rights Reserved.
      </footer>
    </main>
  );
}
