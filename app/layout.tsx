import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punchline — Supabase Joke Collection",
  description: "A members-only joke collection built with Supabase auth.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-950 text-zinc-100">
        <SiteHeader user={user} />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-white/10 px-6 py-6 text-sm text-zinc-500">
          <div className="mx-auto flex max-w-5xl gap-5">
            <Link href="/privacy" className="transition hover:text-zinc-200">Privacy</Link>
            <Link href="/terms" className="transition hover:text-zinc-200">Terms</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
