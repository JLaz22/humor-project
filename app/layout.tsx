import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punchline — NYC moments, AI punchlines",
  description: "Turn real New York moments into AI-generated captions, then vote on what actually hits.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-950 text-zinc-100">
        <SiteHeader user={user} />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-white/10 bg-ink px-6 py-7 text-sm text-cream/45">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-5">
            <p>Punchline <span className="text-lime">●</span> Human moments, machine wit.</p>
            <div className="flex gap-5"><Link href="/privacy" className="transition hover:text-cream">Privacy</Link><Link href="/terms" className="transition hover:text-cream">Terms</Link></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
