import type { Metadata } from "next";
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
      <body className="min-h-full bg-zinc-950 text-zinc-100">
        <SiteHeader user={user} />
        {children}
      </body>
    </html>
  );
}
