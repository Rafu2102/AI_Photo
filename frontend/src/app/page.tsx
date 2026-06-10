import { headers } from "next/headers";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Gallery from "@/components/home/Gallery";
import About from "@/components/home/About";
import BackToTop from "@/components/common/BackToTop";
import Footer from "@/components/layout/Footer";

export default async function Home() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero isMobile={isMobile} />
      <Gallery isMobile={isMobile} />
      <About isMobile={isMobile} />
      
      <BackToTop />
      
      <Footer />
    </main>
  );
}
