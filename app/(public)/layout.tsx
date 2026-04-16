// Bare layout for public-facing pages — no Nav, no Footer
// Uses an HTML shell without the shared site chrome
import type { Metadata } from "next";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
