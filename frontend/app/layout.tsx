import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/lib/toast";

export const metadata: Metadata = {
  title: "Fireflies Clone",
  description: "A Fireflies.ai-inspired meeting notes platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
