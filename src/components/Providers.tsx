"use client";

import { PhotoProvider } from "@/context/PhotoContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <PhotoProvider>{children}</PhotoProvider>;
}
