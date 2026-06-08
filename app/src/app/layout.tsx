import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/locale-context";
import { TopNav } from "@/components/top-nav";

export const metadata: Metadata = {
  title: "Frontier Agentic AI Platform",
  description: "Impact Sizing → Design methodology engine for consulting teams",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-[14px] text-foreground antialiased">
        <LocaleProvider>
          <TopNav />
          <main className="mx-auto max-w-[1440px] px-6 py-8">{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
