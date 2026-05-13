import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Horizon",
  description: "Manage portfolio and uploads.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-white/20">
      {children}
    </div>
  );
}
