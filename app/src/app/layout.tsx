import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/locale-context";
import { TopNav } from "@/components/top-nav";

export const metadata: Metadata = {
  title: "Agentic Workflow Playbook",
  description: "Impact Sizing → Design methodology engine for consulting teams",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <LocaleProvider>
          <TopNav />
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
